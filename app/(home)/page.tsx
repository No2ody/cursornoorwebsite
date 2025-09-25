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
    <div className="space-y-16 pt-32">
      {/* Hero Banner Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 transform transition-all duration-500">
        <div className="relative">
          <Carousel
            opts={{
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {bannerItems.map((item, index) => (
                <CarouselItem key={index}>
                  <div className="relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-xl">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-contain p-8 transition-transform duration-700 hover:scale-105"
                      priority={index === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-purple-900/80" />
                    <div className="absolute inset-0 flex items-center justify-center text-center text-white max-w-4xl mx-auto px-6 transform transition-all duration-500">
                      <div>
                        <h3 className="text-4xl md:text-5xl font-bold mb-4 text-yellow-300">{item.title}</h3>
                        <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4 md:left-8 bg-white/80 hover:bg-white/90" />
            <CarouselNext className="right-4 md:right-8 bg-white/80 hover:bg-white/90" />
          </Carousel>
        </div>
      </section>

      {/* Category Showcase Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 transform transition-all duration-500">
        <CategoryShowcase />
      </section>

      {/* Latest Products Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 transform transition-all duration-500">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 transform transition-all duration-300">
            Latest Products
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto transform transition-all duration-300">
            Discover our newest collection of premium bathroom fixtures and professional lighting solutions
          </p>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-gray-200 animate-pulse rounded-2xl h-64"></div>
            ))}
          </div>
        ) : (
          <LatestProducts products={latestProducts} />
        )}
      </section>
    </div>
  )
}