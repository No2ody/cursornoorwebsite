import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '7d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    
    switch (range) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    // Get basic order statistics
    const [
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts
    ] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: startDate
          }
        }
      }),
      prisma.order.aggregate({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        _sum: {
          total: true
        }
      }),
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate
          }
        },
        select: {
          createdAt: true,
          total: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          order: {
            createdAt: {
              gte: startDate
            }
          }
        },
        _count: {
          productId: true
        },
        _sum: {
          quantity: true
        },
        orderBy: {
          _count: {
            productId: 'desc'
          }
        },
        take: 10
      })
    ])

    // Get product details for top products
    const productIds = topProducts.map(item => item.productId)
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds
        }
      },
      select: {
        id: true,
        name: true,
        category: {
          select: {
            name: true
          }
        }
      }
    })

    // Create product lookup map
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product
      return acc
    }, {} as Record<string, any>) // eslint-disable-line @typescript-eslint/no-explicit-any

    // Generate mock analytics data (in a real implementation, this would come from Google Analytics API)
    const mockAnalyticsData = {
      overview: {
        totalVisitors: Math.floor(Math.random() * 10000) + 5000,
        totalPageViews: Math.floor(Math.random() * 50000) + 25000,
        totalSessions: Math.floor(Math.random() * 8000) + 4000,
        bounceRate: Math.random() * 30 + 40, // 40-70%
        avgSessionDuration: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
        conversionRate: Math.random() * 3 + 1, // 1-4%
        totalRevenue: totalRevenue._sum.total || 0,
        totalOrders: totalOrders
      },
      trends: {
        visitors: generateDailyData(range),
        revenue: generateRevenueData(recentOrders, range),
        topPages: [
          { page: '/', views: Math.floor(Math.random() * 5000) + 2000, bounceRate: Math.random() * 20 + 30 },
          { page: '/products', views: Math.floor(Math.random() * 3000) + 1500, bounceRate: Math.random() * 20 + 25 },
          { page: '/about', views: Math.floor(Math.random() * 1000) + 500, bounceRate: Math.random() * 20 + 35 },
          { page: '/contact', views: Math.floor(Math.random() * 800) + 400, bounceRate: Math.random() * 20 + 40 },
          { page: '/support', views: Math.floor(Math.random() * 600) + 300, bounceRate: Math.random() * 20 + 30 }
        ],
        topProducts: topProducts.slice(0, 5).map(item => {
          const product = productMap[item.productId]
          return {
            name: product?.name || 'Unknown Product',
            views: Math.floor(Math.random() * 1000) + 500,
            addToCarts: Math.floor(Math.random() * 100) + 50,
            purchases: item._sum.quantity || 0
          }
        }),
        searchTerms: [
          { term: 'LED lights', searches: Math.floor(Math.random() * 500) + 200, resultsClicked: Math.floor(Math.random() * 300) + 100 },
          { term: 'bathroom fixtures', searches: Math.floor(Math.random() * 400) + 150, resultsClicked: Math.floor(Math.random() * 250) + 80 },
          { term: 'ceiling lights', searches: Math.floor(Math.random() * 300) + 100, resultsClicked: Math.floor(Math.random() * 200) + 60 },
          { term: 'faucets', searches: Math.floor(Math.random() * 250) + 80, resultsClicked: Math.floor(Math.random() * 150) + 40 },
          { term: 'downlights', searches: Math.floor(Math.random() * 200) + 60, resultsClicked: Math.floor(Math.random() * 120) + 30 }
        ],
        trafficSources: [
          { source: 'Direct', visitors: Math.floor(Math.random() * 2000) + 1000, percentage: 35 },
          { source: 'Google Search', visitors: Math.floor(Math.random() * 1500) + 800, percentage: 28 },
          { source: 'Social Media', visitors: Math.floor(Math.random() * 800) + 400, percentage: 15 },
          { source: 'Email', visitors: Math.floor(Math.random() * 600) + 300, percentage: 12 },
          { source: 'Referrals', visitors: Math.floor(Math.random() * 400) + 200, percentage: 10 }
        ]
      }
    }

    return NextResponse.json(mockAnalyticsData)

  } catch (error) {
    console.error('Error fetching analytics data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}

function generateDailyData(range: string) {
  const days = range === '1d' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90
  const data = []
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors: Math.floor(Math.random() * 500) + 200,
      sessions: Math.floor(Math.random() * 400) + 150
    })
  }
  
  return data
}

function generateRevenueData(orders: any[], range: string) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const days = range === '1d' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90
  const data = []
  
  // Group orders by date
  const ordersByDate = orders.reduce((acc, order) => {
    const date = new Date(order.createdAt).toDateString()
    if (!acc[date]) {
      acc[date] = { revenue: 0, orders: 0 }
    }
    acc[date].revenue += order.total
    acc[date].orders += 1
    return acc
  }, {} as Record<string, { revenue: number; orders: number }>)
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateString = date.toDateString()
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: ordersByDate[dateString]?.revenue || 0,
      orders: ordersByDate[dateString]?.orders || 0
    })
  }
  
  return data
}
