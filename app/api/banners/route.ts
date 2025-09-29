import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const limit = parseInt(searchParams.get('limit') || '10')

    // Build where clause for active banners
    const now = new Date()
    const where: Record<string, unknown> = {
      isActive: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } }
      ],
      AND: [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: now } }
          ]
        }
      ]
    }

    if (position) {
      where.position = position.toUpperCase()
    }

    // Get active banners
    const banners = await prisma.banner.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        linkUrl: true,
        linkText: true,
        position: true,
        displayOrder: true,
      }
    })

    // Track impressions (in a real app, you might want to batch this)
    if (banners.length > 0) {
      const bannerIds = banners.map(b => b.id)
      await prisma.banner.updateMany({
        where: {
          id: { in: bannerIds }
        },
        data: {
          impressions: {
            increment: 1
          }
        }
      })
    }

    return NextResponse.json({
      banners,
      total: banners.length
    })

  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

// Track banner clicks
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bannerId } = body

    if (!bannerId) {
      return NextResponse.json(
        { error: 'Banner ID is required' },
        { status: 400 }
      )
    }

    // Update click count
    await prisma.banner.update({
      where: { id: bannerId },
      data: {
        clickCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error tracking banner click:', error)
    return NextResponse.json(
      { error: 'Failed to track click' },
      { status: 500 }
    )
  }
}
