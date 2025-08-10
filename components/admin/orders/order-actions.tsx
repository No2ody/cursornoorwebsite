'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { MoreHorizontal, Package, Truck, CheckCircle, XCircle } from 'lucide-react'

interface OrderActionsProps {
  orderId: string
  currentStatus: string
}

const orderStatuses = [
  { value: 'PENDING', label: 'Pending', icon: Package },
  { value: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { value: 'PROCESSING', label: 'Processing', icon: Package },
  { value: 'SHIPPED', label: 'Shipped', icon: Truck },
  { value: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
  { value: 'CANCELLED', label: 'Cancelled', icon: XCircle },
]

export function OrderActions({ orderId, currentStatus }: OrderActionsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleStatusUpdate = async (newStatus: string) => {
    if (newStatus === currentStatus) return

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      })

      router.refresh()
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0' disabled={loading}>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-48'>
        <div className='p-2'>
          <label className='text-xs font-medium text-gray-500 mb-2 block'>
            Update Status
          </label>
          <Select onValueChange={handleStatusUpdate} defaultValue={currentStatus}>
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {orderStatuses.map((status) => {
                const Icon = status.icon
                return (
                  <SelectItem key={status.value} value={status.value}>
                    <div className='flex items-center gap-2'>
                      <Icon className='h-4 w-4' />
                      {status.label}
                    </div>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
