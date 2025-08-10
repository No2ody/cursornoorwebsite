import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get sales data for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const orders = await prisma.order.findMany({
      where: {
        status: OrderStatus.DELIVERED,
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Group orders by date
    const salesByDate = new Map<string, { revenue: number; orders: number }>()

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0] // YYYY-MM-DD format
      const existing = salesByDate.get(date) || { revenue: 0, orders: 0 }
      salesByDate.set(date, {
        revenue: existing.revenue + order.total,
        orders: existing.orders + 1,
      })
    })

    // Convert to array format for chart
    const salesData = Array.from(salesByDate.entries()).map(([date, data]) => ({
      date,
      revenue: data.revenue,
      orders: data.orders,
    }))

    // Fill in missing dates with zero values
    const filledData = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const existingData = salesData.find(d => d.date === dateStr)
      filledData.push({
        date: dateStr,
        revenue: existingData?.revenue || 0,
        orders: existingData?.orders || 0,
      })
    }

    return NextResponse.json(filledData)
  } catch (error) {
    console.error('Error fetching sales data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    )
  }
}
