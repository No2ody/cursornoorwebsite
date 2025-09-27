'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home, Mail, Wrench } from 'lucide-react'
import Link from 'next/link'

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error)
    
    // In production, you might want to send this to an error tracking service
    // like Sentry, LogRocket, or similar
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full shadow-2xl border-0">
            <CardHeader className="text-center bg-gradient-to-br from-red-500 to-red-600 text-white rounded-t-lg">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <AlertTriangle className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Critical System Error
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We&apos;re experiencing a critical system error. Our technical team has been automatically notified.
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
                    <Wrench className="w-4 h-4" />
                    <span className="text-sm font-medium">What you can do:</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Try refreshing the page</li>
                    <li>• Clear your browser cache</li>
                    <li>• Check your internet connection</li>
                    <li>• Contact support if the issue persists</li>
                  </ul>
                </div>

                {/* Error details for development */}
                {process.env.NODE_ENV === 'development' && error.message && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-left">
                    <p className="text-sm font-medium text-red-800 mb-2">Error Details (Development):</p>
                    <code className="text-xs text-red-700 break-all block">
                      {error.message}
                    </code>
                    {error.digest && (
                      <p className="text-xs text-red-600 mt-2">
                        Error ID: {error.digest}
                      </p>
                    )}
                    {error.stack && (
                      <details className="mt-2">
                        <summary className="text-xs text-red-600 cursor-pointer">Stack Trace</summary>
                        <pre className="text-xs text-red-600 mt-1 overflow-auto max-h-32">
                          {error.stack}
                        </pre>
                      </details>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={reset}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Application
                </Button>
                
                <Button 
                  asChild
                  variant="outline"
                  className="w-full border-2 border-gray-300 hover:border-gray-400"
                >
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Return to Homepage
                  </Link>
                </Button>
              </div>

              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">
                  Need immediate assistance?
                </p>
                <div className="space-y-2">
                  <Button 
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Link href="mailto:info@nooraltayseer.com">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Link>
                  </Button>
                  <p className="text-xs text-gray-400">
                    Our team typically responds within 1 hour during business hours
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  )
}