import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  PackageSearch, 
  MapPin, 
  Heart,
  Clock,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const [orderCount, wishlistCount, addressCount, recentOrders] = await Promise.all([
    prisma.order.count({
      where: { userId: session.user.id },
    }),
    prisma.wishlistItem.count({
      where: { userId: session.user.id },
    }),
    prisma.address.count({
      where: { userId: session.user.id },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
  ])


  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-3xl font-bold tracking-tight'>
          Welcome back, {session.user.name?.split(' ')[0] || 'there'}! 👋
        </h2>
        <p className='text-muted-foreground'>
          Here&apos;s a summary of your account
        </p>
      </div>
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Orders</CardTitle>
            <PackageSearch className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{orderCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Saved Addresses
            </CardTitle>
            <MapPin className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{addressCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>
              Wishlist Items
            </CardTitle>
            <Heart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{wishlistCount}</div>
          </CardContent>
        </Card>
      </div>
      <div className='space-y-4'>
        <h3 className='text-xl font-semibold'>Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <div className='text-center py-8'>
            <PackageSearch className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground mb-4'>No orders yet</p>
            <Button asChild>
              <Link href='/products'>Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            {recentOrders.map((order) => (
              <div key={order.id} className='flex items-center justify-between p-4 border rounded-lg'>
                <div className='flex items-center space-x-4'>
                  <div className='h-10 w-10 bg-muted rounded-lg flex items-center justify-center'>
                    <PackageSearch className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <div>
                    <p className='font-medium'>
                      Order #{order.id.slice(-8).toUpperCase()}
                    </p>
                    <p className='text-sm text-muted-foreground'>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''} • {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='font-medium'>AED {order.total.toFixed(2)}</p>
                  <Badge 
                    variant={order.status === 'DELIVERED' ? 'default' : 'secondary'}
                    className={order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {order.status === 'DELIVERED' && <CheckCircle className='h-3 w-3 mr-1' />}
                    {order.status === 'PENDING' && <Clock className='h-3 w-3 mr-1' />}
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
