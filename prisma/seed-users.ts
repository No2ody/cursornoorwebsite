import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('👥 Starting user seeding...')

  // Helper function to create slug from name
  function createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  // Check if users already exist to avoid duplicates
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@nooraltayseer.com' }
  })

  const existingUser = await prisma.user.findUnique({
    where: { email: 'user@nooraltayseer.com' }
  })

  if (existingAdmin && existingUser) {
    console.log('✅ Users already exist, skipping user seeding')
    return
  }

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 12)
  const userPassword = await bcrypt.hash('user123', 12)

  // Create Super Admin User (Owner)
  if (!existingAdmin) {
    console.log('👑 Creating super admin user (Owner)...')
    const adminUser = await prisma.user.create({
      data: {
        name: 'NoorAlTayseer Owner',
        email: 'admin@nooraltayseer.com',
        password: adminPassword,
        role: Role.ADMIN,
        emailVerified: new Date(),
        image: null
      }
    })
    console.log(`✅ Super Admin user created: ${adminUser.email}`)
  }

  // Create Sample Customer User
  if (!existingUser) {
    console.log('👤 Creating sample customer user...')
    const customerUser = await prisma.user.create({
      data: {
        name: 'John Customer',
        email: 'user@nooraltayseer.com',
        password: userPassword,
        role: Role.USER,
        emailVerified: new Date(),
        image: null
      }
    })
    console.log(`✅ Customer user created: ${customerUser.email}`)
  }

  // Create additional sample users for testing
  console.log('👥 Creating additional sample users...')
  
  const additionalUsers = [
    {
      name: 'Sarah Ahmed',
      email: 'sarah.ahmed@example.com',
      role: Role.USER
    },
    {
      name: 'Mohammad Ali',
      email: 'mohammad.ali@example.com', 
      role: Role.USER
    },
    {
      name: 'Fatima Hassan',
      email: 'fatima.hassan@example.com',
      role: Role.USER
    },
    {
      name: 'Store Manager',
      email: 'manager@nooraltayseer.com',
      role: Role.ADMIN
    }
  ]

  for (const userData of additionalUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('password123', 12)
      
      await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          emailVerified: new Date(),
          image: null
        }
      })
      console.log(`✅ User created: ${userData.email} (${userData.role})`)
    }
  }

  // Final summary
  const userCount = await prisma.user.count()
  const adminCount = await prisma.user.count({
    where: { role: Role.ADMIN }
  })
  const customerCount = await prisma.user.count({
    where: { role: Role.USER }
  })

  console.log('')
  console.log('🎯 USER SEEDING COMPLETED!')
  console.log('📊 User Summary:')
  console.log(`   - Total users: ${userCount}`)
  console.log(`   - Admin users: ${adminCount}`)
  console.log(`   - Customer users: ${customerCount}`)
  console.log('')
  console.log('🔐 Login Credentials:')
  console.log('👨‍💼 Admin Login:')
  console.log('   Email: admin@nooraltayseer.com')
  console.log('   Password: admin123')
  console.log('')
  console.log('👤 Customer Login:')
  console.log('   Email: user@nooraltayseer.com')
  console.log('   Password: user123')
  console.log('')
  console.log('🌟 Database is ready with sample users for testing!')
}

main()
  .catch((e) => {
    console.error('❌ Error during user seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })