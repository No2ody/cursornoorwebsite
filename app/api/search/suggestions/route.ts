import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface Suggestion {
  id: string
  text: string
  type: 'product' | 'category' | 'brand' | 'keyword'
  count?: number
  image?: string
  price?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '8')
    
    if (!query.trim() || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const cleanQuery = query.trim().toLowerCase()
    const searchTerms = cleanQuery.split(/\s+/).filter(term => term.length > 0)
    const suggestions: Suggestion[] = []

    // Build search conditions for products with improved matching
    const productSearchConditions: Prisma.ProductWhereInput[] = [
      {
        name: {
          contains: cleanQuery,
          mode: 'insensitive'
        }
      },
      {
        name: {
          startsWith: cleanQuery,
          mode: 'insensitive'
        }
      }
    ]

    // Add category matches
    productSearchConditions.push({
      category: {
        name: {
          contains: cleanQuery,
          mode: 'insensitive'
        }
      }
    })

    // Handle common variations (plural/singular, spacing)
    const normalizedQuery = cleanQuery.replace(/\s+/g, '')
    const variations = []
    
    if (normalizedQuery.endsWith('s')) {
      variations.push(normalizedQuery.slice(0, -1)) // Remove 's'
    } else {
      variations.push(normalizedQuery + 's') // Add 's'
    }
    
    // Handle specific cases like "bath tub" vs "bathtub"
    if (normalizedQuery.includes('bath') && normalizedQuery.includes('tub')) {
      variations.push('bathtub', 'bathtubs')
    }
    
    variations.forEach(variation => {
      productSearchConditions.push(
        {
          name: {
            contains: variation,
            mode: 'insensitive'
          }
        },
        {
          category: {
            name: {
              contains: variation,
              mode: 'insensitive'
            }
          }
        }
      )
    })

    // Add multi-term search conditions (more restrictive)
    if (searchTerms.length > 1) {
      // Products that contain all search terms (AND logic)
      productSearchConditions.push({
        AND: searchTerms.map(term => ({
          OR: [
            {
              name: {
                contains: term,
                mode: 'insensitive'
              }
            },
            {
              category: {
                name: {
                  contains: term,
                  mode: 'insensitive'
                }
              }
            }
          ]
        }))
      })
    } else {
      // Single word: add individual term match
      productSearchConditions.push({
        name: {
          contains: searchTerms[0],
          mode: 'insensitive'
        }
      })
    }

    // Get product suggestions
    const products = await prisma.product.findMany({
      where: {
        OR: productSearchConditions
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true
      },
      take: 4,
      orderBy: [
        {
          name: 'asc'
        }
      ]
    })

    products.forEach(product => {
      suggestions.push({
        id: product.id,
        text: product.name,
        type: 'product',
        image: product.images[0],
        price: product.price
      })
    })

    // Get category suggestions
    const categorySearchConditions: Prisma.CategoryWhereInput[] = [
      {
        name: {
          contains: cleanQuery,
          mode: 'insensitive'
        }
      }
    ]

    // Add multi-term search for categories
    if (searchTerms.length > 1) {
      categorySearchConditions.push({
        OR: searchTerms.map(term => ({
          name: {
            contains: term,
            mode: 'insensitive'
          }
        }))
      })
    }

    const categories = await prisma.category.findMany({
      where: {
        OR: categorySearchConditions
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            products: true
          }
        }
      },
      take: 3,
      orderBy: {
        name: 'asc'
      }
    })

    categories.forEach(category => {
      suggestions.push({
        id: category.id,
        text: category.name,
        type: 'category',
        count: category._count.products
      })
    })

    // Add brand suggestions
    const commonBrands = [
      'Noor AlTayseer', 'Phillips', 'Philips', 'Osram', 'Schneider', 
      'Legrand', 'ABB', 'Siemens', 'GE', 'Panasonic'
    ]

    const matchingBrands = commonBrands.filter(brand => {
      const brandLower = brand.toLowerCase()
      // Check if brand contains the full query or any of the search terms
      return brandLower.includes(cleanQuery) || 
             searchTerms.some(term => brandLower.includes(term))
    }).slice(0, 2)

    matchingBrands.forEach(brand => {
      suggestions.push({
        id: brand.toLowerCase().replace(/\s+/g, '-'),
        text: brand,
        type: 'brand'
      })
    })

    // Add keyword suggestions
    const keywords = [
      'led ceiling lights',
      'bathroom vanity lights',
      'pendant lights kitchen',
      'outdoor wall lights',
      'smart light switches',
      'chandelier dining room',
      'bathroom mirror lights',
      'track lighting',
      'recessed lighting',
      'wall sconces',
      'floor lamps',
      'table lamps',
      'string lights',
      'flood lights',
      'security lights'
    ]

    const matchingKeywords = keywords
      .filter(keyword => {
        // Check if keyword contains the full query or any of the search terms
        return keyword.includes(cleanQuery) || 
               searchTerms.some(term => keyword.includes(term))
      })
      .slice(0, 3)

    matchingKeywords.forEach((keyword, index) => {
      suggestions.push({
        id: `keyword-${index}`,
        text: keyword,
        type: 'keyword'
      })
    })

    // Sort suggestions by relevance
    const sortedSuggestions = suggestions
      .sort((a, b) => {
        // Prioritize exact matches
        const aExact = a.text.toLowerCase().startsWith(cleanQuery) ? 1 : 0
        const bExact = b.text.toLowerCase().startsWith(cleanQuery) ? 1 : 0
        
        if (aExact !== bExact) return bExact - aExact
        
        // Then by type priority
        const typePriority = { product: 4, category: 3, brand: 2, keyword: 1 }
        return typePriority[b.type] - typePriority[a.type]
      })
      .slice(0, limit)

    return NextResponse.json({ 
      suggestions: sortedSuggestions,
      query: cleanQuery
    })
    
  } catch (error) {
    console.error('Search Suggestions Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch suggestions',
        suggestions: []
      },
      { status: 500 }
    )
  }
}
