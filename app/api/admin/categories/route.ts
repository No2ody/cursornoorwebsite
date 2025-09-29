import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  showInMenu: z.boolean().default(true),
  showInFooter: z.boolean().default(false),
  featuredOrder: z.number().int().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
})

// GET /api/admin/categories - Get all categories with hierarchy
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'
    const parentId = searchParams.get('parentId')
    const flat = searchParams.get('flat') === 'true'

    const whereClause: Record<string, unknown> = {}
    
    if (!includeInactive) {
      whereClause.isActive = true
    }

    if (parentId !== undefined) {
      whereClause.parentId = parentId === 'null' ? null : parentId
    }

    if (flat) {
      // Return flat list with parent info
      const categories = await prisma.category.findMany({
        where: whereClause,
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' },
        ],
      })

      return NextResponse.json({ categories })
    } else {
      // Return hierarchical structure
      const rootCategories = await prisma.category.findMany({
        where: {
          ...whereClause,
          parentId: null,
        },
        include: {
          children: {
            where: includeInactive ? {} : { isActive: true },
            include: {
              children: {
                where: includeInactive ? {} : { isActive: true },
                include: {
                  _count: {
                    select: {
                      products: true,
                      children: true,
                    },
                  },
                },
                orderBy: [
                  { sortOrder: 'asc' },
                  { name: 'asc' },
                ],
              },
              _count: {
                select: {
                  products: true,
                  children: true,
                },
              },
            },
            orderBy: [
              { sortOrder: 'asc' },
              { name: 'asc' },
            ],
          },
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' },
        ],
      })

      return NextResponse.json({ categories: rootCategories })
    }
  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/admin/categories - Create a new category
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createCategorySchema.parse(body)

    // Check if slug already exists
    const existingSlug = await prisma.category.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingSlug) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      )
    }

    // Check if parent exists (if parentId provided)
    if (validatedData.parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: validatedData.parentId },
      })

      if (!parent) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 400 }
        )
      }
    }

    // Check for duplicate name within the same parent
    const duplicateName = await prisma.category.findFirst({
      where: {
        name: validatedData.name,
        parentId: validatedData.parentId || null,
      },
    })

    if (duplicateName) {
      return NextResponse.json(
        { error: 'Category name already exists in this parent category' },
        { status: 400 }
      )
    }

    const category = await prisma.category.create({
      data: {
        ...validatedData,
        parentId: validatedData.parentId || null,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    })

    return NextResponse.json({ category }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Create Category Error:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}
