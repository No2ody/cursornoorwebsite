import { NextRequest, NextResponse } from 'next/server'
import { validateInput, commonSchemas } from '@/lib/validation'
import { withErrorHandling } from '@/lib/error-handling'
import { OptimizedQueries } from '@/lib/optimized-queries'
import { z } from 'zod'

const ITEMS_PER_PAGE = 12

// Input validation schema for GET products
const getProductsSchema = z.object({
  page: commonSchemas.page,
  category: commonSchemas.id.optional(),
  search: z.string().max(100).optional(),
  minPrice: z.number().min(0).max(1000000).default(0),
  maxPrice: z.number().min(0).max(1000000).default(999999),
  brands: z.array(z.string().max(50)).max(20).default([]),
  rating: z.number().min(1).max(5).optional(),
  availability: z.enum(['in-stock', 'out-of-stock']).optional(),
  sort: z.enum(['name-asc', 'name-desc', 'price-asc', 'price-desc', 'rating-desc', 'newest']).default('newest'),
})

export const GET = withErrorHandling(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url)
  
  // Validate and sanitize input parameters
  const rawParams = {
    page: parseInt(searchParams.get('page') || '1'),
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    minPrice: parseFloat(searchParams.get('minPrice') || '0'),
    maxPrice: parseFloat(searchParams.get('maxPrice') || '999999'),
    brands: searchParams.get('brands')?.split(',').filter(Boolean) || [],
    rating: searchParams.get('rating') ? parseFloat(searchParams.get('rating')!) : undefined,
    availability: searchParams.get('availability') || undefined,
    sort: searchParams.get('sort') || 'newest',
  }
  
  const validation = validateInput(getProductsSchema, rawParams)
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: validation.errors },
      { status: 400 }
    )
  }
  
  const { page, category, search, minPrice, maxPrice, brands, rating, availability, sort } = validation.data!

  // Use optimized query service
  const result = await OptimizedQueries.searchProducts({
    query: search,
    categoryId: category,
    minPrice,
    maxPrice,
    brands,
    inStock: availability === 'in-stock',
    page,
    limit: ITEMS_PER_PAGE,
    sortBy: sort === 'newest' ? 'newest' : 
           sort === 'price-asc' ? 'price_asc' :
           sort === 'price-desc' ? 'price_desc' :
           sort === 'rating-desc' ? 'rating' : 'newest'
  })

  // Apply rating filter if specified
  let filteredProducts = result.products
  if (rating) {
    filteredProducts = result.products.filter(product => 
      product.averageRating >= rating
    )
  }

  return NextResponse.json({
    products: filteredProducts,
    total: result.totalCount,
    totalPages: result.totalPages,
    currentPage: result.currentPage,
    hasNextPage: result.hasNextPage,
    hasPreviousPage: result.hasPreviousPage,
    perPage: ITEMS_PER_PAGE
  })
})
