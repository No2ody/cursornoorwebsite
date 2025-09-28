import { BrandForm } from '@/components/admin/brands/brand-form'

export default function NewBrandPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Brand</h1>
        <p className="text-muted-foreground">
          Add a new brand to your catalog
        </p>
      </div>

      <BrandForm />
    </div>
  )
}
