import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
  try {
    // Future enhancement: could filter results based on current category/search
    // const { searchParams } = new URL(request.url)
    // const category = searchParams.get('category')
    // const search = searchParams.get('search')

    // Get all categories with product counts
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get price range
    const priceStats = await prisma.product.aggregate({
      _min: {
        price: true
      },
      _max: {
        price: true
      }
    })

    // Get brands (extracted from product names/descriptions)
    const products = await prisma.product.findMany({
      select: {
        name: true,
        description: true
      }
    })

    // Extract brands from product data
    const brandSet = new Set<string>()
    const commonBrands = [
      'Noor AlTayseer', 'Phillips', 'Philips', 'Osram', 'Schneider', 
      'Legrand', 'ABB', 'Siemens', 'GE', 'Panasonic', 'Samsung',
      'LG', 'Toshiba', 'Mitsubishi', 'Honeywell', 'Bosch'
    ]

    products.forEach(product => {
      const text = `${product.name} ${product.description || ''}`.toLowerCase()
      commonBrands.forEach(brand => {
        if (text.includes(brand.toLowerCase())) {
          brandSet.add(brand)
        }
      })
    })

    // Get brand counts
    const brands = await Promise.all(
      Array.from(brandSet).map(async (brand) => {
        const count = await prisma.product.count({
          where: {
            OR: [
              {
                name: {
                  contains: brand,
                  mode: 'insensitive'
                }
              },
              {
                description: {
                  contains: brand,
                  mode: 'insensitive'
                }
              }
            ]
          }
        })
        return { name: brand, count }
      })
    )

    // Filter out brands with 0 products and sort by count
    const filteredBrands = brands
      .filter(brand => brand.count > 0)
      .sort((a, b) => b.count - a.count)

    // Get rating distribution
    const ratingDistribution = await prisma.product.findMany({
      include: {
        reviews: {
          select: {
            rating: true
          }
        }
      }
    })

    const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    ratingDistribution.forEach(product => {
      if (product.reviews.length > 0) {
        const avgRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        const roundedRating = Math.round(avgRating)
        if (roundedRating >= 1 && roundedRating <= 5) {
          ratingCounts[roundedRating as keyof typeof ratingCounts]++
        }
      }
    })

    // Get availability counts
    const availabilityStats = await prisma.product.groupBy({
      by: ['stock'],
      _count: {
        stock: true
      }
    })

    const inStock = availabilityStats
      .filter(stat => stat.stock > 0)
      .reduce((sum, stat) => sum + stat._count.stock, 0)
    
    const outOfStock = availabilityStats
      .filter(stat => stat.stock === 0)
      .reduce((sum, stat) => sum + stat._count.stock, 0)

    return NextResponse.json({
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        count: cat._count.products
      })),
      brands: filteredBrands,
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 5000
      },
      ratings: [
        { stars: 5, count: ratingCounts[5] },
        { stars: 4, count: ratingCounts[4] },
        { stars: 3, count: ratingCounts[3] },
        { stars: 2, count: ratingCounts[2] },
        { stars: 1, count: ratingCounts[1] }
      ],
      availability: {
        inStock,
        outOfStock,
        total: inStock + outOfStock
      }
    })
  } catch (error) {
    console.error('Filter API Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
