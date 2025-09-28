import { notFound } from 'next/navigation'
import { CategoryForm } from '@/components/admin/categories/category-form'
import prisma from '@/lib/prisma'

interface EditCategoryPageProps {
  params: Promise<{ id: string }>
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params

  const category = await prisma.category.findUnique({
    where: { id },
  })

  if (!category) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
        <p className="text-muted-foreground">
          Update category information and settings
        </p>
      </div>

      <CategoryForm category={category} />
    </div>
  )
}
