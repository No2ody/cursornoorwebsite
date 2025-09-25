'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
// Removed framer-motion for build compatibility
import { ProductGrid } from '@/components/products/product-grid'
import { ProductSidebar } from '@/components/products/product-sidebar'
import { Product } from '@prisma/client'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sort = searchParams.get('sort')

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      try {
        const queryParams = new URLSearchParams({
          page: currentPage.toString(),
          ...(category && { category }),
          ...(search && { search }),
          ...(minPrice && { minPrice }),
          ...(maxPrice && { maxPrice }),
          ...(sort && { sort }),
        })

        const response = await fetch(`/api/products?${queryParams}`)
        const data = await response.json()

        setProducts(data.products)
        setTotalPages(Math.ceil(data.total / data.perPage))
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, search, minPrice, maxPrice, sort, currentPage])

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50'>
      {/* Hero Section */}
      <div className='bg-gradient-to-r from-brand to-brand-700 text-white py-16 pt-24'>
        <div className='container mx-auto px-4'>
          <div className='text-center'>
            <h1 className='text-4xl md:text-5xl font-bold mb-4'>Our Products</h1>
            <p className='text-xl text-brand-100 max-w-2xl mx-auto'>
              Discover our comprehensive collection of premium LED lighting and bathroom fixtures
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='container mx-auto px-4 py-12'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar with Enhanced Design */}
          <aside className='w-full lg:w-80'>
            <div className='bg-white rounded-2xl shadow-card border border-gray-100 p-6 mb-6'>
              <h2 className='text-xl font-semibold text-ink mb-6 flex items-center gap-2'>
                <div className='w-1 h-6 bg-brand rounded-full'></div>
                Filter Products
              </h2>
              <ProductSidebar />
            </div>
            
            {/* Professional Info Cards */}
            <div className='space-y-4'>
              <div className='bg-gradient-to-br from-brand to-brand-700 rounded-2xl p-6 text-white'>
                <h3 className='font-semibold mb-2'>Expert Consultation</h3>
                <p className='text-sm text-brand-100 mb-3'>
                  Need help choosing the right products? Our lighting experts are here to help.
                </p>
                <button className='bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all'>
                  Get Free Consultation
                </button>
              </div>

              <div className='bg-gradient-to-br from-gold to-gold-700 rounded-2xl p-6 text-white'>
                <h3 className='font-semibold mb-2'>Professional Installation</h3>
                <p className='text-sm text-gold-100 mb-3'>
                  Professional installation services available for all products.
                </p>
                <button className='bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all'>
                  Learn More
                </button>
              </div>

              <div className='bg-white rounded-2xl p-6 border border-gray-100 shadow-card'>
                <h3 className='font-semibold text-ink mb-2'>Need Help?</h3>
                <p className='text-sm text-gray-600 mb-3'>
                  Contact our support team for product recommendations.
                </p>
                <div className='flex flex-col gap-2'>
                  <a href='tel:+971505382246' className='text-brand hover:text-brand-700 text-sm font-medium'>
                    📞 +971 50 538 2246
                  </a>
                  <a href='mailto:info@nooraltayseer.com' className='text-brand hover:text-brand-700 text-sm font-medium'>
                    ✉️ info@nooraltayseer.com
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Product Grid */}
          <main className='flex-1'>
            <div className='bg-white rounded-2xl shadow-card border border-gray-100 p-6 min-h-[600px]'>
              <ProductGrid
                products={products}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
