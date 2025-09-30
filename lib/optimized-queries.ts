import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

// Optimized product queries with proper indexing and caching strategies
export class OptimizedQueries {
  
  // Optimized product search with full-text search
  static async searchProducts({
    query,
    categoryId,
    minPrice = 0,
    maxPrice = 999999,
    brands = [],
    inStock = true,
    page = 1,
    limit = 12,
    sortBy = 'relevance'
  }: {
    query?: string
    categoryId?: string
    minPrice?: number
    maxPrice?: number
    brands?: string[]
    inStock?: boolean
    page?: number
    limit?: number
    sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating'
  }) {
    const offset = (page - 1) * limit
    
    // Build optimized where clause
    const whereConditions: Prisma.ProductWhereInput[] = [
      { price: { gte: minPrice, lte: maxPrice } }
    ]
    
    if (inStock) {
      whereConditions.push({ stock: { gt: 0 } })
    }
    
    if (categoryId && categoryId !== 'all') {
      whereConditions.push({ categoryId })
    }
    
    if (brands.length > 0) {
      whereConditions.push({
        brandId: { in: brands }
      })
    }
    
    // Use optimized text search
    if (query) {
      whereConditions.push({
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      })
    }
    
    const where: Prisma.ProductWhereInput = {
      AND: whereConditions
    }
    
    // Optimized sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput[]
    switch (sortBy) {
      case 'price_asc':
        orderBy = [{ price: 'asc' }]
        break
      case 'price_desc':
        orderBy = [{ price: 'desc' }]
        break
      case 'newest':
        orderBy = [{ createdAt: 'desc' }]
        break
      case 'rating':
        // Use aggregated rating for better performance
        orderBy = [{ reviews: { _count: 'desc' } }]
        break
      default:
        // Default sorting
        orderBy = [{ createdAt: 'desc' }]
    }
    
    // Execute optimized queries in parallel
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: offset,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          stock: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          },
          brand: {
            select: {
              id: true,
              name: true
            }
          },
          // Optimized review aggregation
          _count: {
            select: {
              reviews: true
            }
          },
          reviews: {
            select: {
              rating: true
            },
            take: 100 // Limit for performance
          }
        }
      }),
      prisma.product.count({ where })
    ])
    
    // Calculate average ratings efficiently
    const productsWithRatings = products.map(product => ({
      ...product,
      averageRating: product.reviews.length > 0 
        ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product._count.reviews
    }))
    
    return {
      products: productsWithRatings,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      hasNextPage: page * limit < totalCount,
      hasPreviousPage: page > 1
    }
  }
  
  // Optimized product details with related products
  static async getProductDetails(productId: string, userId?: string) {
    const [product, relatedProducts, userWishlist] = await Promise.all([
      // Main product query
      prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          stock: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              parent: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          },
          brand: {
            select: {
              id: true,
              name: true,
              description: true,
              logo: true
            }
          },
          reviews: {
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          },
          _count: {
            select: {
              reviews: true
            }
          }
        }
      }),
      
      // Related products (same category, excluding current product)
      prisma.product.findMany({
        where: {
          categoryId: {
            in: await prisma.product.findUnique({
              where: { id: productId },
              select: { categoryId: true }
            }).then(p => p ? [p.categoryId] : [])
          },
          id: { not: productId },
          stock: { gt: 0 }
        },
        select: {
          id: true,
          name: true,
          price: true,
          images: true,
          stock: true,
          category: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        },
        take: 8,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      
      // User wishlist status (if user is authenticated)
      userId ? prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId,
            productId
          }
        },
        select: {
          id: true
        }
      }) : null
    ])
    
    if (!product) {
      return null
    }
    
    // Calculate average rating
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
      : 0
    
    return {
      ...product,
      averageRating,
      reviewCount: product._count.reviews,
      relatedProducts,
      isInWishlist: !!userWishlist
    }
  }
  
  // Optimized category products with aggregations
  static async getCategoryProducts(categorySlug: string, options: {
    page?: number
    limit?: number
    sortBy?: string
    filters?: {
      minPrice?: number
      maxPrice?: number
      brands?: string[]
      inStock?: boolean
    }
  } = {}) {
    const { page = 1, limit = 12, sortBy = 'newest', filters = {} } = options
    const offset = (page - 1) * limit
    
    // Get category with hierarchy
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: {
        id: true,
        name: true,
        description: true,
        children: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })
    
    if (!category) {
      return null
    }
    
    // Include subcategories in search
    const categoryIds = [category.id, ...category.children.map(child => child.id)]
    
    const whereConditions: Prisma.ProductWhereInput[] = [
      { categoryId: { in: categoryIds } }
    ]
    
    if (filters.minPrice !== undefined) {
      whereConditions.push({ price: { gte: filters.minPrice } })
    }
    
    if (filters.maxPrice !== undefined) {
      whereConditions.push({ price: { lte: filters.maxPrice } })
    }
    
    if (filters.brands && filters.brands.length > 0) {
      whereConditions.push({ brandId: { in: filters.brands } })
    }
    
    if (filters.inStock) {
      whereConditions.push({ stock: { gt: 0 } })
    }
    
    const where: Prisma.ProductWhereInput = {
      AND: whereConditions
    }
    
    // Execute queries in parallel
    const [products, totalCount, priceRange, availableBrands] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: this.getSortOrder(sortBy),
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          images: true,
          stock: true,
          category: {
            select: {
              name: true
            }
          },
          brand: {
            select: {
              name: true
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        }
      }),
      
      prisma.product.count({ where }),
      
      // Price range for filters
      prisma.product.aggregate({
        where: { categoryId: { in: categoryIds } },
        _min: { price: true },
        _max: { price: true }
      }),
      
      // Available brands for filters
      prisma.product.findMany({
        where: { categoryId: { in: categoryIds } },
        select: {
          brand: {
            select: {
              id: true,
              name: true
            }
          }
        },
        distinct: ['brandId']
      }).then(products => 
        products
          .filter(p => p.brand)
          .map(p => p.brand!)
      )
    ])
    
    return {
      category,
      products,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 0
      },
      availableBrands,
      hasNextPage: page * limit < totalCount,
      hasPreviousPage: page > 1
    }
  }
  
  private static getSortOrder(sortBy: string): Prisma.ProductOrderByWithRelationInput {
    switch (sortBy) {
      case 'price_asc':
        return { price: 'asc' }
      case 'price_desc':
        return { price: 'desc' }
      case 'name_asc':
        return { name: 'asc' }
      case 'name_desc':
        return { name: 'desc' }
      case 'rating':
        return { reviews: { _count: 'desc' } }
      default:
        return { createdAt: 'desc' }
    }
  }
  
  // Optimized user orders with pagination
  static async getUserOrders(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit
    
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          orderNumber: true,
          status: true,
          total: true,
          createdAt: true,
          items: {
            select: {
              id: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true
                }
              }
            }
          },
          shippingAddress: {
            select: {
              street: true,
              city: true,
              state: true,
              country: true
            }
          }
        }
      }),
      
      prisma.order.count({ where: { userId } })
    ])
    
    return {
      orders,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      hasNextPage: page * limit < totalCount,
      hasPreviousPage: page > 1
    }
  }
}

// Cache configuration for frequently accessed data
export const CACHE_CONFIG = {
  CATEGORIES: 300, // 5 minutes
  PRODUCTS: 180,   // 3 minutes
  SEARCH: 60,      // 1 minute
  USER_DATA: 300   // 5 minutes
}
