import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Package, Truck, CreditCard, Download, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { OrderStatus } from '@prisma/client'

type tParams = Promise<{ id: string }>

interface OrderConfirmationPageProps {
  params: tParams
}

async function getOrder(id: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { 
      id,
      userId,
      status: OrderStatus.DELIVERED // Only show delivered orders
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true,
      shippingAddress: true
    }
  })

  return order
}

export default async function OrderConfirmationPage(props: OrderConfirmationPageProps) {
  const { id } = await props.params
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  const order = await getOrder(id, session.user.id)

  if (!order) {
    notFound()
  }

  const shippingAddress = order.shippingAddress

  return (
    <div className="container mx-auto px-4 py-8 pt-32 max-w-4xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-lg text-gray-600">
          Thank you for your purchase. Your order has been successfully placed.
        </p>
        <div className="mt-4 p-4 bg-brand-50 rounded-lg inline-block">
          <p className="text-brand font-semibold">Order #{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-sm text-gray-600">
            Confirmation sent to {order.user.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-brand" />
                Order Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {order.status}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Placed on {order.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  Payment completed
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Truck className="w-4 h-4" />
                  <span className="font-medium">Estimated delivery: 3-5 business days</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  We&apos;ll send you tracking information once your order ships.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <Image
                        src={item.product.images[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${item.product.id}`}>
                          View Product
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-yellow-600 hover:text-yellow-700">
                        <Star className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.user.name}</p>
                <p>{shippingAddress.street}</p>
                <p>
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </p>
                <p>{shippingAddress.country}</p>
                <p className="text-gray-600 mt-2">{order.user.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatPrice(10)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(order.total * 0.1)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total + 10 + (order.total * 0.1))}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <Button className="w-full" asChild>
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                  <Link href="/dashboard/orders">
                    View All Orders
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Customer Support */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>If you have any questions about your order, feel free to contact us:</p>
                <div className="space-y-2">
                  <p>
                    <strong>Phone:</strong> +971 50 538 2246
                  </p>
                  <p>
                    <strong>Email:</strong> info@nooraltayseer.com
                  </p>
                  <p>
                    <strong>Order ID:</strong> {order.id.slice(-8).toUpperCase()}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <Link href="/contact">
                    Contact Support
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}