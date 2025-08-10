import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminHeader } from '@/components/admin/admin-header'
import { OrdersTable } from '@/components/admin/orders/orders-table'
import { OrdersHeader } from '@/components/admin/orders/orders-header'
import { OrdersStats } from '@/components/admin/orders/orders-stats'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface OrdersPageProps {
  searchParams: Promise<{
    page?: string
    search?: string
    status?: string
    sort?: string
  }>
}

export default async function OrdersPage(props: OrdersPageProps) {
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
  const status = searchParams.status || ''
  const sort = searchParams.sort || 'createdAt-desc'

  return (
    <div className='min-h-screen bg-gray-50'>
      <AdminHeader />
      <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='space-y-8'>
          {/* Page Header */}
          <OrdersHeader />

          {/* Orders Stats */}
          <Suspense fallback={<OrdersStatsSkeleton />}>
            <OrdersStats />
          </Suspense>

          {/* Orders Table */}
          <Card className='border-0 shadow-lg'>
            <Suspense fallback={<OrdersTableSkeleton />}>
              <OrdersTable
                page={currentPage}
                search={search}
                status={status}
                sort={sort}
              />
            </Suspense>
          </Card>
        </div>
      </main>
    </div>
  )
}

function OrdersStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className='p-6'>
          <Skeleton className='h-4 w-24 mb-2' />
          <Skeleton className='h-8 w-16 mb-1' />
          <Skeleton className='h-3 w-20' />
        </Card>
      ))}
    </div>
  )
}

function OrdersTableSkeleton() {
  return (
    <div className='p-6'>
      <div className='space-y-4'>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className='flex items-center space-x-4 py-4 border-b'>
            <Skeleton className='h-4 w-16' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-3/4' />
              <Skeleton className='h-3 w-1/2' />
            </div>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-6 w-16' />
            <Skeleton className='h-8 w-24' />
          </div>
        ))}
      </div>
    </div>
  )
}
