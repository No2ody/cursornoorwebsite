import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'
import { ProductGallery } from '@/components/products/product-gallery'
import { ProductInfo } from '@/components/products/product-info'
import { ProductSpecifications } from '@/components/products/product-specifications'
import { ProductReviews } from '@/components/products/product-reviews'
import { ProductRelated } from '@/components/products/product-related'
import { ProductShipping } from '@/components/products/product-shipping'
import { ProductPromotions } from '@/components/products/product-promotions'
import { ProductBreadcrumb } from '@/components/products/product-breadcrumb'

type tParams = Promise<{ id: string }>

interface ProductPageProps {
  params: tParams
}

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: {
          user: true,
        },
      },
    },
  })

  if (!product) {
    notFound()
  }

  return product
}

export default async function ProductPage(props: ProductPageProps) {
  const { id } = await props.params
  const product = await getProduct(id)

  return (
    <div className='bg-gradient-to-br from-gray-50 via-white to-brand-50 min-h-[calc(100vh-8rem)]'>
      {/* Breadcrumb Navigation */}
      <section className="py-8 bg-white">
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <ProductBreadcrumb product={product} />
        </div>
      </section>

      {/* Main Product Section */}
      <section className="py-12 bg-white">
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16'>
            {/* Enhanced Product Gallery */}
            <div className="animate-fadeInLeft">
              <ProductGallery images={product.images} />
            </div>

            {/* Enhanced Product Information */}
            <div className="animate-fadeInRight space-y-8">
              <ProductInfo product={product} />
              
              {/* Product Promotions */}
              <ProductPromotions product={product} />
              
              {/* Shipping Information */}
              <ProductShipping product={product} />
            </div>
          </div>
        </div>
      </section>

      {/* Product Details Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Specifications */}
            <div className="lg:col-span-2 animate-fadeInUp">
              <ProductSpecifications product={product} />
            </div>

            {/* Seller Information Card */}
            <div className="animate-fadeInUp delay-200">
              <div className="card-enhanced p-6 h-fit">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 display-font">
                  Seller Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand to-brand-700 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Noor AlTayseer</p>
                      <p className="text-sm text-gray-600">Premium Lighting & Bathroom Solutions</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Seller Rating:</span>
                      <span className="font-medium text-green-600">★★★★★ (4.9/5)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time:</span>
                      <span className="font-medium">Within 2 hours</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ship On Time:</span>
                      <span className="font-medium text-green-600">98%</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <button className="w-full btn-ghost-brand text-sm">
                      Contact Seller
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-16 bg-white">
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className="animate-fadeInUp">
            <ProductReviews productId={product.id} />
          </div>
        </div>
      </section>

      {/* Related Products */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className="animate-fadeInUp">
            <ProductRelated
              categoryId={product.categoryId}
              currentProductId={product.id}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
