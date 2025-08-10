'use client'

import Image from 'next/image'
import { LatestProducts } from '@/components/home/latest-products'
import { CategoryShowcase } from '@/components/home/category-showcase'
import { motion } from 'framer-motion'
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
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products?limit=8')
        const data = await response.json()
        setLatestProducts(data.products || [])
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
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
    <div className='space-y-16 pt-32'>
      {/* Hero Banner Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='container mx-auto px-4 sm:px-6 lg:px-8'
      >
        <div className='relative'>
          <Carousel
            opts={{
              loop: true,
            }}
            className='w-full'
          >
            <CarouselContent>
              {bannerItems.map((item, index) => (
                <CarouselItem key={index}>
                  <div className='relative aspect-[21/9] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-xl'>
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className='object-contain p-8 transition-transform duration-700 hover:scale-105'
                      priority={index === 0}
                    />
                    <div className='absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/60 to-purple-900/80' />
                    <motion.div 
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className='absolute inset-0 flex items-center justify-center text-center text-white max-w-4xl mx-auto px-6'
                    >
                      <div>
                        <h3 className='text-4xl md:text-5xl font-bold mb-4 text-yellow-300'>{item.title}</h3>
                        <p className='text-xl md:text-2xl text-gray-200 leading-relaxed'>
                          {item.description}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className='left-4 md:left-8 bg-white/80 hover:bg-white/90' />
            <CarouselNext className='right-4 md:right-8 bg-white/80 hover:bg-white/90' />
          </Carousel>
        </div>
      </motion.section>

      {/* Category Showcase Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className='container mx-auto px-4 sm:px-6 lg:px-8'
      >
        <CategoryShowcase />
      </motion.section>

      {/* Latest Products Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className='container mx-auto px-4 sm:px-6 lg:px-8'
      >
        <div className='text-center mb-12'>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'
          >
            Latest Products
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className='text-xl text-gray-600 max-w-3xl mx-auto'
          >
            Discover our newest collection of premium bathroom fixtures and professional lighting solutions
          </motion.p>
        </div>
        
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[1,2,3,4].map(i => (
              <div key={i} className='bg-gray-200 animate-pulse rounded-2xl h-64'></div>
            ))}
          </div>
        ) : (
          <LatestProducts products={latestProducts} />
        )}
      </motion.section>
    </div>
  )
}
