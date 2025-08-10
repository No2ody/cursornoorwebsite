'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface SalesData {
  date: string
  revenue: number
  orders: number
}

export function SalesChart() {
  const [data, setData] = useState<SalesData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('/api/admin/analytics/sales')
        const salesData = await response.json()
        setData(salesData)
      } catch (error) {
        console.error('Error fetching sales data:', error)
        // Generate sample data for demo
        const sampleData = generateSampleData()
        setData(sampleData)
      } finally {
        setLoading(false)
      }
    }

    fetchSalesData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='h-64 bg-gray-100 animate-pulse rounded'></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='border-0 shadow-lg'>
      <CardHeader>
        <CardTitle className='text-lg font-semibold text-gray-900'>
          Sales Overview
        </CardTitle>
        <p className='text-sm text-gray-600'>
          Revenue and order trends over the last 30 days
        </p>
      </CardHeader>
      <CardContent>
        <div className='h-64'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis 
                dataKey='date' 
                stroke='#666'
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId='left'
                stroke='#666'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis 
                yAxisId='right'
                orientation='right'
                stroke='#666'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
                        <p className='font-medium text-gray-900'>{label}</p>
                        <p className='text-blue-600'>
                          Revenue: {formatCurrency(payload[0].value as number)}
                        </p>
                        <p className='text-green-600'>
                          Orders: {payload[1]?.value || 0}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line 
                type='monotone' 
                dataKey='revenue' 
                stroke='#3b82f6'
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                yAxisId='left'
              />
              <Line 
                type='monotone' 
                dataKey='orders' 
                stroke='#10b981'
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                yAxisId='right'
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className='flex items-center justify-center gap-6 mt-4'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
            <span className='text-sm text-gray-600'>Revenue (AED)</span>
          </div>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-green-500 rounded-full'></div>
            <span className='text-sm text-gray-600'>Orders</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Generate sample data for demo purposes
function generateSampleData(): SalesData[] {
  const data: SalesData[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    // Generate realistic sample data
    const baseRevenue = 2000 + Math.random() * 3000
    const weekendMultiplier = date.getDay() === 0 || date.getDay() === 6 ? 0.7 : 1
    const revenue = Math.round(baseRevenue * weekendMultiplier)
    const orders = Math.round(revenue / 150) // Average order value around 150 AED
    
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue,
      orders,
    })
  }
  
  return data
}
