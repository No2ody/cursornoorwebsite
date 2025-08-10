import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { OrderActions } from './order-actions'
import { OrdersPagination } from './orders-pagination'
import { Eye, ShoppingCart } from 'lucide-react'
import Link from 'next/link'

interface OrdersTableProps {
  page: number
  search: string
  status: string
  sort: string
}

const ITEMS_PER_PAGE = 10

async function getOrders({
  page,
  search,
  status,
  sort,
}: OrdersTableProps) {
  const skip = (page - 1) * ITEMS_PER_PAGE

  // Build where clause
  const where: Record<string, unknown> = {}
  
  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { user: { email: { contains: search, mode: 'insensitive' } } },
    ]
  }
  
  if (status && status !== 'all') {
    where.status = status
  }

  // Build orderBy clause
  let orderBy: Record<string, string> = { createdAt: 'desc' }
  switch (sort) {
    case 'createdAt':
      orderBy = { createdAt: 'asc' }
      break
    case 'total':
      orderBy = { total: 'asc' }
      break
    case 'total-desc':
      orderBy = { total: 'desc' }
      break
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.order.count({ where }),
  ])

  return {
    orders,
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
  }
}

export async function OrdersTable(props: OrdersTableProps) {
  const { orders, totalCount, totalPages } = await getOrders(props)

  if (orders.length === 0) {
    return (
      <div className='p-8 text-center'>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
            <ShoppingCart className='w-8 h-8 text-gray-400' />
          </div>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>No orders found</h3>
            <p className='text-gray-500 mt-1'>
              {props.search || props.status
                ? 'Try adjusting your search or filter criteria'
                : 'Orders will appear here when customers place them'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'SHIPPED':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className='space-y-4'>
      {/* Table Header Info */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>
              Orders ({totalCount})
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Showing {(props.page - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(props.page * ITEMS_PER_PAGE, totalCount)} of {totalCount} orders
            </p>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className='px-6 pb-6'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className='w-24'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className='hover:bg-gray-50'>
                {/* Order ID */}
                <TableCell>
                  <div className='font-medium text-gray-900'>
                    #{order.id.slice(-8).toUpperCase()}
                  </div>
                </TableCell>

                {/* Customer */}
                <TableCell>
                  <div className='space-y-1'>
                    <div className='font-medium text-gray-900'>
                      {order.user?.name || 'Guest'}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {order.user?.email}
                    </div>
                  </div>
                </TableCell>

                {/* Items */}
                <TableCell>
                  <div className='space-y-1'>
                    <div className='font-medium'>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </div>
                    <div className='text-sm text-gray-500'>
                      {order.items.slice(0, 2).map((item) => item.product.name).join(', ')}
                      {order.items.length > 2 && ' +more'}
                    </div>
                  </div>
                </TableCell>

                {/* Total */}
                <TableCell>
                  <span className='font-medium'>
                    {formatCurrency(order.total)}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge 
                    variant='secondary'
                    className={getStatusColor(order.status)}
                  >
                    {order.status}
                  </Badge>
                </TableCell>

                {/* Date */}
                <TableCell>
                  <span className='text-sm text-gray-600'>
                    {formatDate(order.createdAt)}
                  </span>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      asChild
                      className='h-8 w-8 p-0'
                    >
                      <Link href={`/admin/orders/${order.id}`}>
                        <Eye className='h-4 w-4' />
                      </Link>
                    </Button>
                    <OrderActions orderId={order.id} currentStatus={order.status} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-6'>
            <OrdersPagination
              currentPage={props.page}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  )
}
