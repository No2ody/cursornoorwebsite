'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Heart,
  MapPin,
  // Settings,
  User,
  // FileText,
  CreditCard,
  Bell,
  HelpCircle
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Account summary'
  },
  {
    title: 'Orders',
    href: '/dashboard/orders',
    icon: ShoppingCart,
    description: 'Order history & tracking'
  },
  {
    title: 'Wishlist',
    href: '/dashboard/wishlist',
    icon: Heart,
    description: 'Saved products'
  },
  {
    title: 'Addresses',
    href: '/dashboard/addresses',
    icon: MapPin,
    description: 'Shipping addresses'
  },
  {
    title: 'Payment Methods',
    href: '/dashboard/payment-methods',
    icon: CreditCard,
    description: 'Saved payment options'
  },
  {
    title: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    description: 'Personal information'
  },
  {
    title: 'Notifications',
    href: '/dashboard/notifications',
    icon: Bell,
    description: 'Alerts & updates'
  },
  {
    title: 'Support',
    href: '/support',
    icon: HelpCircle,
    description: 'Get help'
  }
]

export function UserDashboardSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const isActiveLink = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card className="shadow-card border-0">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
              <AvatarFallback className="bg-brand text-white text-lg">
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {session?.user?.name || 'User'}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {session?.user?.email}
              </p>
              <Badge variant="secondary" className="mt-1 text-xs">
                Customer
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Navigation */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg">My Account</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = isActiveLink(item.href)
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-brand-50 hover:text-brand',
                    isActive 
                      ? 'bg-brand-50 text-brand border-r-2 border-brand' 
                      : 'text-gray-700'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {item.description}
                    </div>
                  </div>
                </Link>
              )
            })}
          </nav>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="shadow-card border-0">
        <CardHeader>
          <CardTitle className="text-lg">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Orders</span>
            <Badge variant="outline">0</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Wishlist Items</span>
            <Badge variant="outline">0</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Saved Addresses</span>
            <Badge variant="outline">0</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Support Card */}
      <Card className="shadow-card border-0 bg-gradient-to-r from-brand-50 to-gold-50 border-brand-200">
        <CardContent className="p-4 text-center">
          <HelpCircle className="w-8 h-8 text-brand mx-auto mb-2" />
          <h4 className="font-medium text-brand mb-1">Need Help?</h4>
          <p className="text-xs text-gray-600 mb-3">
            Our support team is here to assist you
          </p>
          <Link 
            href="/support" 
            className="text-xs text-brand hover:text-brand-700 font-medium"
          >
            Contact Support →
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
