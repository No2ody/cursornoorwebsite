'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoriesTree } from '@/components/admin/categories/categories-tree'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Plus, Folder, Eye, EyeOff } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  isActive: boolean
  sortOrder: number
  showInMenu: boolean
  showInFooter: boolean
  featuredOrder: number | null
  children?: Category[]
  _count: {
    products: number
    children: number
  }
}

interface CategoriesResponse {
  categories: Category[]
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(showInactive && { includeInactive: 'true' }),
      })

      const response = await fetch(`/api/admin/categories?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }

      const data: CategoriesResponse = await response.json()
      setCategories(data.categories)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [showInactive])

  const handleRefresh = () => {
    fetchCategories()
  }

  // Calculate stats
  const totalCategories = categories.reduce((count, cat) => {
    const countChildren = (category: Category): number => {
      let count = 1
      if (category.children) {
        count += category.children.reduce((childCount, child) => childCount + countChildren(child), 0)
      }
      return count
    }
    return count + countChildren(cat)
  }, 0)

  const activeCategories = categories.reduce((count, cat) => {
    const countActiveChildren = (category: Category): number => {
      let count = category.isActive ? 1 : 0
      if (category.children) {
        count += category.children.reduce((childCount, child) => childCount + countActiveChildren(child), 0)
      }
      return count
    }
    return count + countActiveChildren(cat)
  }, 0)

  const totalProducts = categories.reduce((count, cat) => {
    const countProducts = (category: Category): number => {
      let count = category._count.products
      if (category.children) {
        count += category.children.reduce((childCount, child) => childCount + countProducts(child), 0)
      }
      return count
    }
    return count + countProducts(cat)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Category Management</h1>
          <p className="text-muted-foreground">
            Organize your products with hierarchical categories
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCategories}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Categories</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCategories}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Root Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>View Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="show-inactive"
              checked={showInactive}
              onCheckedChange={setShowInactive}
            />
            <Label htmlFor="show-inactive">Show inactive categories</Label>
          </div>
        </CardContent>
      </Card>

      {/* Categories Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Categories Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-[80px]" />
                  <Skeleton className="h-8 w-[100px]" />
                </div>
              ))}
            </div>
          ) : (
            <CategoriesTree categories={categories} onRefresh={handleRefresh} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
