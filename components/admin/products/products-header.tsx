'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

export function ProductsHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to first page when searching
    router.push(`/admin/products?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page') // Reset to first page when filtering
    router.push(`/admin/products?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    router.push('/admin/products')
  }

  const activeFiltersCount = Array.from(searchParams.entries()).filter(
    ([key, value]) => key !== 'page' && value
  ).length

  return (
    <div className='space-y-6'>
      {/* Page Title and Main Actions */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Products</h1>
          <p className='text-gray-600 mt-2'>
            Manage your product catalog and inventory
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Button variant='outline' size='sm'>
            <Upload className='h-4 w-4 mr-2' />
            Import
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button asChild className='bg-blue-600 hover:bg-blue-700'>
            <Link href='/admin/products/new'>
              <Plus className='h-4 w-4 mr-2' />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className='bg-white p-6 rounded-lg border border-gray-200 shadow-sm'>
        <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
          {/* Search */}
          <form onSubmit={handleSearch} className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
              <Input
                placeholder='Search products by name, SKU, or description...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 pr-4'
              />
            </div>
          </form>

          {/* Filters */}
          <div className='flex items-center gap-3'>
            <Select
              value={searchParams.get('category') || 'all'}
              onValueChange={(value) => handleFilterChange('category', value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Category' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Categories</SelectItem>
                <SelectItem value='bathroom'>Bathroom</SelectItem>
                <SelectItem value='lighting'>Lighting</SelectItem>
                <SelectItem value='led-mirror'>LED Mirror</SelectItem>
                <SelectItem value='bathtubs'>Bathtubs</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchParams.get('status') || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className='w-32'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='draft'>Draft</SelectItem>
                <SelectItem value='archived'>Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchParams.get('sort') || 'name'}
              onValueChange={(value) => handleFilterChange('sort', value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='name'>Name A-Z</SelectItem>
                <SelectItem value='name-desc'>Name Z-A</SelectItem>
                <SelectItem value='price'>Price Low-High</SelectItem>
                <SelectItem value='price-desc'>Price High-Low</SelectItem>
                <SelectItem value='created'>Newest First</SelectItem>
                <SelectItem value='created-desc'>Oldest First</SelectItem>
              </SelectContent>
            </Select>

            {activeFiltersCount > 0 && (
              <Button 
                variant='outline' 
                size='sm' 
                onClick={clearFilters}
                className='border-red-200 text-red-600 hover:bg-red-50'
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Clear
                <Badge variant='secondary' className='ml-2 bg-red-100 text-red-700'>
                  {activeFiltersCount}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
