import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for banner updates
const bannerUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  linkUrl: z.string().url('Invalid link URL').optional().or(z.literal('')),
  linkText: z.string().max(50, 'Link text too long').optional(),
  position: z.enum(['HERO', 'SECONDARY', 'SIDEBAR', 'FOOTER']).optional(),
  isActive: z.boolean().optional(),
  startDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  displayOrder: z.number().int().min(1).max(100).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    const banner = await prisma.banner.findUnique({
      where: { id }
    })

    if (!banner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    return NextResponse.json({ banner })

  } catch (error) {
    console.error('Error fetching banner:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banner' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id }
    })

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    // Validate input
    const validatedData = bannerUpdateSchema.parse(body)
    
    // Validate date range if both dates are provided
    if (validatedData.startDate && validatedData.endDate && 
        validatedData.startDate >= validatedData.endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Check for display order conflicts if position or order is being changed
    if (validatedData.position || validatedData.displayOrder) {
      const position = validatedData.position || existingBanner.position
      const displayOrder = validatedData.displayOrder || existingBanner.displayOrder
      
      const conflictingBanner = await prisma.banner.findFirst({
        where: {
          id: { not: id },
          position: position,
          displayOrder: displayOrder,
          isActive: true
        }
      })

      if (conflictingBanner) {
        return NextResponse.json(
          { error: `Display order ${displayOrder} is already taken for ${position} position` },
          { status: 400 }
        )
      }
    }

    // Update banner
    const banner = await prisma.banner.update({
      where: { id },
      data: validatedData
    })

    return NextResponse.json({ 
      banner,
      message: 'Banner updated successfully' 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error updating banner:', error)
    return NextResponse.json(
      { error: 'Failed to update banner' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    
    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id }
    })

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    // Delete banner
    await prisma.banner.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Banner deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting banner:', error)
    return NextResponse.json(
      { error: 'Failed to delete banner' },
      { status: 500 }
    )
  }
}
