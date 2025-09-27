'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Mail } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full card-enhanced">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 display-font">
            Oops! Something went wrong
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-600 leading-relaxed">
              We encountered an unexpected error. Don&apos;t worry, our team has been notified and we&apos;re working to fix it.
            </p>
            
            {/* Error details for development */}
            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                <p className="text-sm font-medium text-red-800 mb-2">Error Details:</p>
                <code className="text-xs text-red-700 break-all">
                  {error.message}
                </code>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Button 
              onClick={reset}
              className="w-full btn-brand"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="w-full"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
          </div>

          <div className="text-center pt-4 border-t">
            <p className="text-sm text-gray-500 mb-3">
              Need help? Contact our support team
            </p>
            <Button 
              asChild
              variant="ghost"
              size="sm"
              className="text-brand hover:text-brand-700"
            >
              <Link href="mailto:info@nooraltayseer.com">
                <Mail className="w-4 h-4 mr-2" />
                info@nooraltayseer.com
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}