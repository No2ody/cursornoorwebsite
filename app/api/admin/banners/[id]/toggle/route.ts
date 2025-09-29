import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const toggleSchema = z.object({
  isActive: z.boolean()
})

export async function PATCH(
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
    
    // Validate input
    const { isActive } = toggleSchema.parse(body)
    
    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id }
    })

    if (!existingBanner) {
      return NextResponse.json({ error: 'Banner not found' }, { status: 404 })
    }

    // Update banner status
    const banner = await prisma.banner.update({
      where: { id },
      data: { isActive }
    })

    return NextResponse.json({ 
      banner,
      message: `Banner ${isActive ? 'activated' : 'deactivated'} successfully` 
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    
    console.error('Error toggling banner:', error)
    return NextResponse.json(
      { error: 'Failed to toggle banner status' },
      { status: 500 }
    )
  }
}
