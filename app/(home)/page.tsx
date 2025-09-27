'use client'

import Image from 'next/image'
import { LatestProducts } from '@/components/home/latest-products'
import { CategoryShowcase } from '@/components/home/category-showcase'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useEffect, useState } from 'react'
import { ShoppingBag, Phone, Sparkles, Lightbulb, Bath, Wrench } from 'lucide-react'

export default function HomePage() {
  const [latestProducts, setLatestProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=8')
        const data = await response.json()
        setLatestProducts(data.products)
      } catch (error) {
        console.error('Error fetching latest products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestProducts()
  }, [])

  const bannerItems = [
    {
      image: '/images/LED-Mirror/LED-365-Mirror.jpg',
      title: 'Premium LED Mirrors',
      description: 'Transform your bathroom with our premium LED mirrors featuring integrated lighting',
    },
    {
      image: '/images/Bathroom/Bathroom Cabinet/Plywood-Cabinet/ZA-8055.png',
      title: 'Luxury Bathroom Cabinets',
      description: 'Discover our elegant collection of premium bathroom cabinets in Dubai, UAE',
    },
    {
      image: '/images/Lighting/LED-Outdoor/led-outdoor-spot-ecomax-ii.png',
      title: 'Professional LED Lighting',
      description: 'High-quality LED lighting solutions for all your residential and commercial needs',
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Enhanced Hero Banner Section */}
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
              ✨ Premium Quality & Professional Service
            </span>
            <h1 className="display-font text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Illuminate Your
              <span className="text-gradient-gold block">Perfect Space</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 leading-relaxed max-w-4xl mx-auto mb-12">
              Transform your home and office with our premium LED lighting solutions and luxury bathroom fixtures. 
              Expert consultation and professional installation included.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <button className="btn-gold text-lg group">
                <ShoppingBag className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                Explore Collection
                <Sparkles className="ml-2 h-4 w-4 opacity-70" />
              </button>
              <button className="btn-ghost-brand text-lg border-white/30 text-white hover:bg-white/10">
                <Phone className="mr-3 h-5 w-5" />
                Free Consultation
              </button>
            </div>
          </div>

          <div className="relative animate-fadeInUp delay-300">
            <Carousel
              opts={{
                loop: true,
              }}
              className="w-full max-w-6xl mx-auto"
            >
              <CarouselContent>
                {bannerItems.map((item, index) => (
                  <CarouselItem key={index}>
                    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl card-glass shadow-2xl group">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent z-10" />
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-contain p-8 transition-transform duration-700 group-hover:scale-105"
                        priority={index === 0}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-900/60 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                        <div className="text-center">
                          <h3 className="text-2xl md:text-3xl font-bold mb-2 text-gold display-font">{item.title}</h3>
                          <p className="text-lg text-blue-100 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      {/* Product Badge */}
                      <div className="absolute top-6 left-6 z-20">
                        <span className="bg-gold text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                          Premium Collection
                        </span>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 glass border-white/30 text-white hover:bg-white/20" />
              <CarouselNext className="right-4 glass border-white/30 text-white hover:bg-white/20" />
            </Carousel>
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

      {/* Category Showcase Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="display-font text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-gradient-brand">Premium</span> Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore our carefully curated collection of luxury lighting and bathroom solutions, 
              designed to transform any space into something extraordinary.
            </p>
          </div>
          <CategoryShowcase />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center animate-fadeInUp delay-100">
              <div className="w-20 h-20 bg-gradient-to-br from-brand to-brand-700 rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                <Lightbulb className="h-10 w-10 text-white" />
              </div>
              <h3 className="display-font text-2xl font-bold text-gray-900 mb-4">Premium LED Lighting</h3>
              <p className="text-gray-600 leading-relaxed">
                Energy-efficient LED solutions with cutting-edge technology and elegant designs for every space.
              </p>
            </div>
            
            <div className="text-center animate-fadeInUp delay-200">
              <div className="w-20 h-20 bg-gradient-to-br from-gold to-gold-700 rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                <Bath className="h-10 w-10 text-white" />
              </div>
              <h3 className="display-font text-2xl font-bold text-gray-900 mb-4">Luxury Bathroom</h3>
              <p className="text-gray-600 leading-relaxed">
                Transform your bathroom into a spa-like sanctuary with our premium fixtures and accessories.
              </p>
            </div>
            
            <div className="text-center animate-fadeInUp delay-300">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl mx-auto mb-6 flex items-center justify-center transform hover:scale-110 transition-transform duration-300">
                <Wrench className="h-10 w-10 text-white" />
              </div>
              <h3 className="display-font text-2xl font-bold text-gray-900 mb-4">Expert Installation</h3>
              <p className="text-gray-600 leading-relaxed">
                Professional installation services by certified technicians with lifetime support guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fadeInUp">
            <h2 className="display-font text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Latest <span className="text-gradient-gold">Products</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our newest collection of premium bathroom fixtures and professional lighting solutions, 
              carefully selected for their quality, design, and innovation.
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => (
                <div key={i} className="card-enhanced animate-fadeInUp" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="bg-gray-200 shimmer rounded-xl h-48 mb-4"></div>
                  <div className="space-y-3">
                    <div className="bg-gray-200 shimmer rounded h-6 w-3/4"></div>
                    <div className="bg-gray-200 shimmer rounded h-4 w-1/2"></div>
                    <div className="bg-gray-200 shimmer rounded h-8 w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <LatestProducts products={latestProducts} />
          )}
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 hero-gradient text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="display-font text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="text-gold">Noor AlTayseer</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              We&apos;re committed to delivering excellence in every project, backed by years of experience 
              and a passion for transforming spaces.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center glass p-6 rounded-2xl animate-fadeInUp delay-100">
              <div className="text-3xl font-bold text-gold mb-2">500+</div>
              <div className="text-blue-100">Projects Completed</div>
            </div>
            <div className="text-center glass p-6 rounded-2xl animate-fadeInUp delay-200">
              <div className="text-3xl font-bold text-gold mb-2">2 Years</div>
              <div className="text-blue-100">Warranty Coverage</div>
            </div>
            <div className="text-center glass p-6 rounded-2xl animate-fadeInUp delay-300">
              <div className="text-3xl font-bold text-gold mb-2">24/7</div>
              <div className="text-blue-100">Customer Support</div>
            </div>
            <div className="text-center glass p-6 rounded-2xl animate-fadeInUp delay-400">
              <div className="text-3xl font-bold text-gold mb-2">100%</div>
              <div className="text-blue-100">Satisfaction Guarantee</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}