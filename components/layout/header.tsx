'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams, usePathname } from 'next/navigation'
import { User, LogOut, Phone, Mail, LayoutDashboard, BarChart, Package, ShoppingCart, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSession, signOut } from 'next-auth/react'
import { useCart } from '@/store/use-cart'
import { MegaMenu } from '@/components/layout/mega-menu'
import { CartDrawer } from '@/components/layout/cart-drawer'
import { EnhancedSearch } from '@/components/shared/enhanced-search'
// import { PromoBanner } from '@/components/layout/promo-banner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const cart = useCart()
  const [searchQuery, setSearchQuery] = useState('')
  const [categories, setCategories] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Helper function to check if a link is active
  const isActiveLink = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Sync search input with URL search parameter
  useEffect(() => {
    const search = searchParams.get('search')
    if (search) {
      setSearchQuery(search)
    }
  }, [searchParams])

  // Fetch categories for mega menu
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    
    fetchCategories()
  }, [])


  return (
    <>
      {/* Skip to content link for accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      
      {/* Promo Banner - Temporarily disabled for build */}
      {/* <PromoBanner /> */}
      
      <header className='fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-header'>
        {/* Enhanced Top Bar */}
        <div className='hero-gradient text-white py-3 px-4 relative overflow-hidden'>
          {/* Background Pattern */}
          <div className='absolute inset-0 opacity-10'>
            <div className='absolute inset-0' style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '30px 30px'
            }} />
          </div>
          
          <div className='container mx-auto flex justify-between items-center text-sm relative z-10'>
            <div className='flex items-center space-x-6'>
              <div className='flex items-center space-x-2 group'>
                <Phone className='w-4 h-4 text-gold group-hover:scale-110 transition-transform' />
                <span className='hover:text-gold transition-colors'>+971 50 538 2246</span>
              </div>
              <div className='flex items-center space-x-2 group'>
                <Mail className='w-4 h-4 text-gold group-hover:scale-110 transition-colors' />
                <span className='hover:text-gold transition-colors'>info@nooraltayseer.com</span>
              </div>
            </div>
            
            <div className='flex items-center space-x-4 text-xs'>
              <span className='flex items-center gap-1'>
                <span className='w-2 h-2 bg-gold rounded-full animate-pulse' />
                Free Installation
              </span>
              <span className='flex items-center gap-1'>
                <span className='w-2 h-2 bg-gold rounded-full animate-pulse' />
                2 Year Warranty
              </span>
            </div>
          </div>
        </div>

      {/* Main Navigation */}
      <div className='container mx-auto px-4 py-4'>
        <div className='flex justify-between items-center'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-3'>
            <Image
              src='/images/NoorAlTayseer_logo.png'
              alt='Noor AlTayseer'
              width={50}
              height={50}
              className='object-contain rounded-lg'
            />
            <div>
              <h1 className='text-2xl font-bold text-brand'>Noor AlTayseer</h1>
              <p className='text-sm text-gray-600'>Building & Construction</p>
            </div>
          </Link>

          {/* Enhanced Search Bar */}
          <div className='hidden sm:block flex-1 max-w-2xl mx-8'>
            <EnhancedSearch
              value={searchQuery}
              onValueChange={setSearchQuery}
              placeholder="Search products..."
            />
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-6'>
            <Link
              href='/'
              className={`text-lg font-medium transition-colors relative px-3 py-2 rounded-lg hover:bg-brand-50 ${
                isActiveLink('/') 
                  ? 'text-brand hover:text-brand-700' 
                  : 'text-gray-700 hover:text-brand'
              }`}
            >
              Home
              {isActiveLink('/') && (
                <div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-brand rounded-full' />
              )}
            </Link>
            
            {/* Mega Menu for Categories */}
            <MegaMenu 
              categories={categories} 
              className="hidden lg:block"
            />
            
            <Link
              href='/products'
              className={`text-lg font-medium transition-colors relative px-3 py-2 rounded-lg hover:bg-brand-50 ${
                isActiveLink('/products') 
                  ? 'text-brand hover:text-brand-700' 
                  : 'text-gray-700 hover:text-brand'
              }`}
            >
              All Products
              {isActiveLink('/products') && (
                <div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-brand rounded-full' />
              )}
            </Link>
            <Link
              href='/about'
              className={`text-lg font-medium transition-colors relative px-3 py-2 rounded-lg hover:bg-brand-50 ${
                isActiveLink('/about') 
                  ? 'text-brand hover:text-brand-700' 
                  : 'text-gray-700 hover:text-brand'
              }`}
            >
              About Us
              {isActiveLink('/about') && (
                <div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-brand rounded-full' />
              )}
            </Link>
            <Link
              href='/contact'
              className={`text-lg font-medium transition-colors relative px-3 py-2 rounded-lg hover:bg-brand-50 ${
                isActiveLink('/contact') 
                  ? 'text-brand hover:text-brand-700' 
                  : 'text-gray-700 hover:text-brand'
              }`}
            >
              Contact Us
              {isActiveLink('/contact') && (
                <div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-brand rounded-full' />
              )}
            </Link>
            
            {/* Cart Button with Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:text-brand transition-colors hover:bg-brand-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold"
              aria-label="Open shopping cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {/* Cart badge count */}
              {cart.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.items.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='flex items-center gap-2'>
                    <User className='h-5 w-5' />
                    <span className='hidden sm:inline-block'>
                      {session.user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-60'>
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-medium leading-none'>
                        {session.user.name}
                      </p>
                      <p className='text-xs leading-none text-muted-foreground'>
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {session.user.role === 'ADMIN' ? (
                    // Admin Menu
                    <>
                      <DropdownMenuItem asChild>
                        <Link href='/admin'>
                          <LayoutDashboard className='mr-2 h-4 w-4' />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href='/admin/analytics'>
                          <BarChart className='mr-2 h-4 w-4' />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href='/admin/products'>
                          <Package className='mr-2 h-4 w-4' />
                          Products
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href='/admin/orders'>
                          <ShoppingCart className='mr-2 h-4 w-4' />
                          Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  ) : (
                    // User Menu
                    <>
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard'>
                          <LayoutDashboard className='mr-2 h-4 w-4' />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard/orders'>
                          <ShoppingCart className='mr-2 h-4 w-4' />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard/wishlist'>
                          <Heart className='mr-2 h-4 w-4' />
                          Wishlist
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href='/dashboard/profile'>
                          <User className='mr-2 h-4 w-4' />
                          Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className='text-red-600'
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant='outline' asChild className="border-brand text-brand hover:bg-brand-50">
                  <Link href='/auth/signin'>Sign In</Link>
                </Button>
                <Button asChild className="bg-brand hover:bg-brand-700 text-white">
                  <Link href='/auth/signup'>Create Account</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button - TODO: Implement mobile menu */}
          <button className='md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'>
            <svg className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
            </svg>
          </button>
        </div>
      </div>
    </header>
    
    {/* Cart Drawer */}
    <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
  </>
  )
}