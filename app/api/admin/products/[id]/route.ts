import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  price: z.number().min(0.01, 'Price must be greater than 0').optional(),
  stock: z.number().int().min(0, 'Stock must be 0 or greater').optional(),
  categoryId: z.string().min(1, 'Category ID is required').optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required').optional(),
})

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!product) {
      return new NextResponse('Product not found', { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('[ADMIN_PRODUCT_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = updateProductSchema.parse(body)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    })

    if (!existingProduct) {
      return new NextResponse('Product not found', { status: 404 })
    }

    // Check if category exists (if categoryId is being updated)
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId }
      })

      if (!category) {
        return new NextResponse('Category not found', { status: 400 })
      }
    }

    // Update the product
    const product = await prisma.product.update({
      where: { id },
      data: validatedData,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('[ADMIN_PRODUCT_PUT]', error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse(`Validation error: ${error.errors[0].message}`, { 
        status: 400 
      })
    }
    
    if (error instanceof Error) {
      return new NextResponse(`Error: ${error.message}`, { status: 500 })
    }
    
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    })

    if (!existingProduct) {
      return new NextResponse('Product not found', { status: 404 })
    }

    // Check if product has associated orders
    if (existingProduct._count.orderItems > 0) {
      return new NextResponse(
        'Cannot delete product with existing orders. Consider marking it as out of stock instead.',
        { status: 400 }
      )
    }

    // Delete the product
    await prisma.product.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[ADMIN_PRODUCT_DELETE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
