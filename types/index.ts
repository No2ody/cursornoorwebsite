// Shared type definitions for the application

// Product related types
export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  images: string[]
  categoryId: string
  category?: {
    id: string
    name: string
  }
  stock?: number
  rating?: number
  reviewCount?: number
}

// Cart related types
export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  product?: {
    id: string
    name: string
    categoryId: string
    price: number
  }
}

// Wishlist related types
export interface WishlistItem {
  id: string
  name: string
  price: number
  images: string[]
  categoryId: string
}

// Search related types
export interface SearchResult {
  id: string
  name: string
  description: string | null
  price: number
  images: string[]
  category: {
    id: string
    name: string
  }
  relevanceScore?: number
  matchType?: 'exact' | 'partial' | 'fuzzy' | 'category'
  highlightedName?: string
  highlightedDescription?: string
}

export interface SearchSuggestion {
  id: string
  name: string
  type: 'product' | 'category' | 'brand' | 'keyword'
  image?: string
  category?: string
  matchType?: string
}

export interface SearchResponse {
  results: SearchResult[]
  suggestions: string[]
  total: number
  page: number
  perPage: number
}

// Promotion related types
export interface Promotion {
  id: string
  name: string
  description: string | null
  code?: string
  type: string
  value: number
  minOrderValue?: number
  maxDiscount?: number
  startDate: Date
  endDate: Date
  isActive: boolean
}

// Filter related types
export interface FilterData {
  categories: Array<{ id: string; name: string; count: number }>
  brands: Array<{ name: string; count: number }>
  priceRange: { min: number; max: number }
  ratings: Array<{ rating: number; count: number }>
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = unknown> {
  data: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
}
