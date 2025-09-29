import prisma from '@/lib/prisma'
import { OrderStatus, OrderTimelineEvent, OrderActorType, OrderReturnStatus, OrderRefundStatus } from '@prisma/client'

// Generate a human-readable order number
export function generateOrderNumber(): string {
  const prefix = 'NO' // Noor Order
  const timestamp = Date.now().toString().slice(-8) // Last 8 digits of timestamp
  const random = Math.random().toString(36).substring(2, 6).toUpperCase() // 4 random chars
  return `${prefix}${timestamp}${random}`
}

// Add timeline event to an order
export async function addOrderTimelineEvent({
  orderId,
  event,
  title,
  description,
  actorType = OrderActorType.SYSTEM,
  actorId,
  actorName,
  metadata,
}: {
  orderId: string
  event: OrderTimelineEvent
  title: string
  description?: string
  actorType?: OrderActorType
  actorId?: string
  actorName?: string
  metadata?: any
}) {
  return await prisma.orderTimeline.create({
    data: {
      orderId,
      event,
      title,
      description,
      actorType,
      actorId,
      actorName,
      metadata,
    },
  })
}

// Update order status with timeline tracking
export async function updateOrderStatus({
  orderId,
  status,
  notes,
  actorId,
  actorName,
  actorType = OrderActorType.ADMIN,
}: {
  orderId: string
  status: OrderStatus
  notes?: string
  actorId?: string
  actorName?: string
  actorType?: OrderActorType
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, orderNumber: true },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  if (order.status === status) {
    throw new Error('Order is already in this status')
  }

  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status,
      ...(notes && { notes }),
      ...(status === OrderStatus.DELIVERED && { actualDelivery: new Date() }),
    },
  })

  // Add timeline event
  await addOrderTimelineEvent({
    orderId,
    event: OrderTimelineEvent.STATUS_CHANGED,
    title: `Order status changed to ${status}`,
    description: notes,
    actorType,
    actorId,
    actorName,
    metadata: {
      previousStatus: order.status,
      newStatus: status,
    },
  })

  return updatedOrder
}

// Cancel an order
export async function cancelOrder({
  orderId,
  reason,
  notes,
  cancelledBy,
  actorName,
  actorType = OrderActorType.ADMIN,
}: {
  orderId: string
  reason: string
  notes?: string
  cancelledBy: string
  actorName?: string
  actorType?: OrderActorType
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { 
      status: true, 
      orderNumber: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  // Check if order can be cancelled
  const cancellableStatuses = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
  ]

  if (!cancellableStatuses.includes(order.status as any)) {
    throw new Error(`Cannot cancel order with status: ${order.status}`)
  }

  // Start transaction to cancel order and restore stock
  const result = await prisma.$transaction(async (tx) => {
    // Update order
    const cancelledOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancellationReason: reason,
        cancellationNotes: notes,
        cancelledAt: new Date(),
        cancelledBy,
      },
    })

    // Restore product stock
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
        },
      })
    }

    // Add timeline event
    await tx.orderTimeline.create({
      data: {
        orderId,
        event: OrderTimelineEvent.ORDER_CANCELLED,
        title: 'Order cancelled',
        description: `Reason: ${reason}${notes ? `. Notes: ${notes}` : ''}`,
        actorType,
        actorId: cancelledBy,
        actorName,
        metadata: {
          reason,
          notes,
          restoredStock: order.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    })

    return cancelledOrder
  })

  return result
}

// Create a return request
export async function createReturnRequest({
  orderId,
  items,
  reason,
  description,
  images = [],
  requestedBy,
}: {
  orderId: string
  items: Array<{
    orderItemId: string
    quantity: number
    reason: string
    condition?: string
  }>
  reason: string
  description?: string
  images?: string[]
  requestedBy: string
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { 
      status: true, 
      orderNumber: true,
      items: true,
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  // Check if order is eligible for returns
  const returnableStatuses = [OrderStatus.DELIVERED]
  if (!returnableStatuses.includes(order.status as any)) {
    throw new Error(`Cannot create return for order with status: ${order.status}`)
  }

  // Validate return items
  for (const item of items) {
    const orderItem = order.items.find(oi => oi.id === item.orderItemId)
    if (!orderItem) {
      throw new Error(`Order item ${item.orderItemId} not found`)
    }
    if (item.quantity > orderItem.quantity) {
      throw new Error(`Cannot return more than ordered quantity for item ${item.orderItemId}`)
    }
  }

  // Create return request
  const returnRequest = await prisma.orderReturn.create({
    data: {
      orderId,
      reason,
      description,
      images,
      requestedBy,
      items: {
        create: items.map(item => ({
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          reason: item.reason,
          condition: item.condition,
        })),
      },
    },
    include: {
      items: true,
    },
  })

  // Add timeline event
  await addOrderTimelineEvent({
    orderId,
    event: OrderTimelineEvent.RETURN_REQUESTED,
    title: 'Return request created',
    description: `Return request #${returnRequest.returnNumber} created`,
    actorType: OrderActorType.CUSTOMER,
    actorId: requestedBy,
    metadata: {
      returnId: returnRequest.id,
      returnNumber: returnRequest.returnNumber,
      itemCount: items.length,
    },
  })

  return returnRequest
}

// Process return request (approve/reject)
export async function processReturnRequest({
  returnId,
  approved,
  reviewNotes,
  reviewedBy,
  actorName,
}: {
  returnId: string
  approved: boolean
  reviewNotes?: string
  reviewedBy: string
  actorName?: string
}) {
  const returnRequest = await prisma.orderReturn.findUnique({
    where: { id: returnId },
    include: { order: true },
  })

  if (!returnRequest) {
    throw new Error('Return request not found')
  }

  if (returnRequest.status !== OrderReturnStatus.REQUESTED) {
    throw new Error(`Cannot process return with status: ${returnRequest.status}`)
  }

  const newStatus = approved ? OrderReturnStatus.APPROVED : OrderReturnStatus.REJECTED
  
  const updatedReturn = await prisma.orderReturn.update({
    where: { id: returnId },
    data: {
      status: newStatus,
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes,
    },
  })

  // Add timeline event
  await addOrderTimelineEvent({
    orderId: returnRequest.orderId,
    event: approved ? OrderTimelineEvent.RETURN_APPROVED : OrderTimelineEvent.RETURN_REJECTED,
    title: `Return request ${approved ? 'approved' : 'rejected'}`,
    description: reviewNotes,
    actorType: OrderActorType.ADMIN,
    actorId: reviewedBy,
    actorName,
    metadata: {
      returnId,
      returnNumber: returnRequest.returnNumber,
      approved,
    },
  })

  return updatedReturn
}

// Create a refund
export async function createRefund({
  orderId,
  amount,
  type,
  reason,
  description,
  processedBy,
  actorName,
  returnId,
}: {
  orderId: string
  amount: number
  type: 'FULL' | 'PARTIAL' | 'SHIPPING_ONLY' | 'TAX_ONLY'
  reason: string
  description?: string
  processedBy: string
  actorName?: string
  returnId?: string
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { 
      total: true, 
      orderNumber: true,
      refunds: {
        where: {
          status: { in: [OrderRefundStatus.COMPLETED, OrderRefundStatus.PROCESSING] }
        }
      }
    },
  })

  if (!order) {
    throw new Error('Order not found')
  }

  // Calculate total already refunded
  const totalRefunded = order.refunds.reduce((sum, refund) => sum + refund.amount, 0)
  
  // Validate refund amount
  if (totalRefunded + amount > order.total) {
    throw new Error('Refund amount exceeds remaining refundable amount')
  }

  const refund = await prisma.orderRefund.create({
    data: {
      orderId,
      amount,
      type: type as any,
      reason,
      description,
      processedBy,
      processedAt: new Date(),
      status: OrderRefundStatus.PROCESSING,
      returnId,
    },
  })

  // Add timeline event
  await addOrderTimelineEvent({
    orderId,
    event: OrderTimelineEvent.REFUND_INITIATED,
    title: `Refund initiated`,
    description: `${type} refund of AED ${amount.toFixed(2)} initiated`,
    actorType: OrderActorType.ADMIN,
    actorId: processedBy,
    actorName,
    metadata: {
      refundId: refund.id,
      refundNumber: refund.refundNumber,
      amount,
      type,
    },
  })

  return refund
}

// Get order with full details for management
export async function getOrderDetails(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              images: true,
              price: true,
            },
          },
        },
      },
      shippingAddress: true,
      returns: {
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      refunds: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      timeline: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  })
}

// Populate order numbers for existing orders (if needed)
export async function populateOrderNumbers() {
  // Since orderNumber has a default value, this function is not needed
  // but kept for backward compatibility
  return 0
}
