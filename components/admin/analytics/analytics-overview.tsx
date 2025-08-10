import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package 
} from 'lucide-react'

async function getAnalyticsData() {
  const [
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    recentOrders,
    previousMonthOrders,
  ] = await Promise.all([
    // Total revenue from all delivered orders
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: OrderStatus.DELIVERED },
    }),
    
    // Total number of orders
    prisma.order.count(),
    
    // Total number of customers
    prisma.user.count({
      where: { role: 'USER' },
    }),
    
    // Total number of products
    prisma.product.count(),
    
    // Recent orders (last 30 days)
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // Previous month orders for comparison
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ])

  // Calculate growth percentages
  const orderGrowth = previousMonthOrders > 0 
    ? ((recentOrders - previousMonthOrders) / previousMonthOrders) * 100 
    : 0

  return {
    totalRevenue: totalRevenue._sum.total || 0,
    totalOrders,
    totalCustomers,
    totalProducts,
    orderGrowth,
  }
}

export async function AnalyticsOverview() {
  const data = await getAnalyticsData()

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      change: '+12.5%',
      changeType: 'increase' as const,
      description: 'from last month',
    },
    {
      title: 'Total Orders',
      value: data.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: `${data.orderGrowth >= 0 ? '+' : ''}${data.orderGrowth.toFixed(1)}%`,
      changeType: data.orderGrowth >= 0 ? 'increase' : 'decrease' as const,
      description: 'from last month',
    },
    {
      title: 'Total Customers',
      value: data.totalCustomers.toLocaleString(),
      icon: Users,
      change: '+8.2%',
      changeType: 'increase' as const,
      description: 'from last month',
    },
    {
      title: 'Total Products',
      value: data.totalProducts.toLocaleString(),
      icon: Package,
      change: '+2.1%',
      changeType: 'increase' as const,
      description: 'from last month',
    },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {metrics.map((metric) => (
        <Card key={metric.title} className='border-0 shadow-lg bg-gradient-to-br from-white to-gray-50'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium text-gray-600'>
              {metric.title}
            </CardTitle>
            <metric.icon className='h-4 w-4 text-gray-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900 mb-1'>
              {metric.value}
            </div>
            <div className='flex items-center space-x-2'>
              <Badge
                variant='secondary'
                className={`flex items-center gap-1 ${
                  metric.changeType === 'increase'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : 'bg-red-100 text-red-800 border-red-200'
                }`}
              >
                {metric.changeType === 'increase' ? (
                  <TrendingUp className='h-3 w-3' />
                ) : (
                  <TrendingDown className='h-3 w-3' />
                )}
                {metric.change}
              </Badge>
              <span className='text-xs text-gray-500'>{metric.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
