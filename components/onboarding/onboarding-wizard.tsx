'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Building2,
  FileText,
  Shield,
  Mail,
  Phone,
  Upload,
  Eye,
  // ArrowRight,
  // ArrowLeft
} from 'lucide-react'
import { PersonalInfoForm } from './personal-info-form'
// import { BusinessInfoForm } from './business-info-form'
// import { DocumentUploadForm } from './document-upload-form'
// import { VerificationStatus } from './verification-status'
import { useToast } from '@/hooks/use-toast'

interface OnboardingProgress {
  id: string
  currentStep: string
  completedSteps: string[]
  progressPercentage: number
  user: {
    accountType: string
    kycStatus: string
    kybStatus: string
    verificationLevel: string
    emailVerified: boolean
    firstName?: string
    lastName?: string
    phone?: string
  }
  requiredDocuments: string[]
  pendingDocuments: string[]
  canProceed: boolean
}

const STEP_CONFIG = {
  REGISTRATION: {
    title: 'Account Registration',
    description: 'Create your account',
    icon: User,
    order: 1
  },
  EMAIL_VERIFICATION: {
    title: 'Email Verification',
    description: 'Verify your email address',
    icon: Mail,
    order: 2
  },
  PHONE_VERIFICATION: {
    title: 'Phone Verification',
    description: 'Verify your phone number',
    icon: Phone,
    order: 3
  },
  PROFILE_COMPLETION: {
    title: 'Profile Information',
    description: 'Complete your profile',
    icon: User,
    order: 4
  },
  DOCUMENT_UPLOAD: {
    title: 'Document Upload',
    description: 'Upload required documents',
    icon: Upload,
    order: 5
  },
  IDENTITY_VERIFICATION: {
    title: 'Identity Verification',
    description: 'Verify your identity',
    icon: Shield,
    order: 6
  },
  ADDRESS_VERIFICATION: {
    title: 'Address Verification',
    description: 'Verify your address',
    icon: FileText,
    order: 7
  },
  BUSINESS_VERIFICATION: {
    title: 'Business Verification',
    description: 'Verify business information',
    icon: Building2,
    order: 8
  },
  COMPLIANCE_CHECK: {
    title: 'Compliance Check',
    description: 'Final compliance review',
    icon: Eye,
    order: 9
  },
  APPROVAL_PENDING: {
    title: 'Approval Pending',
    description: 'Awaiting final approval',
    icon: Clock,
    order: 10
  },
  COMPLETED: {
    title: 'Completed',
    description: 'Onboarding complete',
    icon: CheckCircle,
    order: 11
  }
}

export function OnboardingWizard() {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState('overview')
  const { toast } = useToast()

  useEffect(() => {
    fetchProgress()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProgress = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/onboarding')
      
      if (response.ok) {
        const data = await response.json()
        setProgress(data.progress)
      } else if (response.status === 404) {
        // No onboarding session found, redirect to account type selection
        setCurrentTab('account-type')
      }
    } catch (error) {
      console.error('Error fetching onboarding progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to load onboarding progress',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const initializeOnboarding = async (accountType: 'INDIVIDUAL' | 'BUSINESS') => {
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType })
      })
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Onboarding initialized successfully'
        })
        await fetchProgress()
        setCurrentTab('overview')
      } else {
        throw new Error('Failed to initialize onboarding')
      }
    } catch (error) {
      console.error('Error initializing onboarding:', error)
      toast({
        title: 'Error',
        description: 'Failed to initialize onboarding',
        variant: 'destructive'
      })
    }
  }

  const getStepStatus = (stepName: string) => {
    if (!progress) return 'pending'
    
    if (progress.completedSteps.includes(stepName)) {
      return 'completed'
    } else if (progress.currentStep === stepName) {
      return 'current'
    } else {
      return 'pending'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'current': return 'text-blue-600 bg-blue-100'
      case 'pending': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getKYCStatusBadge = (status: string) => {
    const statusConfig = {
      NOT_STARTED: { label: 'Not Started', variant: 'secondary' as const },
      IN_PROGRESS: { label: 'In Progress', variant: 'default' as const },
      PENDING_REVIEW: { label: 'Pending Review', variant: 'outline' as const },
      APPROVED: { label: 'Approved', variant: 'default' as const },
      REJECTED: { label: 'Rejected', variant: 'destructive' as const },
      EXPIRED: { label: 'Expired', variant: 'destructive' as const },
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.NOT_STARTED
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brand mb-2">Account Verification</h1>
        <p className="text-gray-600">Complete your account verification to access all features</p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="account-type">Account Type</TabsTrigger>
          <TabsTrigger value="overview" disabled={!progress}>Overview</TabsTrigger>
          <TabsTrigger value="profile" disabled={!progress}>Profile</TabsTrigger>
          <TabsTrigger value="documents" disabled={!progress}>Documents</TabsTrigger>
          <TabsTrigger value="status" disabled={!progress}>Status</TabsTrigger>
        </TabsList>

        {/* Account Type Selection */}
        <TabsContent value="account-type">
          <Card className="shadow-card border-0">
            <CardHeader>
              <CardTitle>Choose Your Account Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-brand"
                  onClick={() => initializeOnboarding('INDIVIDUAL')}
                >
                  <CardContent className="p-6 text-center">
                    <User className="w-12 h-12 text-brand mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Individual Account</h3>
                    <p className="text-gray-600 mb-4">
                      For personal purchases and individual customers
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Personal shopping experience</li>
                      <li>• Standard verification process</li>
                      <li>• Individual payment methods</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-brand"
                  onClick={() => initializeOnboarding('BUSINESS')}
                >
                  <CardContent className="p-6 text-center">
                    <Building2 className="w-12 h-12 text-brand mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Business Account</h3>
                    <p className="text-gray-600 mb-4">
                      For companies, contractors, and business customers
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Bulk pricing and discounts</li>
                      <li>• Business verification required</li>
                      <li>• Credit terms available</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview */}
        <TabsContent value="overview">
          {progress && (
            <div className="space-y-6">
              {/* Progress Overview */}
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Verification Progress</span>
                    <Badge variant="outline">
                      {progress.user.accountType === 'BUSINESS' ? 'Business Account' : 'Individual Account'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-gray-600">{progress.progressPercentage}%</span>
                    </div>
                    <Progress value={progress.progressPercentage} className="h-3" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-brand">{progress.completedSteps.length}</div>
                      <div className="text-sm text-gray-600">Steps Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gold">{progress.pendingDocuments.length}</div>
                      <div className="text-sm text-gray-600">Documents Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {progress.user.kycStatus === 'APPROVED' || progress.user.kybStatus === 'APPROVED' ? '✓' : '○'}
                      </div>
                      <div className="text-sm text-gray-600">Verification Status</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Steps */}
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Verification Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(STEP_CONFIG)
                      .filter(([stepName]) => {
                        // Filter steps based on account type
                        if (progress.user.accountType === 'INDIVIDUAL') {
                          return stepName !== 'BUSINESS_VERIFICATION'
                        }
                        return true
                      })
                      .sort(([, a], [, b]) => a.order - b.order)
                      .map(([stepName, config]) => {
                        const status = getStepStatus(stepName)
                        const IconComponent = config.icon
                        
                        return (
                          <div key={stepName} className="flex items-center space-x-4 p-4 rounded-lg border">
                            <div className={`p-2 rounded-full ${getStatusColor(status)}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{config.title}</h4>
                              <p className="text-sm text-gray-600">{config.description}</p>
                            </div>
                            <div>
                              {status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                              {status === 'current' && <Clock className="w-5 h-5 text-blue-600" />}
                              {status === 'pending' && <AlertCircle className="w-5 h-5 text-gray-400" />}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>

              {/* Current Status */}
              <Card className="shadow-card border-0">
                <CardHeader>
                  <CardTitle>Current Verification Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">KYC Status:</span>
                      {getKYCStatusBadge(progress.user.kycStatus)}
                    </div>
                    {progress.user.accountType === 'BUSINESS' && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium">KYB Status:</span>
                        {getKYCStatusBadge(progress.user.kybStatus)}
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Verification Level:</span>
                      <Badge variant="outline">{progress.user.verificationLevel}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Email Verified:</span>
                      <Badge variant={progress.user.emailVerified ? 'default' : 'secondary'}>
                        {progress.user.emailVerified ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>

                  {progress.pendingDocuments.length > 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You have {progress.pendingDocuments.length} pending document(s) to upload. 
                        Please complete document upload to proceed with verification.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Profile Information */}
        <TabsContent value="profile">
          {progress && (
            <div className="space-y-6">
              {progress.user.accountType === 'INDIVIDUAL' ? (
                <PersonalInfoForm onUpdate={fetchProgress} />
              ) : (
                <div>Business Info Form - Coming Soon</div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Documents */}
        <TabsContent value="documents">
          {progress && (
            <div>Document Upload Form - Coming Soon</div>
          )}
        </TabsContent>

        {/* Status */}
        <TabsContent value="status">
          {progress && (
            <div>Verification Status - Coming Soon</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
