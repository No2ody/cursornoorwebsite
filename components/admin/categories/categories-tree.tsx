'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from '@/hooks/use-toast'
import { 
  Edit, 
  Trash2, 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Folder,
  FolderOpen,
  Menu,
  Star
} from 'lucide-react'

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

interface CategoriesTreeProps {
  categories: Category[]
  onRefresh: () => void
}

export function CategoriesTree({ categories, onRefresh }: CategoriesTreeProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleDelete = async (categoryId: string) => {
    setDeletingId(categoryId)

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete category')
      }

      toast({
        title: 'Success',
        description: 'Category deleted successfully',
      })

      onRefresh()
    } catch (error) {
      console.error('Delete category error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete category',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const renderCategory = (category: Category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0
    const isExpanded = expandedCategories.has(category.id)

    return (
      <React.Fragment key={category.id}>
        <TableRow className={level > 0 ? 'bg-gray-50/50' : ''}>
          <TableCell>
            <div className="flex items-center space-x-2" style={{ paddingLeft: `${level * 24}px` }}>
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => toggleExpanded(category.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <div className="w-6" />
              )}
              
              {category.image ? (
                <div className="relative h-8 w-8 rounded overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                  {hasChildren ? (
                    isExpanded ? <FolderOpen className="h-4 w-4 text-gray-400" /> : <Folder className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Folder className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              )}
              
              <div>
                <div className="font-medium">{category.name}</div>
                <div className="text-sm text-gray-500">/{category.slug}</div>
              </div>
            </div>
          </TableCell>
          
          <TableCell>
            <div className="max-w-xs">
              {category.description ? (
                <p className="text-sm text-gray-600 truncate">
                  {category.description}
                </p>
              ) : (
                <span className="text-sm text-gray-400">No description</span>
              )}
            </div>
          </TableCell>
          
          <TableCell>
            <Badge variant="secondary">
              {category._count.products} products
            </Badge>
          </TableCell>
          
          <TableCell>
            <div className="text-center">
              {category.sortOrder}
            </div>
          </TableCell>
          
          <TableCell>
            <div className="flex items-center space-x-2">
              <Badge variant={category.isActive ? 'default' : 'secondary'}>
                {category.isActive ? 'Active' : 'Inactive'}
              </Badge>
              
              {category.showInMenu && (
                <Badge variant="outline" className="text-xs">
                  <Menu className="h-3 w-3 mr-1" />
                  Menu
                </Badge>
              )}
              
              {category.showInFooter && (
                <Badge variant="outline" className="text-xs">
                  Footer
                </Badge>
              )}
              
              {category.featuredOrder && (
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
          </TableCell>
          
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              {hasChildren && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href={`/admin/categories/new?parent=${category.id}`}>
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <Link href={`/admin/categories/${category.id}/edit`}>
                  <Edit className="h-4 w-4" />
                </Link>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={
                      category._count.products > 0 || 
                      category._count.children > 0 || 
                      deletingId === category.id
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete &ldquo;{category.name}&rdquo;? This action cannot be undone.
                      {(category._count.products > 0 || category._count.children > 0) && (
                        <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800 text-sm">
                          {category._count.products > 0 && (
                            <div>This category has {category._count.products} associated products.</div>
                          )}
                          {category._count.children > 0 && (
                            <div>This category has {category._count.children} subcategories.</div>
                          )}
                          <div className="mt-1 font-medium">Cannot delete category with associated data.</div>
                        </div>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(category.id)}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={category._count.products > 0 || category._count.children > 0}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TableCell>
        </TableRow>
        
        {hasChildren && isExpanded && category.children?.map(child => 
          renderCategory(child, level + 1)
        )}
      </React.Fragment>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <Folder className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first category.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Products</TableHead>
            <TableHead className="text-center">Sort</TableHead>
            <TableHead>Status & Display</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map(category => renderCategory(category))}
        </TableBody>
      </Table>
    </div>
  )
}

// Add React import for Fragment
import React from 'react'
