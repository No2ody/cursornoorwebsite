import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
  categoryId: z.string().min(1, 'Category ID is required'),
  brandId: z.string().optional(),
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
})

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = createProductSchema.parse(body)

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: validatedData.categoryId }
    })

    if (!category) {
      return new NextResponse('Category not found', { status: 400 })
    }

    // Create the product
    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        stock: validatedData.stock,
        categoryId: validatedData.categoryId,
        brandId: validatedData.brandId || null,
        images: validatedData.images,
      },
      include: {
        category: {
          select: {
            name: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_POST]', error)
    
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

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'name'

    const skip = (page - 1) * limit

    // Build where clause
    const where: Record<string, unknown> = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }
    
    if (category && category !== 'all') {
      where.category = { name: { contains: category, mode: 'insensitive' } }
    }

    // Build orderBy clause
    let orderBy: Record<string, string> = { name: 'asc' }
    switch (sort) {
      case 'name-desc':
        orderBy = { name: 'desc' }
        break
      case 'price':
        orderBy = { price: 'asc' }
        break
      case 'price-desc':
        orderBy = { price: 'desc' }
        break
      case 'created':
        orderBy = { createdAt: 'asc' }
        break
      case 'created-desc':
        orderBy = { createdAt: 'desc' }
        break
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              name: true,
            },
          },
          brand: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              orderItems: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    return NextResponse.json({
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error('[ADMIN_PRODUCTS_GET]', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}
