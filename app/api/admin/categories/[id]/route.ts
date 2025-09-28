import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').optional(),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  parentId: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  showInMenu: z.boolean().optional(),
  showInFooter: z.boolean().optional(),
  featuredOrder: z.number().int().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
})

// GET /api/admin/categories/[id] - Get a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            isActive: true,
            sortOrder: true,
          },
          orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' },
          ],
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
          },
          take: 10, // Limit to first 10 products
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    return NextResponse.json({ category })
  } catch (error) {
    console.error('Get Category Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/categories/[id] - Update a category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateCategorySchema.parse(body)

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if slug is being updated and if it conflicts
    if (validatedData.slug && validatedData.slug !== existingCategory.slug) {
      const slugConflict = await prisma.category.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugConflict) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 400 }
        )
      }
    }

    // Check if parent is being updated
    if (validatedData.parentId !== undefined) {
      // Prevent setting self as parent
      if (validatedData.parentId === id) {
        return NextResponse.json(
          { error: 'Category cannot be its own parent' },
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

        // Prevent circular references by checking if the new parent is a descendant
        const isDescendant = await checkIfDescendant(id, validatedData.parentId)
        if (isDescendant) {
          return NextResponse.json(
            { error: 'Cannot set a descendant category as parent (circular reference)' },
            { status: 400 }
          )
        }
      }
    }

    // Check for duplicate name within the same parent (if name or parent is changing)
    if (validatedData.name || validatedData.parentId !== undefined) {
      const newName = validatedData.name || existingCategory.name
      const newParentId = validatedData.parentId !== undefined ? validatedData.parentId : existingCategory.parentId

      const duplicateName = await prisma.category.findFirst({
        where: {
          name: newName,
          parentId: newParentId,
          id: { not: id }, // Exclude current category
        },
      })

      if (duplicateName) {
        return NextResponse.json(
          { error: 'Category name already exists in this parent category' },
          { status: 400 }
        )
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...validatedData,
        ...(validatedData.parentId !== undefined && { parentId: validatedData.parentId || null }),
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

    return NextResponse.json({ category })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Update Category Error:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/categories/[id] - Delete a category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Check if category has products
    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with associated products',
          productCount: existingCategory._count.products 
        },
        { status: 400 }
      )
    }

    // Check if category has children
    if (existingCategory._count.children > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with subcategories',
          childrenCount: existingCategory._count.children 
        },
        { status: 400 }
      )
    }

    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Delete Category Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}

// Helper function to check if a category is a descendant of another
async function checkIfDescendant(categoryId: string, potentialAncestorId: string): Promise<boolean> {
  const descendants = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  })

  for (const descendant of descendants) {
    if (descendant.id === potentialAncestorId) {
      return true
    }
    
    // Recursively check descendants
    const isDescendant = await checkIfDescendant(descendant.id, potentialAncestorId)
    if (isDescendant) {
      return true
    }
  }

  return false
}
