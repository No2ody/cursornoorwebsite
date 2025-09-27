'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ChevronDown, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
}

interface SearchSuggestion {
  id: string
  name: string
  type: 'product' | 'category'
  category?: string
}

interface EnhancedSearchProps {
  className?: string
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
}

export function EnhancedSearch({
  className,
  value: controlledValue,
  onValueChange,
  placeholder = 'Search products...'
}: EnhancedSearchProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(controlledValue || '')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCategoryLoading, setIsCategoryLoading] = useState(false)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoryLoading(true)
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories([{ id: 'all', name: 'All Categories' }, ...data])
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsCategoryLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined) {
      setSearchQuery(controlledValue)
    }
  }, [controlledValue])

  // Debounced search suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoading(true)
    
    try {
      const categoryParam = selectedCategory && selectedCategory.id !== 'all' 
        ? `&category=${selectedCategory.id}` 
        : ''
      
      const response = await fetch(
        `/api/products?search=${encodeURIComponent(query)}&limit=5${categoryParam}`
      )
      const data = await response.json()
      
      const productSuggestions: SearchSuggestion[] = data.products?.map((product: { id: string; name: string; category?: { name: string } }) => ({
        id: product.id,
        name: product.name,
        type: 'product' as const,
        category: product.category?.name
      })) || []

      // Add category suggestions if searching all categories
      const categorySuggestions: SearchSuggestion[] = 
        selectedCategory?.id === 'all' || !selectedCategory
          ? categories
              .filter(cat => 
                cat.id !== 'all' && 
                cat.name.toLowerCase().includes(query.toLowerCase())
              )
              .slice(0, 3)
              .map(cat => ({
                id: cat.id,
                name: cat.name,
                type: 'category' as const
              }))
          : []

      setSuggestions([...categorySuggestions, ...productSuggestions])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory, categories])

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setSearchQuery(value)
    onValueChange?.(value)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout for debounced search
    timeoutRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!searchQuery.trim()) return

    const categoryParam = selectedCategory && selectedCategory.id !== 'all' 
      ? `&category=${selectedCategory.id}` 
      : ''
    
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}${categoryParam}`)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.id}`)
    } else {
      router.push(`/products?category=${suggestion.id}`)
    }
    setShowSuggestions(false)
    setSearchQuery('')
  }

  const clearSearch = () => {
    setSearchQuery('')
    onValueChange?.('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      <form onSubmit={handleSearch} className="relative">
        <div className="flex items-center">
          {/* Category Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="flex-shrink-0 rounded-r-none border-r-0 px-3 py-2 h-12 bg-gray-50 hover:bg-gray-100 transition-colors"
                disabled={isCategoryLoading}
              >
                {isCategoryLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <span className="text-sm font-medium text-gray-700 max-w-24 truncate">
                      {selectedCategory?.name || 'All'}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category.id}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'cursor-pointer',
                    selectedCategory?.id === category.id && 'bg-brand-50 text-brand'
                  )}
                >
                  {category.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Input */}
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-3 h-12 rounded-l-none border-l-0 focus:border-brand transition-all duration-300"
              value={searchQuery}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true)
                }
              }}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            
            {/* Loading indicator */}
            {isLoading && (
              <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
            
            {/* Clear button */}
            {searchQuery && !isLoading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                onClick={clearSearch}
              >
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
          >
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.type}-${suggestion.id}`}
                type="button"
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {suggestion.name}
                    </p>
                    {suggestion.category && (
                      <p className="text-xs text-gray-500 mt-1">
                        in {suggestion.category}
                      </p>
                    )}
                  </div>
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    suggestion.type === 'product' 
                      ? 'bg-brand-100 text-brand-700' 
                      : 'bg-gold-100 text-gold-700'
                  )}>
                    {suggestion.type === 'product' ? 'Product' : 'Category'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  )
}
