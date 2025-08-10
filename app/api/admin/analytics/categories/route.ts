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

    // Get category performance data
    const categoryData = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        products: {
          select: {
            id: true,
            orderItems: {
              where: {
                order: {
                  status: OrderStatus.DELIVERED,
                },
              },
              select: {
                quantity: true,
                price: true,
              },
            },
          },
        },
      },
    })

    // Calculate totals and percentages
    let totalRevenue = 0
    const processedData = categoryData.map((category) => {
      const revenue = category.products.reduce((catTotal, product) => {
        return catTotal + product.orderItems.reduce((prodTotal, item) => {
          return prodTotal + (item.price * item.quantity)
        }, 0)
      }, 0)

      const orderCount = category.products.reduce((catCount, product) => {
        return catCount + product.orderItems.length
      }, 0)

      totalRevenue += revenue

      return {
        name: category.name,
        revenue,
        productCount: category.products.length,
        orderCount,
        percentage: 0, // Will calculate after we have total revenue
      }
    })

    // Calculate percentages
    const categoriesWithPercentage = processedData.map((category) => ({
      ...category,
      percentage: totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0,
    }))

    // Sort by revenue descending
    categoriesWithPercentage.sort((a, b) => b.revenue - a.revenue)

    return NextResponse.json(categoriesWithPercentage)
  } catch (error) {
    console.error('Error fetching category data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category data' },
      { status: 500 }
    )
  }
}
