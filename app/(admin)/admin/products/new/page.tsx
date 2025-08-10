import { redirect } from 'next/navigation'
import { auth } from '@/auth'

import { ProductForm } from '@/components/admin/products/product-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewProductPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className='space-y-8'>
      {/* Header with Back Button */}
      <div className='flex items-center gap-4'>
        <Button variant='outline' size='sm' asChild>
          <Link href='/admin/products'>
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Products
          </Link>
        </Button>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>Add New Product</h1>
          <p className='text-gray-600 mt-2'>
            Create a new product for your catalog
          </p>
        </div>
      </div>

      {/* Product Form */}
      <Card className='border-0 shadow-lg'>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  )
}
