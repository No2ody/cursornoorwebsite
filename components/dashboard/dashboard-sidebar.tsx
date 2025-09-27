'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface DashboardSidebarProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string
  }
}

const navigationItems = [
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    description: 'Manage your personal information'
  },
  {
    title: 'Order History',
    href: '/dashboard/orders',
    icon: Package,
    description: 'View your past orders'
  },
  {
    title: 'Wishlist',
    href: '/dashboard/wishlist',
    icon: Heart,
    description: 'Your saved products'
  },
  {
    title: 'Addresses',
    href: '/dashboard/addresses',
    icon: MapPin,
    description: 'Manage shipping addresses'
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    description: 'Account preferences'
  },
]

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const sidebarContent = (
    <>
      {/* User Profile Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback className="bg-brand text-white text-lg">
                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {user.name || 'User'}
              </CardTitle>
              <p className="text-sm text-gray-600 truncate">
                {user.email}
              </p>
              {user.role === 'ADMIN' && (
                <Badge variant="secondary" className="mt-2 bg-brand-100 text-brand-700">
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-0">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between p-4 rounded-lg transition-colors group hover:bg-gray-50',
                    isActive && 'bg-brand-50 border-r-4 border-brand'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <Icon 
                      className={cn(
                        'h-5 w-5 transition-colors',
                        isActive ? 'text-brand' : 'text-gray-500 group-hover:text-brand'
                      )} 
                    />
                    <div>
                      <p className={cn(
                        'font-medium transition-colors',
                        isActive ? 'text-brand' : 'text-gray-900 group-hover:text-brand'
                      )}>
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 hidden lg:block">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={cn(
                      'h-4 w-4 transition-colors',
                      isActive ? 'text-brand' : 'text-gray-400 group-hover:text-brand'
                    )} 
                  />
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Orders</span>
            <Badge variant="secondary">12</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Wishlist Items</span>
            <Badge variant="secondary">5</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Member Since</span>
            <span className="text-sm font-medium">2024</span>
          </div>
        </CardContent>
      </Card>
    </>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden mb-6">
        <Button
          variant="outline"
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-full justify-start"
        >
          <Menu className="h-4 w-4 mr-2" />
          Dashboard Menu
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-80 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Dashboard Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}
