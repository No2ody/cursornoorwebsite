'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-card border-0 bg-white">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
            >
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </motion.div>
            <CardTitle className="text-2xl font-bold text-ink">Something went wrong</CardTitle>
            <CardDescription className="text-gray-600">
              An unexpected error occurred. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <Button
                onClick={reset}
                className="w-full h-12 bg-brand hover:bg-brand-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                asChild
                variant="outline"
                className="w-full h-12 border-brand text-brand hover:bg-brand-50"
              >
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-4 bg-gray-50 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
