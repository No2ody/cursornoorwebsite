'use client'

import { useState } from 'react'
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
  Search, 
  Download,
  RefreshCw
} from 'lucide-react'

export function OrdersHeader() {
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
    params.delete('page')
    router.push(`/admin/orders?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.delete('page')
    router.push(`/admin/orders?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearchQuery('')
    router.push('/admin/orders')
  }

  const activeFiltersCount = Array.from(searchParams.entries()).filter(
    ([key, value]) => key !== 'page' && value
  ).length

  return (
    <div className='space-y-6'>
      {/* Page Title */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Orders</h1>
          <p className='text-gray-600 mt-2'>
            Manage and track customer orders
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
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
                placeholder='Search orders by ID, customer name, or email...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 pr-4'
              />
            </div>
          </form>

          {/* Filters */}
          <div className='flex items-center gap-3'>
            <Select
              value={searchParams.get('status') || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='CONFIRMED'>Confirmed</SelectItem>
                <SelectItem value='PROCESSING'>Processing</SelectItem>
                <SelectItem value='SHIPPED'>Shipped</SelectItem>
                <SelectItem value='DELIVERED'>Delivered</SelectItem>
                <SelectItem value='CANCELLED'>Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={searchParams.get('sort') || 'createdAt-desc'}
              onValueChange={(value) => handleFilterChange('sort', value)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='createdAt-desc'>Newest First</SelectItem>
                <SelectItem value='createdAt'>Oldest First</SelectItem>
                <SelectItem value='total-desc'>Highest Value</SelectItem>
                <SelectItem value='total'>Lowest Value</SelectItem>
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
