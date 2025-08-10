import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { 
  ShoppingCart, 
  DollarSign, 
  Clock, 
  TrendingUp
} from 'lucide-react'

async function getOrdersStats() {
  const [
    totalOrders,
    pendingOrders,
    totalRevenue,
    recentOrders,
    previousMonthOrders,
    averageOrderValue,
  ] = await Promise.all([
    prisma.order.count(),
    
    prisma.order.count({
      where: { status: OrderStatus.PENDING },
    }),
    
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { in: [OrderStatus.DELIVERED] } },
    }),
    
    // Orders in last 30 days
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    // Previous month for comparison
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    
    prisma.order.aggregate({
      _avg: { total: true },
      where: { status: { in: [OrderStatus.DELIVERED] } },
    }),
  ])

  const orderGrowth = previousMonthOrders > 0 
    ? ((recentOrders - previousMonthOrders) / previousMonthOrders) * 100 
    : 0

  return {
    totalOrders,
    pendingOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    orderGrowth,
    averageOrderValue: averageOrderValue._avg.total || 0,
  }
}

export async function OrdersStats() {
  const stats = await getOrdersStats()

  const metrics = [
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingCart,
      change: `${stats.orderGrowth >= 0 ? '+' : ''}${stats.orderGrowth.toFixed(1)}%`,
      changeType: stats.orderGrowth >= 0 ? 'increase' : 'decrease' as const,
      description: 'from last month',
      color: 'blue',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      change: stats.pendingOrders > 0 ? 'Needs attention' : 'All caught up',
      changeType: stats.pendingOrders > 0 ? 'warning' : 'success' as const,
      description: 'require processing',
      color: stats.pendingOrders > 0 ? 'yellow' : 'green',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      change: '+15.3%',
      changeType: 'increase' as const,
      description: 'from last month',
      color: 'green',
    },
    {
      title: 'Average Order',
      value: formatCurrency(stats.averageOrderValue),
      icon: TrendingUp,
      change: '+8.2%',
      changeType: 'increase' as const,
      description: 'order value',
      color: 'purple',
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
            <div className={`p-2 rounded-lg ${
              metric.color === 'blue' ? 'bg-blue-100' :
              metric.color === 'yellow' ? 'bg-yellow-100' :
              metric.color === 'green' ? 'bg-green-100' :
              metric.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
            }`}>
              <metric.icon className={`h-4 w-4 ${
                metric.color === 'blue' ? 'text-blue-600' :
                metric.color === 'yellow' ? 'text-yellow-600' :
                metric.color === 'green' ? 'text-green-600' :
                metric.color === 'purple' ? 'text-purple-600' : 'text-gray-600'
              }`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-900 mb-1'>
              {metric.value}
            </div>
            <div className='flex items-center space-x-2'>
              <Badge
                variant='secondary'
                className={`text-xs ${
                  metric.changeType === 'increase'
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : metric.changeType === 'decrease'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : metric.changeType === 'warning'
                    ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}
              >
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
