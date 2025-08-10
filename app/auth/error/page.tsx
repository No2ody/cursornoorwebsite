'use client'

import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
  CredentialsSignin: 'Invalid email or password. Please check your credentials and try again.',
  EmailSignin: 'Unable to send email. Please check your email address.',
  OAuthSignin: 'Error occurred during OAuth sign in.',
  OAuthCallback: 'Error occurred during OAuth callback.',
  OAuthCreateAccount: 'Could not create OAuth account.',
  EmailCreateAccount: 'Could not create email account.',
  Callback: 'Error occurred during callback.',
  OAuthAccountNotLinked: 'To confirm your identity, sign in with the same account you used originally.',
  SessionRequired: 'Please sign in to access this page.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 px-4 py-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='w-full max-w-md'
      >
        <Card className='shadow-xl border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader className='text-center pb-8'>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className='mx-auto flex items-center gap-3 mb-4'
            >
              <Image
                src='/images/NoorAlTayseer_logo.png'
                alt='Noor AlTayseer'
                width={48}
                height={48}
                className='object-contain rounded-lg'
              />
              <div className='text-left'>
                <h1 className='text-xl font-bold text-blue-900'>Noor AlTayseer</h1>
                <p className='text-sm text-gray-600'>Building & Construction</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className='mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4'
            >
              <AlertTriangle className='w-8 h-8 text-red-600' />
            </motion.div>
            <CardTitle className='text-2xl font-bold text-gray-900'>Authentication Error</CardTitle>
            <CardDescription className='text-gray-600'>
              Something went wrong during sign in
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <Alert variant='destructive'>
              <AlertTriangle className='h-4 w-4' />
              <AlertDescription className='text-sm'>
                {errorMessage}
              </AlertDescription>
            </Alert>

            {error === 'CredentialsSignin' && (
              <div className='text-sm text-gray-600 bg-blue-50 p-4 rounded-lg border border-blue-200'>
                <p className='font-medium text-blue-800 mb-2'>Demo Accounts:</p>
                <p><strong>Admin:</strong> admin@nooraltayseer.com / admin123</p>
                <p><strong>Customer:</strong> user@nooraltayseer.com / user123</p>
              </div>
            )}

            <div className='flex flex-col gap-3'>
              <Button
                asChild
                className='w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
              >
                <Link href='/auth/signin'>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Try Again
                </Link>
              </Button>
              
              <Button
                asChild
                variant='outline'
                className='w-full h-12'
              >
                <Link href='/'>
                  <Home className='w-4 h-4 mr-2' />
                  Back to Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
