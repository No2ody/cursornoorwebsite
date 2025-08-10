'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, User, LogOut, X, Phone, Mail, LayoutDashboard, BarChart, Package, ShoppingCart, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSession, signIn, signOut } from 'next-auth/react'
import { CartBadge } from '@/components/layout/cart-badge'
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    router.push('/products')
  }

  return (
    <header className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-lg'>
      {/* Top Bar */}
      <div className='bg-gradient-to-r from-blue-900 to-blue-800 text-white py-2 px-4'>
        <div className='container mx-auto flex justify-between items-center text-sm'>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2'>
              <Phone className='w-4 h-4' />
              <span>+971 50 538 2246</span>
            </div>
            <div className='flex items-center space-x-2'>
              <Mail className='w-4 h-4' />
              <span>info@nooraltayseer.com</span>
            </div>
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
              <h1 className='text-2xl font-bold text-blue-900'>Noor AlTayseer</h1>
              <p className='text-sm text-gray-600'>Building & Construction</p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className='hidden sm:block flex-1 max-w-2xl mx-8'>
            <form onSubmit={handleSearch} className='relative'>
              <Input
                type='text'
                placeholder='Search products...'
                className='w-full pl-10 pr-10 py-3 rounded-full border-2 border-gray-200 focus:border-blue-500 transition-all duration-300'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
              {searchQuery && (
                <Button
                  type='button'
                  variant='ghost'
                  size='icon'
                  className='absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent'
                  onClick={clearSearch}
                >
                  <X className='h-4 w-4 text-gray-400' />
                </Button>
              )}
            </form>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-8'>
            <Link
              href='/'
              className={`text-lg font-medium transition-colors relative ${
                isActiveLink('/') 
                  ? 'text-blue-600 hover:text-blue-800' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Home
              {isActiveLink('/') && (
                <div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full' />
              )}
            </Link>
            <Link
              href='/products'
              className={`text-lg font-medium transition-colors relative ${
                isActiveLink('/products') 
                  ? 'text-blue-600 hover:text-blue-800' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Products
              {isActiveLink('/products') && (
                <div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full' />
              )}
            </Link>
            <Link
              href='/about'
              className={`text-lg font-medium transition-colors relative ${
                isActiveLink('/about') 
                  ? 'text-blue-600 hover:text-blue-800' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              About Us
              {isActiveLink('/about') && (
                <div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full' />
              )}
            </Link>
            <Link
              href='/contact'
              className={`text-lg font-medium transition-colors relative ${
                isActiveLink('/contact') 
                  ? 'text-blue-600 hover:text-blue-800' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Contact Us
              {isActiveLink('/contact') && (
                <div className='absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600 rounded-full' />
              )}
            </Link>
            
            <CartBadge />
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
              <Button variant='default' onClick={() => signIn()}>
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className='md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors'>
            <Search className='h-6 w-6' />
          </button>
        </div>
      </div>
    </header>
  )
}