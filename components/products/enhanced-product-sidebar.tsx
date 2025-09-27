'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Filter, RotateCcw, Star, Package } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
}

interface Brand {
  name: string
  count: number
}

export function EnhancedProductSidebar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // State management
  const [categories, setCategories] = useState<Category[]>([])
  const [brands] = useState<Brand[]>([
    { name: 'Noor AlTayseer', count: 45 },
    { name: 'Phillips', count: 23 },
    { name: 'Osram', count: 18 },
    { name: 'Schneider', count: 12 },
    { name: 'Legrand', count: 8 },
  ])
  
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('category') || 'all'
  )
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.get('brands')?.split(',') || []
  )
  const [selectedRating, setSelectedRating] = useState(
    searchParams.get('rating') || 'all'
  )
  const [selectedAvailability, setSelectedAvailability] = useState(
    searchParams.get('availability') || 'all'
  )
  const [selectedSort, setSelectedSort] = useState(
    searchParams.get('sort') || 'default'
  )

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  const getActiveFiltersCount = () => {
    let count = 0
    if (selectedCategory !== 'all') count++
    if (selectedBrands.length > 0) count++
    if (selectedRating !== 'all') count++
    if (selectedAvailability !== 'all') count++
    if (priceRange[0] > 0 || priceRange[1] < 5000) count++
    return count
  }

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand])
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand))
    }
  }

  const handleFilter = () => {
    const params = new URLSearchParams()
    
    if (selectedCategory && selectedCategory !== 'all')
      params.set('category', selectedCategory)
    if (selectedBrands.length > 0)
      params.set('brands', selectedBrands.join(','))
    if (selectedRating && selectedRating !== 'all')
      params.set('rating', selectedRating)
    if (selectedAvailability && selectedAvailability !== 'all')
      params.set('availability', selectedAvailability)
    if (selectedSort && selectedSort !== 'default')
      params.set('sort', selectedSort)
    
    params.set('minPrice', priceRange[0].toString())
    params.set('maxPrice', priceRange[1].toString())

    router.push(`/products?${params.toString()}`)
  }

  const handleReset = () => {
    setSelectedCategory('all')
    setSelectedBrands([])
    setSelectedRating('all')
    setSelectedAvailability('all')
    setSelectedSort('default')
    setPriceRange([0, 5000])
    router.push('/products')
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-3 h-3',
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <Badge variant="secondary" className="bg-brand-100 text-brand-700">
              {getActiveFiltersCount()}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-gray-500 hover:text-gray-700"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Reset
        </Button>
      </div>

      <Separator />

      <Accordion type="multiple" defaultValue={['category', 'price', 'sort']} className="w-full">
        {/* Category Filter */}
        <AccordionItem value="category">
          <AccordionTrigger className="py-3">
            <span className="text-sm font-medium">Category</span>
          </AccordionTrigger>
          <AccordionContent>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger className="py-3">
            <span className="text-sm font-medium">Price Range</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                min={0}
                max={5000}
                step={50}
                onValueChange={setPriceRange}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-600">
                <span>AED {priceRange[0]}</span>
                <span>AED {priceRange[1]}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Brand Filter */}
        <AccordionItem value="brand">
          <AccordionTrigger className="py-3">
            <span className="text-sm font-medium">Brand</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3">
              {brands.map((brand) => (
                <div key={brand.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`brand-${brand.name}`}
                      checked={selectedBrands.includes(brand.name)}
                      onCheckedChange={(checked) => 
                        handleBrandChange(brand.name, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`brand-${brand.name}`}
                      className="text-sm cursor-pointer"
                    >
                      {brand.name}
                    </Label>
                  </div>
                  <span className="text-xs text-gray-500">({brand.count})</span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Rating Filter */}
        <AccordionItem value="rating">
          <AccordionTrigger className="py-3">
            <span className="text-sm font-medium">Customer Rating</span>
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedRating} onValueChange={setSelectedRating}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="rating-all" />
                <Label htmlFor="rating-all" className="text-sm cursor-pointer">
                  All Ratings
                </Label>
              </div>
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center space-x-2">
                  <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                  <Label htmlFor={`rating-${rating}`} className="text-sm cursor-pointer flex items-center gap-2">
                    {renderStars(rating)}
                    <span>& Up</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Availability Filter */}
        <AccordionItem value="availability">
          <AccordionTrigger className="py-3">
            <span className="text-sm font-medium">Availability</span>
          </AccordionTrigger>
          <AccordionContent>
            <RadioGroup value={selectedAvailability} onValueChange={setSelectedAvailability}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="availability-all" />
                <Label htmlFor="availability-all" className="text-sm cursor-pointer">
                  All Products
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-stock" id="availability-in-stock" />
                <Label htmlFor="availability-in-stock" className="text-sm cursor-pointer flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600" />
                  In Stock Only
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fast-delivery" id="availability-fast" />
                <Label htmlFor="availability-fast" className="text-sm cursor-pointer">
                  Fast Delivery Available
                </Label>
              </div>
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {/* Sort Filter */}
        <AccordionItem value="sort">
          <AccordionTrigger className="py-3">
            <span className="text-sm font-medium">Sort By</span>
          </AccordionTrigger>
          <AccordionContent>
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="name_asc">Name: A to Z</SelectItem>
                <SelectItem value="name_desc">Name: Z to A</SelectItem>
                <SelectItem value="rating_desc">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Apply Filters Button */}
      <div className="space-y-3 pt-4">
        <Button onClick={handleFilter} className="w-full bg-brand hover:bg-brand-700">
          <Filter className="w-4 h-4 mr-2" />
          Apply Filters
        </Button>
        
        {getActiveFiltersCount() > 0 && (
          <div className="text-center">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-gray-600 hover:text-gray-800"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
