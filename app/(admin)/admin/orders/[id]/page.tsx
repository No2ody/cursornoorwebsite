import { notFound } from 'next/navigation'
import { OrderDetails } from '@/components/admin/orders/order-details'
import { getOrderDetails } from '@/lib/order-management'

interface OrderDetailsPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params

  const order = await getOrderDetails(id)

  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
        <p className="text-muted-foreground">
          Manage order #{order.orderNumber}
        </p>
      </div>

      <OrderDetails order={order} onRefresh={() => {}} />
    </div>
  )
}