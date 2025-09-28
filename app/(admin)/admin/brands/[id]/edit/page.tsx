import { notFound } from 'next/navigation'
import { BrandForm } from '@/components/admin/brands/brand-form'
import prisma from '@/lib/prisma'

interface EditBrandPageProps {
  params: Promise<{ id: string }>
}

export default async function EditBrandPage({ params }: EditBrandPageProps) {
  const { id } = await params

  const brand = await prisma.brand.findUnique({
    where: { id },
  })

  if (!brand) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Brand</h1>
        <p className="text-muted-foreground">
          Update brand information and settings
        </p>
      </div>

      <BrandForm brand={brand} />
    </div>
  )
}
