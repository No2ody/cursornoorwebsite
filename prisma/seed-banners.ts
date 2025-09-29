import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🎨 Seeding banners...')

  // Sample banner data
  const banners = [
    // Hero Banners
    {
      title: 'Premium LED Lighting Solutions',
      description: 'Discover our extensive collection of energy-efficient LED lights for modern homes and businesses',
      imageUrl: '/images/banners/led-lighting-hero.jpg',
      linkUrl: '/products?category=lighting',
      linkText: 'Shop LED Lights',
      position: 'HERO' as const,
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'Luxury Bathroom Fixtures',
      description: 'Transform your bathroom with our premium fixtures, faucets, and accessories',
      imageUrl: '/images/banners/bathroom-luxury-hero.jpg',
      linkUrl: '/products?category=bathroom',
      linkText: 'Explore Bathroom',
      position: 'HERO' as const,
      displayOrder: 2,
      isActive: true,
    },
    {
      title: 'Smart Home Lighting',
      description: 'Control your lighting with intelligent systems and automated solutions',
      imageUrl: '/images/banners/smart-lighting-hero.jpg',
      linkUrl: '/products?category=smart-lighting',
      linkText: 'Go Smart',
      position: 'HERO' as const,
      displayOrder: 3,
      isActive: true,
    },

    // Secondary Banners
    {
      title: 'New Arrivals - Modern Ceiling Lights',
      description: 'Latest collection of contemporary ceiling fixtures',
      imageUrl: '/images/banners/ceiling-lights-secondary.jpg',
      linkUrl: '/products?category=ceiling-lights&sort=newest',
      linkText: 'View New Arrivals',
      position: 'SECONDARY' as const,
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'Professional Installation Services',
      description: 'Expert installation for all lighting and bathroom projects',
      imageUrl: '/images/banners/installation-services.jpg',
      linkUrl: '/services/installation',
      linkText: 'Book Service',
      position: 'SECONDARY' as const,
      displayOrder: 2,
      isActive: true,
    },

    // Sidebar Banners
    {
      title: 'Free Consultation',
      description: 'Get expert advice for your lighting project',
      imageUrl: '/images/banners/consultation-sidebar.jpg',
      linkUrl: '/contact?service=consultation',
      linkText: 'Book Now',
      position: 'SIDEBAR' as const,
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'Bulk Orders',
      description: 'Special pricing for contractors and businesses',
      imageUrl: '/images/banners/bulk-orders-sidebar.jpg',
      linkUrl: '/business/bulk-orders',
      linkText: 'Learn More',
      position: 'SIDEBAR' as const,
      displayOrder: 2,
      isActive: true,
    },
    {
      title: 'Energy Savings',
      description: 'Save up to 80% on electricity with LED lighting',
      imageUrl: '/images/banners/energy-savings-sidebar.jpg',
      linkUrl: '/learn/energy-efficiency',
      linkText: 'Calculate Savings',
      position: 'SIDEBAR' as const,
      displayOrder: 3,
      isActive: true,
    },

    // Footer Banners
    {
      title: 'Follow Us on Social Media',
      description: 'Stay updated with latest products and design inspiration',
      imageUrl: '/images/banners/social-media-footer.jpg',
      linkUrl: 'https://instagram.com/nooraltayseer',
      linkText: 'Follow @nooraltayseer',
      position: 'FOOTER' as const,
      displayOrder: 1,
      isActive: true,
    },
    {
      title: 'Newsletter Subscription',
      description: 'Get exclusive offers and lighting tips delivered to your inbox',
      imageUrl: '/images/banners/newsletter-footer.jpg',
      linkUrl: '/newsletter/subscribe',
      linkText: 'Subscribe Now',
      position: 'FOOTER' as const,
      displayOrder: 2,
      isActive: true,
    },

    // Scheduled Banners (Future promotions)
    {
      title: 'Summer Sale - Up to 40% Off',
      description: 'Limited time offer on selected lighting and bathroom products',
      imageUrl: '/images/banners/summer-sale-hero.jpg',
      linkUrl: '/promotions/summer-sale',
      linkText: 'Shop Sale',
      position: 'HERO' as const,
      displayOrder: 1,
      isActive: true,
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
    },
    {
      title: 'Black Friday Deals',
      description: 'Biggest discounts of the year on premium lighting',
      imageUrl: '/images/banners/black-friday-hero.jpg',
      linkUrl: '/promotions/black-friday',
      linkText: 'Shop Deals',
      position: 'HERO' as const,
      displayOrder: 1,
      isActive: true,
      startDate: new Date('2024-11-25'),
      endDate: new Date('2024-11-30'),
    },
  ]

  // Create banners
  for (const bannerData of banners) {
    try {
      const banner = await prisma.banner.create({
        data: bannerData
      })
      console.log(`✅ Created banner: ${banner.title}`)
    } catch (error) {
      console.error(`❌ Failed to create banner: ${bannerData.title}`, error)
    }
  }

  // Add some analytics data (simulate impressions and clicks)
  const allBanners = await prisma.banner.findMany()
  
  for (const banner of allBanners) {
    const impressions = Math.floor(Math.random() * 10000) + 1000
    const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)) // 1-6% CTR
    
    await prisma.banner.update({
      where: { id: banner.id },
      data: {
        impressions,
        clickCount: clicks
      }
    })
  }

  console.log('🎨 Banner seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Banner seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
