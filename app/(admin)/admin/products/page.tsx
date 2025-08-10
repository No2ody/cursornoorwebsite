import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

import { ProductsTable } from '@/components/admin/products/products-table'
import { ProductsHeader } from '@/components/admin/products/products-header'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ProductsPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    category?: string
    status?: string
    sort?: string
  }>
}

export default async function ProductsPage(props: ProductsPageProps) {
  const session = await auth()
  const searchParams = await props.searchParams

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  const currentPage = Number(searchParams.page) || 1
  const search = searchParams.search || ''
  const category = searchParams.category || ''
  const status = searchParams.status || ''
  const sort = searchParams.sort || 'name'

  return (
    <div className='space-y-8'>
      {/* Page Header with Actions */}
      <ProductsHeader />

      {/* Products Table */}
      <Card className='border-0 shadow-lg'>
        <Suspense fallback={<ProductsTableSkeleton />}>
          <ProductsTable
            page={currentPage}
            search={search}
            category={category}
            status={status}
            sort={sort}
          />
        </Suspense>
      </Card>
    </div>
  )
}

function ProductsTableSkeleton() {
  return (
    <div className='p-6'>
      <div className='space-y-4'>
        {/* Table Header */}
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-8 w-32' />
        </div>
        
        {/* Table Rows */}
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className='flex items-center space-x-4 py-4 border-b'>
            <Skeleton className='h-12 w-12 rounded' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-8 w-24' />
          </div>
        ))}
      </div>
    </div>
  )
}
