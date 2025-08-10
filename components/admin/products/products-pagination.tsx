'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductsPaginationProps {
  currentPage: number
  totalPages: number
}

export function ProductsPagination({ currentPage, totalPages }: ProductsPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    return `/admin/products?${params.toString()}`
  }

  const handlePageChange = (page: number) => {
    router.push(createPageUrl(page))
  }

  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const pages = []
    const showPages = 5 // Show 5 page numbers at most
    
    let start = Math.max(1, currentPage - Math.floor(showPages / 2))
    const end = Math.min(totalPages, start + showPages - 1)
    
    // Adjust start if we're near the end
    if (end - start + 1 < showPages) {
      start = Math.max(1, end - showPages + 1)
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    
    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <div className='flex items-center justify-center space-x-2'>
      {/* Previous Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className='flex items-center gap-1'
      >
        <ChevronLeft className='h-4 w-4' />
        Previous
      </Button>

      {/* First page if not visible */}
      {visiblePages[0] > 1 && (
        <>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(1)}
          >
            1
          </Button>
          {visiblePages[0] > 2 && (
            <span className='px-2 py-1 text-gray-500'>...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {visiblePages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size='sm'
          onClick={() => handlePageChange(page)}
          className={currentPage === page ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          {page}
        </Button>
      ))}

      {/* Last page if not visible */}
      {visiblePages[visiblePages.length - 1] < totalPages && (
        <>
          {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
            <span className='px-2 py-1 text-gray-500'>...</span>
          )}
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </Button>
        </>
      )}

      {/* Next Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className='flex items-center gap-1'
      >
        Next
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  )
}
