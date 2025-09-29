import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { KYCService } from '@/lib/kyc-service'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const progress = await KYCService.getOnboardingProgress(session.user.id)
    
    if (!progress) {
      return NextResponse.json({ error: 'Onboarding session not found' }, { status: 404 })
    }

    return NextResponse.json({ progress })

  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch onboarding progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { accountType } = body

    if (!accountType || !['INDIVIDUAL', 'BUSINESS'].includes(accountType)) {
      return NextResponse.json(
        { error: 'Valid account type is required' },
        { status: 400 }
      )
    }

    const onboardingSession = await KYCService.initializeOnboarding(
      session.user.id,
      accountType
    )

    return NextResponse.json({ 
      onboardingSession,
      message: 'Onboarding initialized successfully' 
    })

  } catch (error) {
    console.error('Error initializing onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to initialize onboarding' },
      { status: 500 }
    )
  }
}
