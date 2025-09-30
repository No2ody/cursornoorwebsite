import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateInput, commonSchemas } from '@/lib/validation'
import { requireAuth, auditLog, applySecurityHeaders } from '@/lib/authorization'
import { z } from 'zod'

const wishlistSchema = z.object({
  productId: commonSchemas.id,
})

export async function GET() {
  try {
    // Require authentication
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: {
        userId: user.id,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const response = NextResponse.json({ wishlistItems })
    return applySecurityHeaders(response)
  } catch (error) {
    console.error('Failed to fetch wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const body = await request.json()
    
    // Validate input
    const validation = validateInput(wishlistSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.errors },
        { status: 400 }
      )
    }
    
    const { productId } = validation.data!

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    })

    if (existingItem) {
      return NextResponse.json(
        { error: 'Product already in wishlist' },
        { status: 400 }
      )
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId,
      },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
    })

    // Audit log the wishlist addition
    await auditLog('ADD_TO_WISHLIST', 'wishlist', wishlistItem.id, user.id, {
      productId,
      productName: product.name,
    })

    const response = NextResponse.json({ wishlistItem })
    return applySecurityHeaders(response)
  } catch (error) {
    console.error('Failed to add to wishlist:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Require authentication
    const authResult = await requireAuth()
    if (authResult instanceof NextResponse) return authResult
    const { user } = authResult

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    // Validate productId format
    const productIdSchema = z.object({ productId: commonSchemas.id })
    const validation = validateInput(productIdSchema, { productId })
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid product ID format', details: validation.errors },
        { status: 400 }
      )
    }

    // Remove from wishlist
    const deletedItem = await prisma.wishlistItem.deleteMany({
      where: {
        userId: user.id,
        productId,
      },
    })

    if (deletedItem.count === 0) {
      return NextResponse.json(
        { error: 'Item not found in wishlist' },
        { status: 404 }
      )
    }

    // Audit log the wishlist removal
    await auditLog('REMOVE_FROM_WISHLIST', 'wishlist', productId, user.id, {
      productId,
    })

    const response = NextResponse.json({ success: true })
    return applySecurityHeaders(response)
  } catch (error) {
    console.error('Failed to remove from wishlist:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
