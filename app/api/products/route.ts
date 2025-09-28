import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

const ITEMS_PER_PAGE = 12

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const minPrice = parseFloat(searchParams.get('minPrice') || '0')
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
    const brands = searchParams.get('brands')?.split(',').filter(Boolean) || []
    const rating = searchParams.get('rating')
    const availability = searchParams.get('availability')
    const sort = searchParams.get('sort')

    // Build where clause for filtering
    const whereConditions: Prisma.ProductWhereInput[] = [
      { price: { gte: minPrice } },
      { price: { lte: maxPrice } }
    ]

    // Category filter
    if (category && category !== 'all') {
      whereConditions.push({ categoryId: category })
    }

    // Search filter with improved matching
    if (search) {
      // Normalize search term for better matching
      const searchTerms = search.toLowerCase().split(/\s+/).filter(term => term.length > 0)
      const normalizedSearch = search.toLowerCase().replace(/\s+/g, '')
      
      // Create search conditions
      const searchConditions: any[] = []
      
      // 1. Exact phrase match (highest priority)
      searchConditions.push(
        {
          name: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
        {
          description: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        }
      )
      
      // 2. Category name matches
      searchConditions.push({
        category: {
          name: {
            contains: search,
            mode: 'insensitive' as Prisma.QueryMode,
          },
        },
      })
      
      // 3. Handle common variations (plural/singular, spacing)
      const variations = []
      
      // Plural/singular variations
      if (normalizedSearch.endsWith('s')) {
        variations.push(normalizedSearch.slice(0, -1)) // Remove 's'
      } else {
        variations.push(normalizedSearch + 's') // Add 's'
      }
      
      // Handle specific cases like "bath tub" vs "bathtub"
      if (normalizedSearch.includes('bath') && normalizedSearch.includes('tub')) {
        variations.push('bathtub', 'bathtubs')
      }
      
      // Add variation matches
      variations.forEach(variation => {
        searchConditions.push(
          {
            name: {
              contains: variation,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            description: {
              contains: variation,
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            category: {
              name: {
                contains: variation,
                mode: 'insensitive' as Prisma.QueryMode,
              },
            },
          }
        )
      })
      
      // 4. Multi-word search: require ALL terms to be present (more restrictive)
      if (searchTerms.length > 1) {
        searchConditions.push({
          AND: searchTerms.map(term => ({
            OR: [
              {
                name: {
                  contains: term,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                description: {
                  contains: term,
                  mode: 'insensitive' as Prisma.QueryMode,
                },
              },
              {
                category: {
                  name: {
                    contains: term,
                    mode: 'insensitive' as Prisma.QueryMode,
                  },
                },
              }
            ]
          }))
        })
      } else {
        // Single word: also search individual terms
        searchConditions.push(
          {
            name: {
              contains: searchTerms[0],
              mode: 'insensitive' as Prisma.QueryMode,
            },
          },
          {
            description: {
              contains: searchTerms[0],
              mode: 'insensitive' as Prisma.QueryMode,
            },
          }
        )
      }
      
      whereConditions.push({
        OR: searchConditions,
      })
    }

    // Brand filter
    if (brands.length > 0) {
      whereConditions.push({
        OR: brands.map(brand => ({
          OR: [
            {
              name: {
                contains: brand,
                mode: 'insensitive' as Prisma.QueryMode,
              },
            },
            {
              description: {
                contains: brand,
                mode: 'insensitive' as Prisma.QueryMode,
              },
            },
          ],
        }))
      })
    }

    // Availability filter
    if (availability && availability !== 'all') {
      if (availability === 'in_stock') {
        whereConditions.push({ stock: { gt: 0 } })
      } else if (availability === 'out_of_stock') {
        whereConditions.push({ stock: { lte: 0 } })
      }
    }

    const where: Prisma.ProductWhereInput = {
      AND: whereConditions
    }

    // Build orderBy clause for sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = {}
    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'name_asc':
        orderBy = { name: 'asc' }
        break
      case 'name_desc':
        orderBy = { name: 'desc' }
        break
      default:
        orderBy = { createdAt: 'desc' }
    }

    // Get total count for pagination
    const total = await prisma.product.count({ where })

    // Get products with pagination
    let products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      include: {
        category: true,
        reviews: {
          select: {
            rating: true
          }
        }
      },
    })

    // Apply rating filter (post-query filtering for complex rating calculations)
    if (rating && rating !== 'all') {
      const minRating = parseInt(rating)
      products = products.filter(product => {
        if (product.reviews.length === 0) return false
        const avgRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        return avgRating >= minRating
      })
    }

    return NextResponse.json({
      products,
      total,
      perPage: ITEMS_PER_PAGE,
      page,
    })
  } catch (error) {
    console.error('Products API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
