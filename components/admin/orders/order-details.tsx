'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import {
  Package,
  Truck,
  MapPin,
  Clock,
  User,
  CreditCard,
  RefreshCw,
  Ban,
  Undo2,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface OrderDetailsProps {
  order: any // Full order object with all relations
  onRefresh: () => void
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  PARTIALLY_REFUNDED: 'bg-yellow-100 text-yellow-800',
  RETURN_REQUESTED: 'bg-amber-100 text-amber-800',
  RETURN_APPROVED: 'bg-teal-100 text-teal-800',
  RETURN_REJECTED: 'bg-red-100 text-red-800',
  RETURNED: 'bg-gray-100 text-gray-800',
}

const statusOptions = [
  'PENDING',
  'CONFIRMED', 
  'PROCESSING',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]

export function OrderDetails({ order, onRefresh }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState(order.status)
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '')
  const [notes, setNotes] = useState(order.notes || '')
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.estimatedDelivery ? new Date(order.estimatedDelivery).toISOString().split('T')[0] : ''
  )

  const handleUpdateOrder = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: selectedStatus !== order.status ? selectedStatus : undefined,
          trackingNumber: trackingNumber !== order.trackingNumber ? trackingNumber : undefined,
          notes: notes !== order.notes ? notes : undefined,
          estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update order')
      }

      toast({
        title: 'Success',
        description: 'Order updated successfully',
      })

      onRefresh()
    } catch (error) {
      console.error('Update order error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update order',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancelOrder = async () => {
    const reason = prompt('Please provide a cancellation reason:')
    if (!reason) return

    setIsUpdating(true)
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          notes: 'Cancelled by admin',
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel order')
      }

      toast({
        title: 'Success',
        description: 'Order cancelled successfully',
      })

      onRefresh()
    } catch (error) {
      console.error('Cancel order error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to cancel order',
        variant: 'destructive',
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const totalRefunded = order.refunds?.reduce((sum: number, refund: any) => 
    refund.status === 'COMPLETED' ? sum + refund.amount : sum, 0
  ) || 0

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Order #{order.orderNumber}</CardTitle>
              <p className="text-muted-foreground">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className={statusColors[order.status as keyof typeof statusColors]}>
              {order.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{order.user.name || order.user.email}</p>
                <p className="text-sm text-muted-foreground">{order.user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{formatCurrency(order.total)}</p>
                <p className="text-sm text-muted-foreground">
                  {totalRefunded > 0 && `Refunded: ${formatCurrency(totalRefunded)}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{order.items.length} items</p>
                <p className="text-sm text-muted-foreground">
                  {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'No tracking'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Order Details</TabsTrigger>
          <TabsTrigger value="returns">Returns ({order.returns?.length || 0})</TabsTrigger>
          <TabsTrigger value="refunds">Refunds ({order.refunds?.length || 0})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({order.timeline?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Order Management */}
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tracking">Tracking Number</Label>
                  <Input
                    id="tracking"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="delivery">Estimated Delivery</Label>
                  <Input
                    id="delivery"
                    type="date"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleUpdateOrder} disabled={isUpdating}>
                  {isUpdating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Update Order
                </Button>
                
                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                  <Button 
                    variant="destructive" 
                    onClick={handleCancelOrder}
                    disabled={isUpdating}
                  >
                    <Ban className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                )}
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
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="relative h-16 w-16 rounded-md overflow-hidden">
                      <Image
                        src={item.product.images[0] || '/placeholder.png'}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.quantity * item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal || order.total)}</span>
                </div>
                {order.discountAmount && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(order.discountAmount)}</span>
                  </div>
                )}
                {order.taxAmount && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatCurrency(order.taxAmount)}</span>
                  </div>
                )}
                {order.shippingAmount && (
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{formatCurrency(order.shippingAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="returns">
          <Card>
            <CardHeader>
              <CardTitle>Return Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {order.returns?.length > 0 ? (
                <div className="space-y-4">
                  {order.returns.map((returnReq: any) => (
                    <div key={returnReq.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Return #{returnReq.returnNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            Requested on {new Date(returnReq.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline">{returnReq.status}</Badge>
                      </div>
                      <p className="text-sm mb-2"><strong>Reason:</strong> {returnReq.reason}</p>
                      {returnReq.description && (
                        <p className="text-sm mb-2"><strong>Description:</strong> {returnReq.description}</p>
                      )}
                      <p className="text-sm"><strong>Items:</strong> {returnReq.items.length}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No return requests</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="refunds">
          <Card>
            <CardHeader>
              <CardTitle>Refunds</CardTitle>
            </CardHeader>
            <CardContent>
              {order.refunds?.length > 0 ? (
                <div className="space-y-4">
                  {order.refunds.map((refund: any) => (
                    <div key={refund.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">Refund #{refund.refundNumber}</h4>
                          <p className="text-sm text-muted-foreground">
                            {refund.processedAt ? 
                              `Processed on ${new Date(refund.processedAt).toLocaleDateString()}` :
                              `Created on ${new Date(refund.createdAt).toLocaleDateString()}`
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{refund.status}</Badge>
                          <p className="font-medium mt-1">{formatCurrency(refund.amount)}</p>
                        </div>
                      </div>
                      <p className="text-sm mb-2"><strong>Type:</strong> {refund.type}</p>
                      <p className="text-sm"><strong>Reason:</strong> {refund.reason}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No refunds</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {order.timeline?.length > 0 ? (
                <div className="space-y-4">
                  {order.timeline.map((event: any) => (
                    <div key={event.id} className="flex space-x-4">
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{event.title}</h4>
                            {event.description && (
                              <p className="text-sm text-muted-foreground">{event.description}</p>
                            )}
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <p>{new Date(event.createdAt).toLocaleDateString()}</p>
                            <p>{new Date(event.createdAt).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        {event.actorName && (
                          <p className="text-xs text-muted-foreground mt-1">
                            by {event.actorName} ({event.actorType})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No timeline events</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
