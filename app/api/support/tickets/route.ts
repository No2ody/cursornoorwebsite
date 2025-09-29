import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'

const createTicketSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  category: z.string().min(1, 'Category is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  orderNumber: z.string().optional(),
  userId: z.string().optional()
})

// Generate ticket number
function generateTicketNumber(): string {
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `TKT-${timestamp}${random}`
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    
    // Validate input
    const validatedData = createTicketSchema.parse(body)
    
    // Generate ticket number
    const ticketNumber = generateTicketNumber()
    
    // Create support ticket (we'll need to add this to the Prisma schema)
    // For now, we'll simulate the creation and send an email
    
    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send email notification to support team
    // 3. Send confirmation email to customer
    
    // Simulate database save
    const ticketData = {
      ticketNumber,
      ...validatedData,
      status: 'open',
      createdAt: new Date(),
      userId: session?.user?.id || null
    }
    
    // TODO: Save to database when SupportTicket model is added to schema
    // const ticket = await prisma.supportTicket.create({
    //   data: ticketData
    // })
    
    // TODO: Send email notifications
    // await sendSupportTicketEmail(ticketData)
    // await sendCustomerConfirmationEmail(ticketData)
    
    console.log('Support ticket created:', ticketData)
    
    return NextResponse.json({
      success: true,
      ticketNumber,
      message: 'Support ticket created successfully'
    })
    
  } catch (error) {
    console.error('Error creating support ticket:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create support ticket' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    // const status = searchParams.get('status')
    
    // TODO: Implement when SupportTicket model is added
    // const tickets = await prisma.supportTicket.findMany({
    //   where: {
    //     userId: session.user.id,
    //     ...(status && { status })
    //   },
    //   orderBy: { createdAt: 'desc' },
    //   skip: (page - 1) * limit,
    //   take: limit
    // })
    
    // For now, return empty array
    return NextResponse.json({
      tickets: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    })
    
  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    )
  }
}
