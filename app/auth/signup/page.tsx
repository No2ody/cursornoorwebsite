import { Suspense } from 'react'
import { AuthForm } from '@/components/auth/auth-form'
import { Skeleton } from '@/components/ui/skeleton'

function SignUpContent() {
  return <AuthForm mode="signup" />
}

function SignUpSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-gold-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card p-8">
          <div className="text-center mb-6">
            <Skeleton className="h-12 w-12 rounded-lg mx-auto mb-4" />
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpSkeleton />}>
      <SignUpContent />
    </Suspense>
  )
}
