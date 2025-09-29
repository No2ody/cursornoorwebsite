'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Settings,
  BarChart,
  Tag,
  Folder,
  Image as ImageIcon,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Folder },
  { name: 'Brands', href: '/admin/brands', icon: Tag },
  { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminHeader() {
  const pathname = usePathname()

  return (
    <header className='fixed top-0 left-0 right-0 z-40 border-b bg-white/95 backdrop-blur-md shadow-lg'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo and Navigation */}
          <div className='flex items-center gap-8'>
            <div className='flex items-center gap-6'>
              <Link
                href='/'
                className='flex items-center gap-3 text-xl font-bold'
              >
                <Image
                  src='/images/NoorAlTayseer_logo.png'
                  alt='Noor AlTayseer'
                  width={32}
                  height={32}
                  className='object-contain rounded-lg'
                />
                <div>
                  <span className='text-brand'>Noor AlTayseer</span>
                  <span className='block text-xs text-gold font-medium'>Admin Dashboard</span>
                </div>
              </Link>

            </div>

            {/* Navigation */}
            <nav className='hidden md:flex items-center gap-6'>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-lg',
                      isActive
                        ? 'text-brand bg-brand-50 border border-brand-200'
                        : 'text-gray-600 hover:text-brand hover:bg-brand-50'
                    )}
                  >
                    <item.icon className='h-4 w-4' />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}
