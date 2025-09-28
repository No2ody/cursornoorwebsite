import { CategoryForm } from '@/components/admin/categories/category-form'

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Category</h1>
        <p className="text-muted-foreground">
          Add a new category to organize your products
        </p>
      </div>

      <CategoryForm />
    </div>
  )
}
