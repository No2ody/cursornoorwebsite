import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

// Validation schema for banner creation/update
const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  linkUrl: z.string().url('Invalid link URL').optional().or(z.literal('')),
  linkText: z.string().max(50, 'Link text too long').optional(),
  position: z.enum(['HERO', 'SECONDARY', 'SIDEBAR', 'FOOTER']),
  isActive: z.boolean().default(true),
  startDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  endDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
  displayOrder: z.number().int().min(1).max(100).default(1),
})

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (position) {
      where.position = position
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    // Get banners with pagination
    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        orderBy: [
          { position: 'asc' },
          { displayOrder: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.banner.count({ where })
    ])

    // Calculate analytics
    const analytics = await prisma.banner.aggregate({
      _sum: {
        clickCount: true,
        impressions: true,
      },
      _count: {
        id: true,
      },
      where: { isActive: true }
    })

    return NextResponse.json({
      banners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      analytics: {
        totalBanners: total,
        activeBanners: analytics._count.id || 0,
        totalClicks: analytics._sum.clickCount || 0,
        totalImpressions: analytics._sum.impressions || 0,
        averageCTR: analytics._sum.impressions ? 
          ((analytics._sum.clickCount || 0) / analytics._sum.impressions * 100).toFixed(2) : '0.00'
      }
    })

  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = bannerSchema.parse(body)
    
    // Validate date range
    if (validatedData.startDate && validatedData.endDate && 
        validatedData.startDate >= validatedData.endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }

    // Check for display order conflicts
    const existingBanner = await prisma.banner.findFirst({
      where: {
        position: validatedData.position,
        displayOrder: validatedData.displayOrder,
        isActive: true
      }
    })

    if (existingBanner) {
      // Auto-increment display order to avoid conflicts
      const maxOrder = await prisma.banner.aggregate({
        where: { position: validatedData.position },
        _max: { displayOrder: true }
      })
      validatedData.displayOrder = (maxOrder._max.displayOrder || 0) + 1
    }

    // Create banner
    const banner = await prisma.banner.create({
      data: {
        ...validatedData,
        createdBy: session.user.id,
      }
    })

    return NextResponse.json({ 
      banner,
      message: 'Banner created successfully' 
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}
