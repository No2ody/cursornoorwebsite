import { Product } from '@prisma/client'
// Removed framer-motion for build compatibility
import { ProductCard } from '@/components/ui/product-card'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ProductGrid({
  products,
  loading,
  currentPage,
  totalPages,
  onPageChange,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='space-y-4'>
            <Skeleton className='h-[200px] w-full rounded-lg' />
            <Skeleton className='h-4 w-2/3' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className='text-center py-12'>
        <h3 className='text-lg font-semibold'>No products found</h3>
        <p className='text-muted-foreground'>
          Try adjusting your search or filter criteria
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {/* Results Header */}
      <div className='flex items-center justify-between border-b border-gray-200 pb-4'>
        <h2 className='text-2xl font-semibold text-ink'>
          {products.length} {products.length === 1 ? 'Product' : 'Products'} Found
        </h2>
        <p className='text-sm text-gray-600'>
          Page {currentPage} of {totalPages}
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-300'>
        {products.map((product) => (
          <div
            key={product.id}
            className='transform transition-all duration-300 hover:scale-105'
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      <div className='flex justify-center pt-8'>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  )
}
