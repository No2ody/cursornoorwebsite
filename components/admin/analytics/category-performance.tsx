'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { BarChart3, TrendingUp } from 'lucide-react'

interface CategoryData {
  name: string
  revenue: number
  productCount: number
  orderCount: number
  percentage: number
}

export function CategoryPerformance() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const response = await fetch('/api/admin/analytics/categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching category data:', error)
        // Generate sample data for demo
        const sampleData = generateSampleCategoryData()
        setCategories(sampleData)
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='space-y-2'>
                <div className='h-4 bg-gray-200 animate-pulse rounded'></div>
                <div className='h-2 bg-gray-100 animate-pulse rounded'></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='border-0 shadow-lg'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
          <BarChart3 className='h-5 w-5 text-blue-500' />
          Category Performance
        </CardTitle>
        <p className='text-sm text-gray-600'>
          Revenue breakdown by product categories
        </p>
      </CardHeader>
      <CardContent>
        <div className='space-y-6'>
          {categories.map((category, index) => (
            <div key={category.name} className='space-y-3'>
              {/* Category Header */}
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center gap-2'>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index === 0
                          ? 'bg-blue-500'
                          : index === 1
                          ? 'bg-green-500'
                          : index === 2
                          ? 'bg-yellow-500'
                          : index === 3
                          ? 'bg-purple-500'
                          : index === 4
                          ? 'bg-pink-500'
                          : 'bg-gray-500'
                      }`}
                    ></div>
                    <h4 className='font-medium text-gray-900'>{category.name}</h4>
                  </div>
                  {index < 3 && (
                    <Badge
                      variant='secondary'
                      className='bg-green-100 text-green-800 border-green-200 text-xs'
                    >
                      <TrendingUp className='h-3 w-3 mr-1' />
                      Top {index + 1}
                    </Badge>
                  )}
                </div>
                <div className='text-right'>
                  <span className='font-semibold text-gray-900'>
                    {formatCurrency(category.revenue)}
                  </span>
                  <span className='text-sm text-gray-500 ml-2'>
                    ({category.percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <Progress
                value={category.percentage}
                className='h-2'
                // Apply different colors based on index
                style={{
                  '--progress-background': 
                    index === 0 ? '#3b82f6' :
                    index === 1 ? '#10b981' :
                    index === 2 ? '#f59e0b' :
                    index === 3 ? '#8b5cf6' :
                    index === 4 ? '#ec4899' : '#6b7280'
                } as React.CSSProperties}
              />

              {/* Category Stats */}
              <div className='flex items-center justify-between text-sm text-gray-600'>
                <span>{category.productCount} products</span>
                <span>{category.orderCount} orders</span>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className='mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100'>
          <div className='flex items-center justify-between'>
            <div>
              <h4 className='font-medium text-gray-900'>Total Revenue</h4>
              <p className='text-sm text-gray-600'>Across all categories</p>
            </div>
            <div className='text-right'>
              <span className='text-xl font-bold text-blue-600'>
                {formatCurrency(categories.reduce((sum, cat) => sum + cat.revenue, 0))}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Generate sample category data for demo
function generateSampleCategoryData(): CategoryData[] {
  const categories = [
    'LED Mirror',
    'Bathtubs', 
    'Smart Controls and Lighting',
    'LED Outdoor',
    'PVC Cabinet',
    'LED Spotlight',
    'LED Panel',
    'Switches & Sockets',
  ]

  const totalRevenue = 50000 // Sample total revenue
  let remainingPercentage = 100

  return categories.map((name, index) => {
    // Generate realistic distribution with top categories having more revenue
    let percentage: number
    if (index === 0) percentage = 25 + Math.random() * 10 // 25-35%
    else if (index === 1) percentage = 15 + Math.random() * 8 // 15-23%
    else if (index === 2) percentage = 10 + Math.random() * 8 // 10-18%
    else if (index < categories.length - 1) {
      percentage = Math.max(2, Math.min(remainingPercentage / (categories.length - index), 15))
    } else {
      percentage = remainingPercentage // Last category gets remainder
    }

    remainingPercentage -= percentage

    const revenue = Math.round((totalRevenue * percentage) / 100)
    const productCount = Math.round(10 + Math.random() * 20)
    const orderCount = Math.round(5 + Math.random() * 15)

    return {
      name,
      revenue,
      productCount,
      orderCount,
      percentage,
    }
  }).slice(0, 6) // Limit to top 6 categories
}
