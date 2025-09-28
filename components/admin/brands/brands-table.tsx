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
import { Edit, Trash2, ExternalLink, Package } from 'lucide-react'

interface Brand {
  id: string
  name: string
  description: string | null
  logo: string | null
  website: string | null
  isActive: boolean
  _count: {
    products: number
  }
  createdAt: string
  updatedAt: string
}

interface BrandsTableProps {
  brands: Brand[]
  onRefresh: () => void
}

export function BrandsTable({ brands, onRefresh }: BrandsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (brandId: string) => {
    setDeletingId(brandId)

    try {
      const response = await fetch(`/api/brands/${brandId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete brand')
      }

      toast({
        title: 'Success',
        description: 'Brand deleted successfully',
      })

      onRefresh()
    } catch (error) {
      console.error('Delete brand error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete brand',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (brands.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No brands</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new brand.
        </p>
        <div className="mt-6">
          <Button asChild>
            <Link href="/admin/brands/new">
              <Package className="mr-2 h-4 w-4" />
              Add Brand
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
            <TableHead>Brand</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((brand) => (
            <TableRow key={brand.id}>
              <TableCell>
                <div className="flex items-center space-x-3">
                  {brand.logo ? (
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden">
                      <Image
                        src={brand.logo}
                        alt={brand.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{brand.name}</div>
                    {brand.website && (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  {brand.description ? (
                    <p className="text-sm text-gray-600 truncate">
                      {brand.description}
                    </p>
                  ) : (
                    <span className="text-sm text-gray-400">No description</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {brand._count.products} products
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={brand.isActive ? 'default' : 'secondary'}>
                  {brand.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {formatDate(brand.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href={`/admin/brands/${brand.id}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={brand._count.products > 0 || deletingId === brand.id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &ldquo;{brand.name}&rdquo;? This action cannot be undone.
                          {brand._count.products > 0 && (
                            <div className="mt-2 p-2 bg-yellow-50 rounded text-yellow-800 text-sm">
                              This brand has {brand._count.products} associated products and cannot be deleted.
                            </div>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(brand.id)}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={brand._count.products > 0}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
