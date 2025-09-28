'use client'

import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface ProductBreadcrumbProps {
  product: {
    id: string
    name: string
    category?: {
      name: string
    }
  }
}

export function ProductBreadcrumb({ product }: ProductBreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600">
      <Link 
        href="/" 
        className="flex items-center hover:text-brand transition-colors"
      >
        <Home className="h-4 w-4 mr-1" />
        Home
      </Link>
      
      <ChevronRight className="h-4 w-4" />
      
      <Link 
        href="/products" 
        className="hover:text-brand transition-colors"
      >
        Products
      </Link>
      
      {product.category && (
        <>
          <ChevronRight className="h-4 w-4" />
          <Link 
            href={`/products?category=${encodeURIComponent(product.category.name)}`}
            className="hover:text-brand transition-colors"
          >
            {product.category.name}
          </Link>
        </>
      )}
      
      <ChevronRight className="h-4 w-4" />
      
      <span className="text-gray-900 font-medium truncate max-w-xs">
        {product.name}
      </span>
    </nav>
  )
}
