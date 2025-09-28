'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Package, 
  Tag, 
  Sparkles,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface Suggestion {
  id: string
  text: string
  type: 'product' | 'category' | 'brand' | 'keyword'
  count?: number
  image?: string
  price?: number
}

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
}

interface AdvancedSearchBarProps {
  placeholder?: string
  className?: string
  showRecentSearches?: boolean
  showTrendingSearches?: boolean
}

export function AdvancedSearchBar({ 
  placeholder = "Search for lighting, bathroom fixtures, and more...",
  className,
  showRecentSearches = true,
  showTrendingSearches = true
}: AdvancedSearchBarProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading recent searches:', error)
      }
    }
  }, [])

  // Save recent searches to localStorage
  const saveRecentSearch = useCallback((searchQuery: string) => {
    const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }, [recentSearches])

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([])
      setSearchResults([])
      return
    }

    setIsLoading(true)
    
    try {
      // Fetch suggestions and search results in parallel
      const [suggestionsRes, searchRes] = await Promise.all([
        fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=6`),
        fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=4`)
      ])

      const [suggestionsData, searchData] = await Promise.all([
        suggestionsRes.json(),
        searchRes.json()
      ])

      setSuggestions(suggestionsData.suggestions || [])
      setSearchResults(searchData.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setSuggestions([])
      setSearchResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle input change with debouncing
  const handleInputChange = (value: string) => {
    setQuery(value)
    setSelectedIndex(-1)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      debouncedSearch(value)
    }, 300)
  }

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query
    if (!finalQuery.trim()) return

    saveRecentSearch(finalQuery.trim())
    setShowDropdown(false)
    setQuery('')
    
    // Track search analytics
    fetch('/api/search/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: finalQuery.trim(),
        resultsCount: searchResults.length,
        sessionId: Date.now().toString()
      })
    }).catch(console.error)

    router.push(`/products?search=${encodeURIComponent(finalQuery.trim())}`)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (suggestion.type === 'product') {
      router.push(`/products/${suggestion.id}`)
    } else if (suggestion.type === 'category') {
      router.push(`/products?category=${suggestion.id}`)
    } else if (suggestion.type === 'brand') {
      router.push(`/products?brands=${encodeURIComponent(suggestion.text)}`)
    } else {
      handleSearch(suggestion.text)
    }
    setShowDropdown(false)
  }

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    // Track click analytics
    fetch('/api/search/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query.trim(),
        resultsCount: searchResults.length,
        clickedResult: result.id,
        sessionId: Date.now().toString()
      })
    }).catch(console.error)

    router.push(`/products/${result.id}`)
    setShowDropdown(false)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return

    const totalItems = suggestions.length + searchResults.length + (showRecentSearches ? recentSearches.length : 0)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % totalItems)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev <= 0 ? totalItems - 1 : prev - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          // Handle selection based on index
          if (selectedIndex < suggestions.length) {
            handleSuggestionClick(suggestions[selectedIndex])
          } else if (selectedIndex < suggestions.length + searchResults.length) {
            handleResultClick(searchResults[selectedIndex - suggestions.length])
          } else {
            const recentIndex = selectedIndex - suggestions.length - searchResults.length
            handleSearch(recentSearches[recentIndex])
          }
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowDropdown(false)
        inputRef.current?.blur()
        break
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product': return <Package className="h-4 w-4 text-brand" />
      case 'category': return <Tag className="h-4 w-4 text-gold" />
      case 'brand': return <Sparkles className="h-4 w-4 text-purple-500" />
      case 'keyword': return <Search className="h-4 w-4 text-gray-500" />
      default: return <Search className="h-4 w-4 text-gray-500" />
    }
  }

  const trendingSearches = [
    'LED ceiling lights', 'Bathroom vanity', 'Pendant lights', 'Smart switches', 'Outdoor lighting'
  ]

  return (
    <div className={cn('relative w-full max-w-2xl', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-12 py-3 text-base input-enhanced"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            onClick={() => {
              setQuery('')
              setSuggestions([])
              setSearchResults([])
              inputRef.current?.focus()
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-brand" />
          </div>
        )}
      </div>

      {/* Search Dropdown */}
      {showDropdown && (
        <Card 
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto card-enhanced"
        >
          <CardContent className="p-0">
            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="p-4 border-b">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="h-4 w-4 text-brand" />
                  Products
                </h4>
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <button
                      key={result.id}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left',
                        selectedIndex === index && 'bg-brand-50'
                      )}
                      onClick={() => handleResultClick(result)}
                    >
                      {result.images[0] && (
                        <div className="w-10 h-10 relative rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={result.images[0]}
                            alt={result.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {result.highlightedName ? (
                            <span dangerouslySetInnerHTML={{ __html: result.highlightedName }} />
                          ) : (
                            result.name
                          )}
                        </p>
                        <p className="text-sm text-gray-600">AED {result.price.toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-4 border-b">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  Suggestions
                </h4>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      className={cn(
                        'w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left',
                        selectedIndex === searchResults.length + index && 'bg-brand-50'
                      )}
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {getSuggestionIcon(suggestion.type)}
                      <span className="flex-1 text-gray-900">{suggestion.text}</span>
                      {suggestion.count && (
                        <Badge variant="secondary" className="text-xs">
                          {suggestion.count}
                        </Badge>
                      )}
                      {suggestion.price && (
                        <span className="text-sm text-gray-600">
                          AED {suggestion.price.toFixed(2)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Searches */}
            {showRecentSearches && recentSearches.length > 0 && !query && (
              <div className="p-4 border-b">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  Recent Searches
                </h4>
                <div className="space-y-1">
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      onClick={() => handleSearch(search)}
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="flex-1 text-gray-700">{search}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            {showTrendingSearches && !query && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Trending Searches
                </h4>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((trend, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSearch(trend)}
                    >
                      {trend}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query && !isLoading && suggestions.length === 0 && searchResults.length === 0 && (
              <div className="p-8 text-center">
                <Search className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No results found for &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-gray-500">Try different keywords or check spelling</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
