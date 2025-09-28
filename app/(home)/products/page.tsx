'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
// Removed framer-motion for build compatibility
import { ProductGrid } from '@/components/products/product-grid'
import { AdvancedFilterSidebar } from '@/components/products/advanced-filter-sidebar'
import { MobileFilterDrawer } from '@/components/products/mobile-filter-drawer'
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
  const brands = searchParams.get('brands')
  const rating = searchParams.get('rating')
  const availability = searchParams.get('availability')
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
          ...(brands && { brands }),
          ...(rating && { rating }),
          ...(availability && { availability }),
          ...(sort && { sort }),
        })

        const response = await fetch(`/api/products?${queryParams}`)
        const data = await response.json()

        setProducts(data.products || [])
        setTotalPages(Math.ceil((data.total || 0) / (data.perPage || 12)))
      } catch (error) {
        console.error('Error fetching products:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, search, minPrice, maxPrice, brands, rating, availability, sort, currentPage])

  return (
    <div className='min-h-screen'>
      {/* Enhanced Hero Section */}
      <section className="hero-gradient text-white overflow-hidden relative pt-32 pb-20">
        {/* Background Pattern */}
        <div className='absolute inset-0 opacity-10'>
          <div className='absolute inset-0' style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 animate-fadeInUp">
            <span className="inline-block bg-white/20 backdrop-blur-sm text-gold px-6 py-3 rounded-full text-sm font-medium mb-6">
              ✨ Premium Quality Collection
            </span>
            <h1 className="display-font text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Our Premium
              <span className="text-gradient-gold block">Products</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-4xl mx-auto mb-12">
              Discover our comprehensive collection of premium LED lighting solutions and luxury bathroom fixtures. 
              Professional quality meets elegant design.
            </p>
          </div>
        </div>
        
        {/* Wave Transition */}
        <div className='absolute bottom-0 left-0 right-0'>
          <svg 
            viewBox="0 0 1200 120" 
            preserveAspectRatio="none" 
            className='relative block w-full h-16 fill-gray-50'
          >
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"></path>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex flex-col lg:flex-row gap-8'>
            {/* Enhanced Sidebar */}
            <aside className='w-full lg:w-80'>
              <div className='card-enhanced p-6 mb-6'>
                <h2 className='text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2 display-font'>
                  <div className='w-1 h-6 bg-brand rounded-full'></div>
                  Filter Products
                </h2>
                <AdvancedFilterSidebar />
              </div>
              
              {/* Professional Info Cards */}
              <div className='space-y-4'>
                <div className='card-enhanced bg-gradient-to-br from-brand to-brand-700 p-6 text-white animate-fadeInLeft'>
                  <h3 className='font-semibold mb-2 display-font'>Expert Consultation</h3>
                  <p className='text-sm text-blue-100 mb-4'>
                    Need help choosing the right products? Our lighting experts are here to help.
                  </p>
                  <button className='btn-ghost-brand border-white/30 text-white hover:bg-white/10 text-sm'>
                    Get Free Consultation
                  </button>
                </div>

                <div className='card-enhanced bg-gradient-to-br from-gold to-gold-700 p-6 text-white animate-fadeInLeft delay-100'>
                  <h3 className='font-semibold mb-2 display-font'>Professional Installation</h3>
                  <p className='text-sm text-yellow-100 mb-4'>
                    Professional installation services available for all products.
                  </p>
                  <button className='btn-ghost-brand border-white/30 text-white hover:bg-white/10 text-sm'>
                    Learn More
                  </button>
                </div>

                <div className='card-enhanced p-6 animate-fadeInLeft delay-200'>
                  <h3 className='font-semibold text-gray-900 mb-2 display-font'>Need Help?</h3>
                  <p className='text-sm text-gray-600 mb-4'>
                    Contact our support team for product recommendations.
                  </p>
                  <div className='flex flex-col gap-3'>
                    <a href='tel:+971505382246' className='flex items-center gap-2 text-brand hover:text-brand-700 text-sm font-medium transition-colors'>
                      <span className='text-lg'>📞</span> +971 50 538 2246
                    </a>
                    <a href='mailto:info@nooraltayseer.com' className='flex items-center gap-2 text-brand hover:text-brand-700 text-sm font-medium transition-colors'>
                      <span className='text-lg'>✉️</span> info@nooraltayseer.com
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Product Grid */}
            <main className='flex-1'>
              {/* Mobile Filter Button */}
              <div className='lg:hidden mb-6 animate-fadeInRight'>
                <MobileFilterDrawer />
              </div>
              
              <div className='card-enhanced p-6 min-h-[600px] animate-fadeInRight'>
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
      </section>
    </div>
  )
}
