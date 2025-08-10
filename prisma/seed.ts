import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting Noor AlTayseer product seeding...')

  // Helper function to extract product name from filename
  function extractProductName(filename: string, categoryPrefix: string = ''): string {
    const nameWithoutExtension = filename.replace(/\.(jpg|png|jpeg)$/i, '')
    const cleanName = nameWithoutExtension
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
    
    return categoryPrefix ? `${categoryPrefix} ${cleanName}` : cleanName
  }

  // Helper to safely read a directory
  function readDirSafe(dir: string): string[] {
    try {
      return fs.readdirSync(dir)
    } catch {
      return []
    }
  }

  // Helper to filter image files and skip category images
  function filterProductImages(files: string[]): string[] {
    return files.filter(f => /\.(png|jpg|jpeg)$/i.test(f) && !/category/i.test(f))
  }

  // Base images folder
  const IMAGES_ROOT = path.join(process.cwd(), 'public', 'images')

  // Helper function to generate realistic price based on category
  function generatePrice(category: string, productName: string): number {
    if (category.includes('Bathtub')) return Math.floor(Math.random() * 3000) + 2000
    if (category.includes('Cabinet')) {
      if (productName.includes('ZA-8')) return Math.floor(Math.random() * 800) + 1000 // Premium models
      if (productName.includes('ZP-')) return Math.floor(Math.random() * 600) + 1200 // Plywood
      if (productName.includes('ZR-') || productName.includes('Rock Stone')) return Math.floor(Math.random() * 1000) + 1500 // Rock Stone
      return Math.floor(Math.random() * 500) + 800 // PVC
    }
    if (category.includes('Mirror')) return Math.floor(Math.random() * 800) + 400
    if (category.includes('Industrial')) return Math.floor(Math.random() * 300) + 100
    if (category.includes('Panel')) return Math.floor(Math.random() * 100) + 80
    if (category.includes('Downlight')) return Math.floor(Math.random() * 40) + 25
    if (category.includes('Flood')) return Math.floor(Math.random() * 200) + 120
    if (category.includes('Street') || category.includes('Outdoor')) return Math.floor(Math.random() * 250) + 150
    if (category.includes('Smart') || category.includes('Control')) return Math.floor(Math.random() * 300) + 80
    if (category.includes('Switch') || category.includes('Socket')) return Math.floor(Math.random() * 50) + 15
    if (category.includes('Strip') || category.includes('Tube')) return Math.floor(Math.random() * 80) + 30
    if (category.includes('Spotlight')) return Math.floor(Math.random() * 120) + 40
    if (category.includes('Ceiling')) return Math.floor(Math.random() * 180) + 60
    if (category.includes('Landscape')) return Math.floor(Math.random() * 150) + 80
    if (category.includes('Linear')) return Math.floor(Math.random() * 200) + 100
    if (category.includes('Power Bulb')) return Math.floor(Math.random() * 80) + 30
    if (category.includes('Table') || category.includes('Mirror Lamp')) return Math.floor(Math.random() * 120) + 50
    return Math.floor(Math.random() * 100) + 50 // Default
  }

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Create main categories
  console.log('📁 Creating categories...')

  // 1. BATHROOM CATEGORIES
  const bathroomCategory = await prisma.category.create({
    data: {
      name: 'Bathroom',
      description: 'Premium bathroom fixtures and accessories for modern homes',
      image: '/images/Bathroom/Bathroom Cabinet/Cateogry_Bathroom_Cabinet.jpg'
    }
  })

  const bathroomCabinetCategory = await prisma.category.create({
    data: {
      name: 'Bathroom Cabinet',
      description: 'High-quality bathroom cabinets in various materials and styles',
      image: '/images/Bathroom/Bathroom Cabinet/Cateogry_Bathroom_Cabinet.jpg'
    }
  })

  const pvcCabinetCategory = await prisma.category.create({
    data: {
      name: 'PVC Cabinet',
      description: 'Durable and water-resistant PVC bathroom cabinets',
      image: '/images/Bathroom/Bathroom Cabinet/Cateogry_Bathroom_Cabinet.jpg'
    }
  })

  const plywoodCabinetCategory = await prisma.category.create({
    data: {
      name: 'Plywood Cabinet',
      description: 'Premium plywood bathroom cabinets with elegant finishes',
      image: '/images/Bathroom/Bathroom Cabinet/Cateogry_Bathroom_Cabinet.jpg'
    }
  })

  const rockStoneCabinetCategory = await prisma.category.create({
    data: {
      name: 'Rock Stone Cabinet',
      description: 'Natural stone bathroom cabinets for luxury interiors',
      image: '/images/Bathroom/Bathroom Cabinet/Cateogry_Bathroom_Cabinet.jpg'
    }
  })

  const bathtubsCategory = await prisma.category.create({
    data: {
      name: 'Bathtubs',
      description: 'Luxury bathtubs for ultimate relaxation and comfort',
      image: '/images/Bathroom/Bathtub/Category_Bathtub.jpg'
    }
  })

  // 2. ALL LIGHTING SUBCATEGORIES
  const smartControlsCategory = await prisma.category.create({
    data: {
      name: 'Smart Controls and Lighting',
      description: 'Smart lighting controls and automated systems',
      image: '/images/Lighting/Smart-Controls-and-Lighting/Category_Smart_Controls.jpg'
    }
  })

  const switchesSocketsCategory = await prisma.category.create({
    data: {
      name: 'Switches & Sockets',
      description: 'Premium electrical switches, sockets, and controls',
      image: '/images/Lighting/Switches-and-Sockets/Category_Switches.jpg'
    }
  })

  const tableMirrorLampsCategory = await prisma.category.create({
    data: {
      name: 'Table and Mirror Lamps',
      description: 'Elegant table lamps and mirror lighting solutions',
      image: '/images/Lighting/Table-and-Mirror Lamps/Category_Table_Lamps.jpg'
    }
  })

  const ledStripsCategory = await prisma.category.create({
    data: {
      name: 'LED Strips and Tube Lights',
      description: 'Flexible LED strips and tube lighting for various applications',
      image: '/images/Lighting/LED-Strips-and-Tube lights/Category_LED_Strips.jpg'
    }
  })

  const ledOutdoorCategory = await prisma.category.create({
    data: {
      name: 'LED Outdoor',
      description: 'Professional outdoor LED lighting solutions',
      image: '/images/Lighting/LED-Outdoor/Category_LED_Outdoor_Lighting.png'
    }
  })

  const ledPanelCategory = await prisma.category.create({
    data: {
      name: 'LED Panel',
      description: 'Efficient LED panel lights for offices and commercial spaces',
      image: '/images/Lighting/LED-Panel/Category_LED_Panel.jpg'
    }
  })

  const ledPowerBulbCategory = await prisma.category.create({
    data: {
      name: 'LED Power Bulb',
      description: 'High-power LED bulbs for residential and commercial use',
      image: '/images/Lighting/LED-Power-Bulb/Category_LED_Power_Bulb.jpg'
    }
  })

  const ledSpotlightCategory = await prisma.category.create({
    data: {
      name: 'LED Spotlight',
      description: 'Focused LED spotlights for accent and task lighting',
      image: '/images/Lighting/LED-Spotlight/Category_LED_Spotlight.jpg'
    }
  })

  const ledIndustrialCategory = await prisma.category.create({
    data: {
      name: 'LED Industrial',
      description: 'Heavy-duty LED lighting for industrial applications',
      image: '/images/Lighting/LED-Industrial/Category_LED_Industrial.jpg'
    }
  })

  const ledLandscapeCategory = await prisma.category.create({
    data: {
      name: 'LED Landscape',
      description: 'Landscape and garden LED lighting solutions',
      image: '/images/Lighting/LED-Landscape/Category_LED_Landscape.jpg'
    }
  })

  const ledLinearIndoorCategory = await prisma.category.create({
    data: {
      name: 'LED Linear Indoor',
      description: 'Linear LED lighting for modern indoor spaces',
      image: '/images/Lighting/LED-Linear-Indoor/Category_LED_Linear.jpg'
    }
  })

  const ledFloodLightCategory = await prisma.category.create({
    data: {
      name: 'LED Flood Light',
      description: 'High-intensity LED flood lights for large area illumination',
      image: '/images/Lighting/LED-Flood-Light/Category_LED_Flood.jpg'
    }
  })

  const ceilingLampsCategory = await prisma.category.create({
    data: {
      name: 'Ceiling Lamps',
      description: 'Modern ceiling lamps and fixtures',
      image: '/images/Lighting/Ceiling-Lamps/Category_Ceiling_Lamps.jpg'
    }
  })

  const ledDownlightCategory = await prisma.category.create({
    data: {
      name: 'LED Downlight',
      description: 'Recessed LED downlights for clean, modern lighting',
      image: '/images/Lighting/LED-Downlight/Category_LED_Downlight.jpg'
    }
  })

  // 3. LED MIRROR CATEGORY
  const ledMirrorCategory = await prisma.category.create({
    data: {
      name: 'LED Mirror',
      description: 'Premium LED mirrors with integrated lighting for bathrooms and vanities',
      image: '/images/LED-Mirror/Category_Led_Mirror.jpg'
    }
  })

  console.log('✅ Categories created successfully!')

  // Create products
  console.log('🌱 Starting product seeding...')
  let totalProducts = 0

  // Create Plywood Cabinet products
  console.log('🪵 Creating Plywood Cabinet products...')
  const plywoodImages = [
    'ZP-3320-PLYWOOD.jpg', 'ZP-3324-PLYWOOD.jpg', 'ZP-3330-PLYWOOD.jpg', 'ZP-3334-1-PLYWOOD.jpg', 'ZP-3341-PLYWOOD.jpg',
    'ZP-3344-PLYWOOD.jpg', 'ZP-3348-PLYWOOD.jpg', 'ZP-3353-PLYWOOD.jpg', 'ZP-3358-PLYWOOD.jpg', 'ZP-3391-PLYWOOD.jpg',
    'ZP-3405-PLYWOOD.jpg', 'ZP-3416-PLYWOOD.jpg', 'ZP-3439-PLYWOOD.jpg', 'ZP-3447-PLYWOOD.jpg', 'ZP-3456-PLYWOOD.jpg',
    'ZP-3459-PLYWOOD.jpg', 'ZP-3476-PLYWOOD.jpg', 'ZP-3480-PLYWOOD.jpg', 'ZP-3486-PLYWOOD.jpg', 'ZP-3490-PLYWOOD.jpg',
    'ZP-3501-PLYWOOD.jpg', 'ZP-3502-PLYWOOD.jpg', 'ZP-3506-PLYWOOD.jpg', 'ZP-3516-PLYWOOD.jpg', 'ZP-3519-PLYWOOD.jpg',
    'ZP-3522-PLYWOOD.jpg', 'ZP-3526-PLYWOOD.jpg', 'ZP-3528-PLYWOOD.jpg', 'ZP-3531-PLYWOOD.jpg', 'ZP-3535-PLYWOOD.jpg',
    'ZA-8055.png', 'ZA-8056.png', 'ZA-8057.png', 'ZA-8058.png', 'ZA-8059.png', 'ZA-8060.png',
    'ZA-8061.png', 'ZA-8062.png', 'ZA-8063.png', 'ZA-8064.png', 'ZA-8065.png', 'ZA-8066.png'
  ]

  for (const image of plywoodImages) {
    const productName = extractProductName(image, 'Plywood Cabinet')
    await prisma.product.create({
      data: {
        name: productName,
        description: `Premium ${productName.toLowerCase()} crafted from high-grade plywood with elegant finishes. Superior durability and sophisticated design for luxury bathroom installations.`,
        price: generatePrice('Plywood Cabinet', productName),
        images: [`/images/Bathroom/Bathroom Cabinet/Plywood-Cabinet/${image}`],
        stock: Math.floor(Math.random() * 25) + 5,
        categoryId: plywoodCabinetCategory.id
      }
    })
    totalProducts++
  }

  // Create PVC Cabinet products
  console.log('🧴 Creating PVC Cabinet products...')
  const pvcDir = path.join(IMAGES_ROOT, 'Bathroom', 'Bathroom Cabinet', 'PVC-Cabinet')
  const pvcFiles = filterProductImages(readDirSafe(pvcDir))
  for (const file of pvcFiles) {
    const productName = extractProductName(file, 'PVC Cabinet')
    await prisma.product.create({
      data: {
        name: productName,
        description: `Durable ${productName.toLowerCase()} crafted from water-resistant PVC. Easy maintenance and modern styling for long-lasting bathroom use.`,
        price: generatePrice('PVC Cabinet', productName),
        images: [`/images/Bathroom/Bathroom Cabinet/PVC-Cabinet/${file}`],
        stock: Math.floor(Math.random() * 25) + 5,
        categoryId: pvcCabinetCategory.id,
      }
    })
    totalProducts++
  }

  // Create Rock Stone Cabinet products
  console.log('🪨 Creating Rock Stone Cabinet products...')
  const rockDir = path.join(IMAGES_ROOT, 'Bathroom', 'Bathroom Cabinet', 'Rock-Stone-Cabinet')
  const rockFiles = filterProductImages(readDirSafe(rockDir))
  for (const file of rockFiles) {
    const productName = extractProductName(file, 'Rock Stone Cabinet')
    await prisma.product.create({
      data: {
        name: productName,
        description: `Luxury ${productName.toLowerCase()} made from natural stone. Exceptional durability and timeless aesthetics for premium interiors.`,
        price: generatePrice('Rock Stone Cabinet', productName),
        images: [`/images/Bathroom/Bathroom Cabinet/Rock-Stone-Cabinet/${file}`],
        stock: Math.floor(Math.random() * 20) + 3,
        categoryId: rockStoneCabinetCategory.id,
      }
    })
    totalProducts++
  }

  // Create Bathtub products
  console.log('🛁 Creating Bathtub products...')
  const tubDir = path.join(IMAGES_ROOT, 'Bathroom', 'Bathtub')
  const tubFiles = filterProductImages(readDirSafe(tubDir))
  for (const file of tubFiles) {
    const productName = extractProductName(file, 'Bathtub')
    await prisma.product.create({
      data: {
        name: productName,
        description: `Luxury ${productName.toLowerCase()} designed for premium comfort and relaxation with high-grade materials.`,
        price: generatePrice('Bathtub', productName),
        images: [`/images/Bathroom/Bathtub/${file}`],
        stock: Math.floor(Math.random() * 10) + 2,
        categoryId: bathtubsCategory.id,
      }
    })
    totalProducts++
  }

  // Create LED Mirror products
  console.log('🪞 Creating LED Mirror products...')
  const mirrorDir = path.join(IMAGES_ROOT, 'LED-Mirror')
  const mirrorFiles = filterProductImages(readDirSafe(mirrorDir))
  for (const file of mirrorFiles) {
    const productName = extractProductName(file)
    await prisma.product.create({
      data: {
        name: productName,
        description: `Premium ${productName.toLowerCase()} with integrated LED lighting and anti-fog options for modern bathrooms.`,
        price: generatePrice('LED Mirror', productName),
        images: [`/images/LED-Mirror/${file}`],
        stock: Math.floor(Math.random() * 20) + 5,
        categoryId: ledMirrorCategory.id,
      }
    })
    totalProducts++
  }

  // Create all lighting products by mapping each subfolder to its category
  console.log('💡 Creating ALL lighting products by category...')
  
  const lightingCategories = {
    'Smart-Controls-and-Lighting': { category: smartControlsCategory, prefix: 'Smart Control' },
    'Switches-and-Sockets': { category: switchesSocketsCategory, prefix: 'Switch/Socket' },
    'Table-and-Mirror Lamps': { category: tableMirrorLampsCategory, prefix: 'Table Lamp' },
    'LED-Strips-and-Tube lights': { category: ledStripsCategory, prefix: 'LED Strip' },
    'LED-Outdoor': { category: ledOutdoorCategory, prefix: 'LED Outdoor' },
    'LED-Panel': { category: ledPanelCategory, prefix: 'LED Panel' },
    'LED-Power-Bulb': { category: ledPowerBulbCategory, prefix: 'LED Power Bulb' },
    'LED-Spotlight': { category: ledSpotlightCategory, prefix: 'LED Spotlight' },
    'LED-Industrial': { category: ledIndustrialCategory, prefix: 'LED Industrial' },
    'LED-Landscape': { category: ledLandscapeCategory, prefix: 'LED Landscape' },
    'LED-Linear-Indoor': { category: ledLinearIndoorCategory, prefix: 'LED Linear' },
    'LED-Flood-Light': { category: ledFloodLightCategory, prefix: 'LED Flood Light' },
    'Ceiling-Lamps': { category: ceilingLampsCategory, prefix: 'Ceiling Lamp' },
    'LED-Downlight': { category: ledDownlightCategory, prefix: 'LED Downlight' }
  }

  for (const [folderName, categoryInfo] of Object.entries(lightingCategories)) {
    console.log(`🔆 Creating ${categoryInfo.prefix} products...`)
    const folderPath = path.join(IMAGES_ROOT, 'Lighting', folderName)
    const images = filterProductImages(readDirSafe(folderPath))
    
    for (const image of images) {
      const productName = extractProductName(image, categoryInfo.prefix)
      await prisma.product.create({
        data: {
          name: productName,
          description: `${productName} from our professional lighting collection. High-quality LED technology with efficient performance and long-lasting durability.`,
          price: generatePrice(folderName, productName),
          images: [`/images/Lighting/${folderName}/${image}`],
          stock: Math.floor(Math.random() * 50) + 5,
          categoryId: categoryInfo.category.id,
        }
      })
      totalProducts++
    }
  }

  console.log('✅ SEEDING COMPLETED SUCCESSFULLY!')
  console.log('📊 Final summary:')
  
  const categoryCount = await prisma.category.count()
  const productCount = await prisma.product.count()
  
  console.log(`   - ${categoryCount} categories created`)
  console.log(`   - ${productCount} products created`)
  console.log(`   - Total products processed: ${totalProducts}`)
  console.log('')
  console.log('🚀 Noor AlTayseer products successfully seeded!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })