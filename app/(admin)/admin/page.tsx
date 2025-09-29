import { MetricsCards } from '@/components/admin/metrics-cards'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { OrderStats } from '@/components/admin/order-stats'
import { RecentOrders } from '@/components/admin/recent-orders'

// Force dynamic rendering for admin dashboard
export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  // Mock data for now - replace with actual data fetching
  const revenueData = [
    { date: '2025-01-01', revenue: 1200 },
    { date: '2025-01-02', revenue: 1800 },
    { date: '2025-01-03', revenue: 1600 },
    { date: '2025-01-04', revenue: 2200 },
    { date: '2025-01-05', revenue: 1900 },
    { date: '2025-01-06', revenue: 2400 },
    { date: '2025-01-07', revenue: 2100 },
    { date: '2025-01-08', revenue: 2800 },
    { date: '2025-01-09', revenue: 2600 },
    { date: '2025-01-10', revenue: 3200 },
  ]
  
  const orderStats = [
    { name: 'Pending', value: 25 },
    { name: 'Processing', value: 30 },
    { name: 'Shipped', value: 20 },
    { name: 'Delivered', value: 20 },
    { name: 'Cancelled', value: 5 },
  ]
  
  const recentOrders = [
    {
      id: 'ORD-001',
      user: { name: 'Ahmed Al-Rashid' },
      total: 1250.00,
      status: 'PENDING' as const,
      createdAt: new Date('2025-01-10T10:30:00'),
    },
    {
      id: 'ORD-002', 
      user: { name: 'Fatima Al-Zahra' },
      total: 890.50,
      status: 'PROCESSING' as const,
      createdAt: new Date('2025-01-10T09:15:00'),
    },
    {
      id: 'ORD-003',
      user: { name: 'Mohammed Hassan' },
      total: 2100.00,
      status: 'SHIPPED' as const,
      createdAt: new Date('2025-01-09T16:45:00'),
    },
    {
      id: 'ORD-004',
      user: { name: 'Aisha Abdullah' },
      total: 675.25,
      status: 'DELIVERED' as const,
      createdAt: new Date('2025-01-09T14:20:00'),
    },
    {
      id: 'ORD-005',
      user: { name: 'Omar Al-Mansoori' },
      total: 1450.75,
      status: 'PROCESSING' as const,
      createdAt: new Date('2025-01-09T11:30:00'),
    },
  ]

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>Noor AlTayseer Dashboard</h2>
        <p className='text-muted-foreground'>Manage your lighting & bathroom solutions business</p>
      </div>

      {/* Key Metrics */}
      <MetricsCards />

      {/* Charts Grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <RevenueChart data={revenueData} />
        <OrderStats data={orderStats} />
      </div>

      {/* Recent Orders */}
      <RecentOrders orders={recentOrders} />
    </div>
  )
}
