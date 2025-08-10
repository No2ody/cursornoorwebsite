import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

import { AnalyticsOverview } from '@/components/admin/analytics/analytics-overview'
import { SalesChart } from '@/components/admin/analytics/sales-chart'
import { TopProducts } from '@/components/admin/analytics/top-products'
import { CategoryPerformance } from '@/components/admin/analytics/category-performance'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default async function AnalyticsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className='space-y-8'>
      {/* Page Header */}
      <div>
        <h1 className='text-3xl font-bold text-gray-900'>Analytics</h1>
        <p className='text-gray-600 mt-2'>
          Track your business performance and key metrics
        </p>
      </div>

      {/* Analytics Overview Cards */}
      <Suspense fallback={<AnalyticsOverviewSkeleton />}>
        <AnalyticsOverview />
      </Suspense>

      {/* Charts and Detailed Analytics */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Sales Chart */}
        <Suspense fallback={<ChartSkeleton />}>
          <SalesChart />
        </Suspense>

        {/* Top Products */}
        <Suspense fallback={<ChartSkeleton />}>
          <TopProducts />
        </Suspense>
      </div>

      {/* Category Performance */}
      <Suspense fallback={<ChartSkeleton />}>
        <CategoryPerformance />
      </Suspense>
    </div>
  )
}

// Loading skeletons
function AnalyticsOverviewSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className='pb-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-8 w-20' />
          </CardHeader>
          <CardContent>
            <Skeleton className='h-4 w-16' />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className='h-6 w-32' />
      </CardHeader>
      <CardContent>
        <Skeleton className='h-64 w-full' />
      </CardContent>
    </Card>
  )
}
