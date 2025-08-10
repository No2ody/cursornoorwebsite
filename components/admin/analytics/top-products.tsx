import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { Crown, TrendingUp } from 'lucide-react'

async function getTopProducts() {
  try {
    // Get top selling products based on order items
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
      },
      _count: {
        productId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    })

    // Get product details for the top selling products
    const productDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        })

        return {
          ...product,
          totalSold: item._sum.quantity || 0,
          orderCount: item._count.productId,
        }
      })
    )

    return productDetails.filter(Boolean)
  } catch (error) {
    console.error('Error fetching top products:', error)
    return []
  }
}

export async function TopProducts() {
  const products = await getTopProducts()

  if (products.length === 0) {
    return (
      <Card className='border-0 shadow-lg'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Crown className='h-5 w-5 text-yellow-500' />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <p className='text-gray-500'>No sales data available yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='border-0 shadow-lg'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
          <Crown className='h-5 w-5 text-yellow-500' />
          Top Selling Products
        </CardTitle>
        <p className='text-sm text-gray-600'>
          Best performing products by quantity sold
        </p>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {products.map((product, index) => (
            <div
              key={product?.id}
              className='flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow'
            >
              {/* Rank Badge */}
              <div className='flex-shrink-0'>
                <Badge
                  variant='secondary'
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : index === 1
                      ? 'bg-gray-100 text-gray-800 border-gray-200'
                      : index === 2
                      ? 'bg-orange-100 text-orange-800 border-orange-200'
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }`}
                >
                  #{index + 1}
                </Badge>
              </div>

              {/* Product Image */}
              <div className='flex-shrink-0'>
                <div className='w-12 h-12 rounded-lg overflow-hidden bg-gray-100'>
                  {product?.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name || 'Product'}
                      width={48}
                      height={48}
                      className='object-cover w-full h-full'
                    />
                  ) : (
                    <div className='w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center'>
                      <span className='text-blue-600 text-xs font-semibold'>
                        {product?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className='flex-1 min-w-0'>
                <h4 className='font-medium text-gray-900 truncate'>
                  {product?.name || 'Unknown Product'}
                </h4>
                <div className='flex items-center gap-2 mt-1'>
                  <span className='text-sm text-gray-500'>
                    {product?.category?.name || 'Uncategorized'}
                  </span>
                  <span className='text-sm font-semibold text-gray-900'>
                    {formatCurrency(product?.price || 0)}
                  </span>
                </div>
              </div>

              {/* Sales Stats */}
              <div className='flex-shrink-0 text-right'>
                <div className='flex items-center gap-1 text-green-600'>
                  <TrendingUp className='h-4 w-4' />
                  <span className='font-semibold'>{product?.totalSold || 0}</span>
                </div>
                <p className='text-xs text-gray-500'>
                  {product?.orderCount || 0} orders
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
