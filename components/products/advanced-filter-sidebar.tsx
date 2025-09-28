'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Filter, 
  Star, 
  Package, 
  Tag, 
  DollarSign, 
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FilterData {
  categories: Array<{ id: string; name: string; count: number }>
  brands: Array<{ name: string; count: number }>
  priceRange: { min: number; max: number }
  ratings: Array<{ stars: number; count: number }>
  availability: { inStock: number; outOfStock: number; total: number }
}

interface CollapsibleSectionProps {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
}

function CollapsibleSection({ title, icon, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Card className="card-enhanced">
      <CardHeader 
        className="pb-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            {title}
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-0">
          {children}
        </CardContent>
      )}
    </Card>
  )
}

export function AdvancedFilterSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Filter data state
  const [filterData, setFilterData] = useState<FilterData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all')
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brands')?.split(',').filter(Boolean) || []
  )
  const [priceRange, setPriceRange] = useState([
    parseInt(searchParams.get('minPrice') || '0'),
    parseInt(searchParams.get('maxPrice') || '5000')
  ])
  const [selectedRating, setSelectedRating] = useState(searchParams.get('rating') || 'all')
  const [selectedAvailability, setSelectedAvailability] = useState(searchParams.get('availability') || 'all')

  // Fetch filter data
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const response = await fetch('/api/products/filters')
        const data = await response.json()
        setFilterData(data)
        
        // Update price range if not set by user
        if (!searchParams.get('minPrice') && !searchParams.get('maxPrice')) {
          setPriceRange([data.priceRange.min, data.priceRange.max])
        }
      } catch (error) {
        console.error('Error fetching filter data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFilterData()
  }, [searchParams])

  // Apply filters
  const applyFilters = useCallback(() => {
    const params = new URLSearchParams()
    
    if (searchTerm) params.set('search', searchTerm)
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory)
    if (selectedBrands.length > 0) params.set('brands', selectedBrands.join(','))
    if (selectedRating && selectedRating !== 'all') params.set('rating', selectedRating)
    if (selectedAvailability && selectedAvailability !== 'all') params.set('availability', selectedAvailability)
    
    params.set('minPrice', priceRange[0].toString())
    params.set('maxPrice', priceRange[1].toString())

    router.push(`/products?${params.toString()}`)
  }, [searchTerm, selectedCategory, selectedBrands, selectedRating, selectedAvailability, priceRange, router])

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedBrands([])
    setSelectedRating('all')
    setSelectedAvailability('all')
    if (filterData) {
      setPriceRange([filterData.priceRange.min, filterData.priceRange.max])
    }
    router.push('/products')
  }

  // Get active filters count
  const getActiveFiltersCount = () => {
    let count = 0
    if (searchTerm) count++
    if (selectedCategory !== 'all') count++
    if (selectedBrands.length > 0) count++
    if (selectedRating !== 'all') count++
    if (selectedAvailability !== 'all') count++
    if (filterData && (priceRange[0] > filterData.priceRange.min || priceRange[1] < filterData.priceRange.max)) count++
    return count
  }

  // Handle brand selection
  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand])
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand))
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="card-enhanced">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!filterData) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-brand" />
          <h2 className="text-xl font-semibold display-font">Filters</h2>
          {getActiveFiltersCount() > 0 && (
            <Badge className="bg-brand text-white">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="text-gray-600 hover:text-brand"
        >
          <RefreshCw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Search */}
      <CollapsibleSection
        title="Search Products"
        icon={<Search className="h-4 w-4 text-brand" />}
      >
        <div className="space-y-3">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-enhanced"
          />
          <Button 
            onClick={applyFilters} 
            className="w-full btn-brand"
            size="sm"
          >
            Search
          </Button>
        </div>
      </CollapsibleSection>

      {/* Categories */}
      <CollapsibleSection
        title="Categories"
        icon={<Tag className="h-4 w-4 text-brand" />}
      >
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === 'all'}
              onChange={() => setSelectedCategory('all')}
              className="text-brand focus:ring-brand"
            />
            <span className="flex-1">All Categories</span>
            <Badge variant="secondary" className="text-xs">
              {filterData.categories.reduce((sum, cat) => sum + cat.count, 0)}
            </Badge>
          </label>
          {filterData.categories.map((category) => (
            <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category.id}
                onChange={() => setSelectedCategory(category.id)}
                className="text-brand focus:ring-brand"
              />
              <span className="flex-1">{category.name}</span>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Price Range */}
      <CollapsibleSection
        title="Price Range"
        icon={<DollarSign className="h-4 w-4 text-brand" />}
      >
        <div className="space-y-4">
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={filterData.priceRange.max}
              min={filterData.priceRange.min}
              step={10}
              className="w-full"
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>AED {priceRange[0]}</span>
            <span>AED {priceRange[1]}</span>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="input-enhanced text-sm"
            />
            <Input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || filterData.priceRange.max])}
              className="input-enhanced text-sm"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Brands */}
      {filterData.brands.length > 0 && (
        <CollapsibleSection
          title="Brands"
          icon={<Sparkles className="h-4 w-4 text-brand" />}
        >
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {filterData.brands.map((brand) => (
              <label key={brand.name} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <Checkbox
                  checked={selectedBrands.includes(brand.name)}
                  onCheckedChange={(checked) => handleBrandChange(brand.name, checked as boolean)}
                />
                <span className="flex-1">{brand.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {brand.count}
                </Badge>
              </label>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Rating */}
      <CollapsibleSection
        title="Customer Rating"
        icon={<Star className="h-4 w-4 text-brand" />}
      >
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="rating"
              checked={selectedRating === 'all'}
              onChange={() => setSelectedRating('all')}
              className="text-brand focus:ring-brand"
            />
            <span className="flex-1">All Ratings</span>
          </label>
          {[5, 4, 3, 2, 1].map((rating) => {
            const ratingData = filterData.ratings.find(r => r.stars === rating)
            return (
              <label key={rating} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === rating.toString()}
                  onChange={() => setSelectedRating(rating.toString())}
                  className="text-brand focus:ring-brand"
                />
                <div className="flex items-center gap-1 flex-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'w-3 h-3',
                        i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      )}
                    />
                  ))}
                  <span className="text-sm ml-1">& up</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {ratingData?.count || 0}
                </Badge>
              </label>
            )
          })}
        </div>
      </CollapsibleSection>

      {/* Availability */}
      <CollapsibleSection
        title="Availability"
        icon={<Package className="h-4 w-4 text-brand" />}
      >
        <div className="space-y-2">
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="availability"
              checked={selectedAvailability === 'all'}
              onChange={() => setSelectedAvailability('all')}
              className="text-brand focus:ring-brand"
            />
            <span className="flex-1">All Products</span>
            <Badge variant="secondary" className="text-xs">
              {filterData.availability.total}
            </Badge>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="availability"
              checked={selectedAvailability === 'in_stock'}
              onChange={() => setSelectedAvailability('in_stock')}
              className="text-brand focus:ring-brand"
            />
            <span className="flex-1 text-green-700">In Stock</span>
            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
              {filterData.availability.inStock}
            </Badge>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
            <input
              type="radio"
              name="availability"
              checked={selectedAvailability === 'out_of_stock'}
              onChange={() => setSelectedAvailability('out_of_stock')}
              className="text-brand focus:ring-brand"
            />
            <span className="flex-1 text-red-700">Out of Stock</span>
            <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
              {filterData.availability.outOfStock}
            </Badge>
          </label>
        </div>
      </CollapsibleSection>

      {/* Apply Filters Button */}
      <div className="sticky bottom-0 bg-white p-4 border-t">
        <Button 
          onClick={applyFilters} 
          className="w-full btn-brand text-lg py-6"
          size="lg"
        >
          Apply Filters
          {getActiveFiltersCount() > 0 && (
            <Badge className="ml-2 bg-white text-brand">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  )
}
