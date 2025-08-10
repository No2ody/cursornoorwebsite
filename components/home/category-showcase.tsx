'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Zap, Home, Bath } from 'lucide-react'

interface Category {
  id: string
  name: string
  description: string
  image: string
}

// Category image mapping with our available images
const categoryImageMap: Record<string, string> = {
  'Bathroom': '/images/Bathroom/Bathroom Cabinet/Cateogry_Bathroom_Cabinet.jpg',
  'Bathroom Cabinet': '/images/Bathroom/Bathroom Cabinet/Cateogry_Bathroom_Cabinet.jpg',
  'PVC Cabinet': '/images/Bathroom/Bathroom Cabinet/Cateogry_Bathroom_Cabinet.jpg',
  'Plywood Cabinet': '/images/Bathroom/Bathroom Cabinet/Cateogry_Bathroom_Cabinet.jpg',
  'Rock Stone Cabinet': '/images/Bathroom/Bathroom Cabinet/Cateogry_Bathroom_Cabinet.jpg',
  'Bathtubs': '/images/Bathroom/Bathtub/Category_Bathtub.jpg',
  'Smart Controls and Lighting': '/images/Lighting/Smart-Controls-and-Lighting/Category_Smart_Lighting.png',
  'Switches & Sockets': '/images/Lighting/Switches-and-Sockets/Category_Switch_Socket_F1_Series.png',
  'Table and Mirror Lamps': '/images/Lighting/Table-and-Mirror Lamps/mirror_lamp_LED_Xiaobai.png',
  'LED Strips and Tube Lights': '/images/Lighting/LED-Strips-and-Tube lights/Category_Tube_Batten_Light.png',
  'LED Outdoor': '/images/Lighting/LED-Outdoor/Category_LED_Outdoor_Lighting.png',
  'LED Panel': '/images/Lighting/LED-Panel/Category_LED_Panel.png',
  'LED Power Bulb': '/images/Lighting/LED-Power-Bulb/Category_high_power_bulb.png',
  'LED Spotlight': '/images/Lighting/LED-Spotlight/Category_LED_Spotlight.png',
  'LED Industrial': '/images/Lighting/LED-Industrial/Category_LED_Industrial_Lighting.png',
  'LED Landscape': '/images/Lighting/LED-Landscape/Category_LED_Landscape_light.png',
  'LED Linear Indoor': '/images/Lighting/LED-Linear-Indoor/Category_LED_linear_indoor.png',
  'LED Flood Light': '/images/Lighting/LED-Flood-Light/Category_Flood_Light.png',
  'Ceiling Lamps': '/images/Lighting/Ceiling-Lamps/Category_Ceiling_lamps.png',
  'LED Downlight': '/images/Lighting/LED-Downlight/Category_LED_downlight.png',
  'LED Mirror': '/images/LED-Mirror/Category_Led_Mirror.jpg',
}

// Featured categories to highlight
const featuredCategories = [
  'LED Mirror',
  'Bathtubs', 
  'Smart Controls and Lighting',
  'LED Outdoor',
  'PVC Cabinet',
  'LED Spotlight'
]

export function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='h-80 bg-gray-200 rounded-xl animate-pulse' />
        ))}
      </div>
    )
  }

  const getIcon = (categoryName: string) => {
    if (categoryName.toLowerCase().includes('bathroom') || categoryName.toLowerCase().includes('bathtub') || categoryName.toLowerCase().includes('cabinet')) {
      return <Bath className='w-5 h-5' />
    }
    if (categoryName.toLowerCase().includes('led') || categoryName.toLowerCase().includes('light') || categoryName.toLowerCase().includes('switch')) {
      return <Zap className='w-5 h-5' />
    }
    return <Home className='w-5 h-5' />
  }

  const getBadgeColor = (categoryName: string) => {
    if (categoryName.toLowerCase().includes('bathroom') || categoryName.toLowerCase().includes('bathtub') || categoryName.toLowerCase().includes('cabinet')) {
      return 'bg-blue-100 text-blue-800 border-blue-200'
    }
    if (categoryName.toLowerCase().includes('led') || categoryName.toLowerCase().includes('light') || categoryName.toLowerCase().includes('switch')) {
      return 'bg-amber-100 text-amber-800 border-amber-200'
    }
    return 'bg-purple-100 text-purple-800 border-purple-200'
  }

  // Filter and sort categories to show featured ones first
  const sortedCategories = categories.sort((a, b) => {
    const aFeatured = featuredCategories.includes(a.name)
    const bFeatured = featuredCategories.includes(b.name)
    if (aFeatured && !bFeatured) return -1
    if (!aFeatured && bFeatured) return 1
    return 0
  })

  return (
    <section className='space-y-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='text-center space-y-4'
      >
        <h2 className='text-3xl md:text-4xl font-bold text-gray-900'>
          Explore Our Categories
        </h2>
        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
          Discover premium lighting solutions and bathroom fixtures designed for modern living
        </p>
      </motion.div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {sortedCategories.slice(0, 6).map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className='group'
          >
            <Card className='overflow-hidden border-0 shadow-xl bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2'>
              <CardContent className='p-0'>
                <div className='relative h-64 overflow-hidden'>
                  <Image
                    src={categoryImageMap[category.name] || category.image || '/images/NoorAlTayseer_logo.png'}
                    alt={category.name}
                    fill
                    className='object-cover transition-transform duration-700 group-hover:scale-110'
                  />
                  <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
                  
                  {/* Badge */}
                  <div className='absolute top-4 left-4'>
                    <Badge className={`${getBadgeColor(category.name)} backdrop-blur-sm`}>
                      {getIcon(category.name)}
                      <span className='ml-1'>
                        {featuredCategories.includes(category.name) ? 'Featured' : 'Premium'}
                      </span>
                    </Badge>
                  </div>
                  
                  {/* Content */}
                  <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                    <h3 className='text-xl font-bold mb-2 group-hover:text-yellow-300 transition-colors'>
                      {category.name}
                    </h3>
                    <p className='text-sm text-gray-200 mb-4 line-clamp-2'>
                      {category.description}
                    </p>
                    <Button
                      asChild
                      size='sm'
                      className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 text-white transform transition-all duration-200 hover:scale-105'
                    >
                      <Link href={`/products?category=${category.id}`}>
                        Explore
                        <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* View All Categories Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className='text-center pt-8'
      >
        <Button
          asChild
          size='lg'
          variant='outline'
          className='bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800 px-8 py-3'
        >
          <Link href='/products'>
            View All Categories
            <ArrowRight className='w-5 h-5 ml-2' />
          </Link>
        </Button>
      </motion.div>
    </section>
  )
}
