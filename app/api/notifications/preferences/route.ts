import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { NotificationPreferences } from '@/lib/notification-service'
import { z } from 'zod'

const preferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
  orderUpdates: z.boolean().optional(),
  promotionalOffers: z.boolean().optional(),
  priceAlerts: z.boolean().optional(),
  securityAlerts: z.boolean().optional(),
  systemNotifications: z.boolean().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const preferences = await NotificationPreferences.getUserPreferences(session.user.id)

    return NextResponse.json({ preferences })

  } catch (error) {
    console.error('Error fetching notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = preferencesSchema.parse(body)

    const preferences = await NotificationPreferences.updateUserPreferences(
      session.user.id,
      validatedData
    )

    return NextResponse.json({
      preferences,
      message: 'Notification preferences updated successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating notification preferences:', error)
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    )
  }
}
