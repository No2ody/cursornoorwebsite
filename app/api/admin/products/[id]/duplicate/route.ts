import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
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

    // Get the original product
    const originalProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    })

    if (!originalProduct) {
      return new NextResponse('Product not found', { status: 404 })
    }

    // Create a duplicate with modified name
    const duplicatedProduct = await prisma.product.create({
      data: {
        name: `${originalProduct.name} (Copy)`,
        description: originalProduct.description,
        price: originalProduct.price,
        stock: 0, // Start with 0 stock for duplicated products
        categoryId: originalProduct.categoryId,
        images: originalProduct.images,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ product: duplicatedProduct })
  } catch (error) {
    console.error('[ADMIN_PRODUCT_DUPLICATE]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
