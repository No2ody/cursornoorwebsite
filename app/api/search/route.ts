import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

interface SearchResult {
  id: string
  name: string
  description: string | null
  price: number
  images: string[]
  category: {
    id: string
    name: string
  }
  relevanceScore: number
  matchType: 'exact' | 'partial' | 'fuzzy' | 'category'
  highlightedName?: string
  highlightedDescription?: string
}

interface SearchResponse {
  results: SearchResult[]
  suggestions: string[]
  totalResults: number
  searchTime: number
  query: string
  correctedQuery?: string
}

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  
  try {
    const limit = parseInt(searchParams.get('limit') || '10')
    const categoryId = searchParams.get('category')
    // const includeCategories = searchParams.get('includeCategories') === 'true'
    
    if (!query.trim()) {
      return NextResponse.json({
        results: [],
        suggestions: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        query: ''
      })
    }

    // Clean and prepare search terms
    const cleanQuery = query.trim().toLowerCase()
    const searchTerms = cleanQuery.split(/\s+/).filter(term => term.length > 0)
    
    // Build search conditions with relevance scoring
    const searchConditions: Prisma.ProductWhereInput[] = []
    
    // Exact name matches (highest priority)
    searchConditions.push({
      name: {
        equals: query,
        mode: 'insensitive'
      }
    })
    
    // Name starts with query
    searchConditions.push({
      name: {
        startsWith: query,
        mode: 'insensitive'
      }
    })
    
    // Name contains full query
    searchConditions.push({
      name: {
        contains: query,
        mode: 'insensitive'
      }
    })
    
    // Name contains all terms (for multi-word searches like "bath tub")
    if (searchTerms.length > 1) {
      searchConditions.push({
        AND: searchTerms.map(term => ({
          name: {
            contains: term,
            mode: 'insensitive'
          }
        }))
      })
    }
    
    // Name contains any term
    searchConditions.push({
      OR: searchTerms.map(term => ({
        name: {
          contains: term,
          mode: 'insensitive'
        }
      }))
    })
    
    // Description contains full query
    searchConditions.push({
      description: {
        contains: query,
        mode: 'insensitive'
      }
    })
    
    // Description contains all terms
    if (searchTerms.length > 1) {
      searchConditions.push({
        AND: searchTerms.map(term => ({
          description: {
            contains: term,
            mode: 'insensitive'
          }
        }))
      })
    }
    
    // Description contains any term
    searchConditions.push({
      OR: searchTerms.map(term => ({
        description: {
          contains: term,
          mode: 'insensitive'
        }
      }))
    })
    
    // Category name contains query or terms
    searchConditions.push({
      category: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      }
    })
    
    if (searchTerms.length > 1) {
      searchConditions.push({
        category: {
          OR: searchTerms.map(term => ({
            name: {
              contains: term,
              mode: 'insensitive'
            }
          }))
        }
      })
    }

    // Category filter
    const whereClause: Prisma.ProductWhereInput = {
      OR: searchConditions,
      ...(categoryId && categoryId !== 'all' ? { categoryId } : {})
    }

    // Execute search
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      take: limit * 2 // Get more results for better scoring
    })

    // Calculate relevance scores and process results
    const scoredResults: SearchResult[] = products.map(product => {
      let score = 0
      let matchType: SearchResult['matchType'] = 'fuzzy'
      
      const productName = product.name.toLowerCase()
      const productDesc = (product.description || '').toLowerCase()
      const categoryName = product.category.name.toLowerCase()
      
      // Exact match (highest score)
      if (productName === cleanQuery) {
        score += 100
        matchType = 'exact'
      }
      // Name starts with query
      else if (productName.startsWith(cleanQuery)) {
        score += 80
        matchType = 'partial'
      }
      // Name contains full query
      else if (productName.includes(cleanQuery)) {
        score += 60
        matchType = 'partial'
      }
      // Check if all search terms are in the name
      else if (searchTerms.length > 1 && searchTerms.every(term => productName.includes(term))) {
        score += 50
        matchType = 'partial'
      }
      // Check if most search terms are in the name
      else if (searchTerms.length > 1) {
        const nameMatches = searchTerms.filter(term => productName.includes(term)).length
        if (nameMatches >= Math.ceil(searchTerms.length * 0.6)) {
          score += 40
          matchType = 'partial'
        }
      }
      
      // Score for individual terms in name
      searchTerms.forEach(term => {
        if (productName.includes(term)) {
          score += 20
          if (matchType === 'fuzzy') matchType = 'partial'
        }
        if (productDesc.includes(term)) {
          score += 10
        }
      })
      
      // Category name match
      if (categoryName.includes(cleanQuery) || searchTerms.some(term => categoryName.includes(term))) {
        score += 30
        if (matchType === 'fuzzy') matchType = 'category'
      }
      
      // Boost for products with reviews (popularity)
      if (product.reviews.length > 0) {
        const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
        score += avgRating * 2
      }
      
      // Highlight matching terms
      const highlightedName = highlightText(product.name, searchTerms)
      const highlightedDescription = product.description ? highlightText(product.description, searchTerms) : undefined
      
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        category: product.category,
        relevanceScore: score,
        matchType,
        highlightedName,
        highlightedDescription
      }
    })

    // Sort by relevance score and limit results
    const sortedResults = scoredResults
      .filter(result => result.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)

    // Generate search suggestions
    const suggestions = await generateSearchSuggestions(cleanQuery, searchTerms)
    
    // Check for typos and suggest corrections
    const correctedQuery = await suggestQueryCorrection(cleanQuery)

    const response: SearchResponse = {
      results: sortedResults,
      suggestions,
      totalResults: sortedResults.length,
      searchTime: Date.now() - startTime,
      query,
      ...(correctedQuery && correctedQuery !== cleanQuery ? { correctedQuery } : {})
    }

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('Search API Error:', error)
    return NextResponse.json(
      { 
        error: 'Search failed',
        results: [],
        suggestions: [],
        totalResults: 0,
        searchTime: Date.now() - startTime,
        query: query || ''
      },
      { status: 500 }
    )
  }
}

// Helper function to highlight matching terms
function highlightText(text: string, terms: string[]): string {
  let highlighted = text
  terms.forEach(term => {
    const regex = new RegExp(`(${term})`, 'gi')
    highlighted = highlighted.replace(regex, '<mark>$1</mark>')
  })
  return highlighted
}

// Generate search suggestions based on existing products
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateSearchSuggestions(query: string, _terms: string[]): Promise<string[]> {
  try {
    // Get popular product names and categories
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        select: { name: true },
        take: 100,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.category.findMany({
        select: { name: true }
      })
    ])

    const suggestions = new Set<string>()
    
    // Add category suggestions
    categories.forEach(cat => {
      if (cat.name.toLowerCase().includes(query)) {
        suggestions.add(cat.name)
      }
    })
    
    // Add product name suggestions
    products.forEach(product => {
      const words = product.name.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.startsWith(query) && word.length > query.length) {
          suggestions.add(word)
        }
      })
    })
    
    // Add common lighting/bathroom terms
    const commonTerms = [
      'led', 'ceiling', 'pendant', 'chandelier', 'wall', 'bathroom', 'kitchen',
      'outdoor', 'smart', 'dimmer', 'switch', 'fixture', 'bulb', 'strip',
      'recessed', 'track', 'flood', 'spot', 'vanity', 'mirror', 'cabinet'
    ]
    
    commonTerms.forEach(term => {
      if (term.startsWith(query) && !suggestions.has(term)) {
        suggestions.add(term)
      }
    })
    
    return Array.from(suggestions).slice(0, 5)
    
  } catch (error) {
    console.error('Error generating suggestions:', error)
    return []
  }
}

// Simple typo correction using Levenshtein distance
async function suggestQueryCorrection(query: string): Promise<string | null> {
  try {
    const commonWords = [
      'lighting', 'ceiling', 'pendant', 'chandelier', 'bathroom', 'kitchen',
      'outdoor', 'indoor', 'modern', 'classic', 'vintage', 'contemporary',
      'fixture', 'switch', 'dimmer', 'smart', 'led', 'halogen', 'fluorescent'
    ]
    
    let bestMatch = null
    let minDistance = Infinity
    
    commonWords.forEach(word => {
      const distance = levenshteinDistance(query, word)
      if (distance < minDistance && distance <= 2 && distance > 0) {
        minDistance = distance
        bestMatch = word
      }
    })
    
    return bestMatch
    
  } catch (error) {
    console.error('Error suggesting correction:', error)
    return null
  }
}

// Calculate Levenshtein distance for typo detection
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}
