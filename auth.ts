import NextAuth, { DefaultSession } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import authConfig from './auth.config'
import bcrypt from 'bcryptjs'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import { User } from '@prisma/client'

const prisma = new PrismaClient()

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role?: 'USER' | 'ADMIN'
    } & DefaultSession['user']
    loginMethod?: string // Added for security tracking
    loginTime?: number // Added for security tracking
  }
  interface JWT {
    id: string
    role?: 'USER' | 'ADMIN'
    loginMethod?: string
    loginTime?: number
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  basePath: '/api/auth',
  adapter: PrismaAdapter(prisma),
  session: { 
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour - update session every hour
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production', // Only secure in production
        domain: process.env.NODE_ENV === 'production' ? '.nooraltayseer.com' : undefined,
      },
    },
    callbackUrl: {
      name: `__Secure-next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.nooraltayseer.com' : undefined,
      },
    },
    csrfToken: {
      name: `__Host-next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  ...authConfig,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as User).role
        token.id = user.id
        token.loginTime = Date.now()
        
        // Store login method for security tracking
        if (account) {
          token.loginMethod = account.provider
        }
      }
      
      // Check for session timeout (force re-authentication after 24 hours)
      if (token.loginTime && Date.now() - (token.loginTime as number) > 24 * 60 * 60 * 1000) {
        return {} // This will force a new login
      }
      
      return token
    },
    async session({ session, token, user }) {
      if (session.user && token) {
        session.user.role = token.role as 'USER' | 'ADMIN'
        session.user.id = token.id as string
        
        // Add security metadata (don't expose sensitive info)
        session.loginMethod = token.loginMethod as string
        session.loginTime = token.loginTime as number
      }
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      // Additional security checks during sign-in
      if (account?.provider === 'credentials') {
        // For credential logins, ensure user exists and is active
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, emailVerified: true, role: true }
        })
        
        if (!dbUser) {
          return false
        }
        
        // Could add additional checks here (e.g., account locked, email verified, etc.)
      }
      
      return true
    },
    async redirect({ url, baseUrl }) {
      // Import URL validation
      const { validateRedirectURL, createSafeRedirectURL } = await import('./lib/url-validation')
      
      // Validate the redirect URL
      const validation = validateRedirectURL(url, baseUrl)
      
      if (validation.isValid && validation.sanitizedUrl) {
        // If it's a relative URL, make it absolute
        if (validation.sanitizedUrl.startsWith('/')) {
          return `${baseUrl}${validation.sanitizedUrl}`
        }
        return validation.sanitizedUrl
      }
      
      // Log security warning for invalid redirects
      console.warn('Invalid redirect URL blocked:', {
        url,
        errors: validation.errors,
        baseUrl,
      })
      
      // Return safe fallback
      return baseUrl
    },
  },
})
