'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { PackageSearch, User2, MapPin, Heart, LayoutDashboard } from 'lucide-react'

const routes = [
  {
    label: 'Overview',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-blue-500',
  },
  {
    label: 'Orders',
    icon: PackageSearch,
    href: '/dashboard/orders',
    color: 'text-sky-500',
  },
  {
    label: 'Wishlist',
    icon: Heart,
    href: '/dashboard/wishlist',
    color: 'text-red-500',
  },
  {
    label: 'Profile',
    icon: User2,
    href: '/dashboard/profile',
    color: 'text-violet-500',
  },
  {
    label: 'Addresses',
    icon: MapPin,
    href: '/dashboard/addresses',
    color: 'text-pink-700',
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className='space-y-1'>
      <div className='mb-4'>
        <h3 className='text-lg font-semibold text-brand'>Dashboard</h3>
        <p className='text-sm text-muted-foreground'>Manage your account</p>
      </div>
      {routes.map((route) => (
        <Link
          key={route.href}
          href={route.href}
          className={cn(
            'flex items-center gap-x-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
            pathname === route.href 
              ? 'bg-brand text-white hover:bg-brand-700' 
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <route.icon className={cn(
            'h-5 w-5', 
            pathname === route.href ? 'text-white' : route.color
          )} />
          {route.label}
        </Link>
      ))}
    </nav>
  )
}
