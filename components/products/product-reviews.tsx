'use client'

import { useState } from 'react'
import { Separator } from '@/components/ui/separator'
import { ReviewForm } from './review-form'
import { ReviewList } from './review-list'

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleReviewSubmitted = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='text-2xl font-bold mb-2'>Customer Reviews</h2>
        <p className='text-muted-foreground'>
          Share your experience with this product and help other customers make informed decisions.
        </p>
      </div>

      <Separator />

      {/* Review Form */}
      <ReviewForm 
        productId={productId} 
        onReviewSubmitted={handleReviewSubmitted}
      />

      <Separator />

      {/* Reviews List */}
      <ReviewList 
        productId={productId} 
        refreshTrigger={refreshTrigger}
      />
    </div>
  )
}
