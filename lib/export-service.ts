// Export and Reporting Service
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Export types and schemas
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json'
  dateRange?: {
    from: Date
    to: Date
  }
  filters?: Record<string, unknown>
  columns?: string[]
  includeHeaders?: boolean
  fileName?: string
}

export const exportRequestSchema = z.object({
  type: z.enum(['orders', 'customers', 'products', 'inventory', 'analytics', 'financial']),
  format: z.enum(['csv', 'xlsx', 'pdf', 'json']),
  dateRange: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
  }).optional(),
  filters: z.record(z.unknown()).optional(),
  columns: z.array(z.string()).optional(),
  includeHeaders: z.boolean().default(true),
  fileName: z.string().optional(),
})

// Report templates
export const REPORT_TEMPLATES = {
  // Order Reports
  ORDERS_SUMMARY: {
    name: 'Orders Summary Report',
    description: 'Overview of all orders with key metrics',
    defaultColumns: ['orderNumber', 'customerName', 'customerEmail', 'total', 'status', 'createdAt', 'shippingAddress'],
    filters: ['status', 'dateRange', 'customerType', 'paymentMethod'],
  },
  ORDERS_DETAILED: {
    name: 'Detailed Orders Report',
    description: 'Complete order information including line items',
    defaultColumns: ['orderNumber', 'customerName', 'productName', 'quantity', 'unitPrice', 'lineTotal', 'status', 'createdAt'],
    filters: ['status', 'dateRange', 'category', 'brand'],
  },
  ORDERS_FINANCIAL: {
    name: 'Financial Orders Report',
    description: 'Financial summary of orders for accounting',
    defaultColumns: ['orderNumber', 'customerName', 'subtotal', 'tax', 'shipping', 'discount', 'total', 'paymentMethod', 'createdAt'],
    filters: ['dateRange', 'paymentMethod', 'status'],
  },

  // Customer Reports
  CUSTOMERS_LIST: {
    name: 'Customer List Report',
    description: 'Complete list of customers with contact information',
    defaultColumns: ['name', 'email', 'phone', 'accountType', 'verificationLevel', 'totalOrders', 'totalSpent', 'createdAt'],
    filters: ['accountType', 'verificationLevel', 'registrationDate'],
  },
  CUSTOMERS_ANALYTICS: {
    name: 'Customer Analytics Report',
    description: 'Customer behavior and purchasing patterns',
    defaultColumns: ['name', 'email', 'totalOrders', 'totalSpent', 'averageOrderValue', 'lastOrderDate', 'customerSegment'],
    filters: ['dateRange', 'orderCount', 'spentAmount'],
  },

  // Product Reports
  PRODUCTS_INVENTORY: {
    name: 'Product Inventory Report',
    description: 'Current inventory levels and product information',
    defaultColumns: ['name', 'sku', 'category', 'brand', 'price', 'stock', 'lowStockAlert', 'status'],
    filters: ['category', 'brand', 'stockLevel', 'status'],
  },
  PRODUCTS_PERFORMANCE: {
    name: 'Product Performance Report',
    description: 'Sales performance and popularity metrics',
    defaultColumns: ['name', 'category', 'brand', 'totalSold', 'revenue', 'averageRating', 'reviewCount', 'viewCount'],
    filters: ['dateRange', 'category', 'brand', 'salesVolume'],
  },

  // Financial Reports
  SALES_SUMMARY: {
    name: 'Sales Summary Report',
    description: 'Daily/weekly/monthly sales summary',
    defaultColumns: ['date', 'orderCount', 'totalRevenue', 'averageOrderValue', 'topCategory', 'topProduct'],
    filters: ['dateRange', 'groupBy'],
  },
  REVENUE_ANALYSIS: {
    name: 'Revenue Analysis Report',
    description: 'Detailed revenue breakdown and analysis',
    defaultColumns: ['period', 'grossRevenue', 'discounts', 'refunds', 'netRevenue', 'growthRate'],
    filters: ['dateRange', 'period'],
  },
}

// Export Service Class
export class ExportService {
  // Generate report data
  static async generateReportData(
    type: string,
    options: ExportOptions
  ): Promise<Record<string, unknown>[]> {
    switch (type) {
      case 'orders':
        return this.generateOrdersReport(options)
      case 'customers':
        return this.generateCustomersReport(options)
      case 'products':
        return this.generateProductsReport(options)
      case 'inventory':
        return this.generateInventoryReport(options)
      case 'analytics':
        return this.generateAnalyticsReport(options)
      case 'financial':
        return this.generateFinancialReport(options)
      default:
        throw new Error(`Unknown report type: ${type}`)
    }
  }

  // Orders Report
  private static async generateOrdersReport(options: ExportOptions) {
    const where: Record<string, unknown> = {}
    
    // Apply date range filter
    if (options.dateRange) {
      where.createdAt = {
        gte: options.dateRange.from,
        lte: options.dateRange.to,
      }
    }
    
    // Apply additional filters
    if (options.filters) {
      if (options.filters.status) {
        where.status = options.filters.status
      }
      if (options.filters.customerType) {
        where.user = {
          accountType: options.filters.customerType
        }
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            accountType: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                category: { select: { name: true } },
                brand: { select: { name: true } },
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return orders.map(order => ({
      orderNumber: order.orderNumber || order.id.slice(-8).toUpperCase(),
      customerName: order.user.name || 'N/A',
      customerEmail: order.user.email,
      customerPhone: order.user.phone || 'N/A',
      customerType: order.user.accountType,
      itemCount: order.items.length,
      subtotal: order.subtotal || 0,
      tax: order.taxAmount || 0,
      shipping: order.shippingAmount || 0,
      discount: order.discountAmount || 0,
      total: order.total,
      status: order.status,
      paymentMethod: (order as any).paymentMethod || 'N/A',
      shippingAddress: (order as any).shippingAddress ? 
        `${(order as any).shippingAddress.street}, ${(order as any).shippingAddress.city}, ${(order as any).shippingAddress.country}` : 'N/A',
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }))
  }

  // Customers Report
  private static async generateCustomersReport(options: ExportOptions) {
    const where: any = { isActive: true }
    
    if (options.dateRange) {
      where.createdAt = {
        gte: options.dateRange.from,
        lte: options.dateRange.to,
      }
    }
    
    if (options.filters) {
      if (options.filters.accountType) {
        where.accountType = options.filters.accountType
      }
      if (options.filters.verificationLevel) {
        where.verificationLevel = options.filters.verificationLevel
      }
    }

    const customers = await prisma.user.findMany({
      where,
      include: {
        orders: {
          select: {
            total: true,
            createdAt: true,
          }
        },
        company: {
          select: {
            name: true,
            accountType: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return customers.map(customer => {
      const totalOrders = customer.orders.length
      const totalSpent = customer.orders.reduce((sum, order) => sum + order.total, 0)
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
      const lastOrderDate = customer.orders.length > 0 ? 
        Math.max(...customer.orders.map(o => o.createdAt.getTime())) : null

      return {
        id: customer.id,
        name: customer.name || 'N/A',
        firstName: customer.firstName || 'N/A',
        lastName: customer.lastName || 'N/A',
        email: customer.email,
        phone: customer.phone || 'N/A',
        accountType: customer.accountType,
        verificationLevel: customer.verificationLevel,
        kycStatus: customer.kycStatus,
        kybStatus: customer.kybStatus,
        companyName: customer.company?.name || 'N/A',
        businessType: customer.company?.accountType || 'N/A',
        totalOrders,
        totalSpent,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        lastOrderDate: lastOrderDate ? new Date(lastOrderDate).toISOString() : 'Never',
        registrationDate: customer.createdAt.toISOString(),
        lastLoginAt: customer.lastLoginAt?.toISOString() || 'Never',
        isVerified: customer.isVerified,
        emailVerified: !!customer.emailVerified,
      }
    })
  }

  // Products Report
  private static async generateProductsReport(options: ExportOptions) {
    const where: Record<string, unknown> = {}
    
    if (options.filters) {
      if (options.filters.category) {
        where.categoryId = options.filters.category
      }
      if (options.filters.brand) {
        where.brandId = options.filters.brand
      }
      if (options.filters.stockLevel) {
        if (options.filters.stockLevel === 'low') {
          where.stock = { lte: 10 }
        } else if (options.filters.stockLevel === 'out') {
          where.stock = 0
        }
      }
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        brand: { select: { name: true } },
        orderItems: {
          select: {
            quantity: true,
            price: true,
          }
        },
        reviews: {
          select: {
            rating: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return products.map(product => {
    const totalSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalRevenue = product.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      const averageRating = product.reviews.length > 0 ? 
        product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length : 0

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category.name,
        brand: product.brand?.name || 'N/A',
        price: product.price,
        stock: product.stock,
        totalSold,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageRating: Math.round(averageRating * 100) / 100,
        reviewCount: product.reviews.length,
        imageCount: product.images.length,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      }
    })
  }

  // Inventory Report
  private static async generateInventoryReport(options: ExportOptions) {
    const products = await this.generateProductsReport(options)
    
    return products.map(product => ({
      name: product.name,
      category: product.category,
      brand: product.brand,
      currentStock: product.stock,
      stockStatus: product.stock === 0 ? 'Out of Stock' : 
                   product.stock <= 10 ? 'Low Stock' : 'In Stock',
      stockValue: product.price * product.stock,
      totalSold: product.totalSold,
      reorderLevel: 10, // This could be configurable per product
      needsReorder: product.stock <= 10,
      lastUpdated: product.updatedAt,
    }))
  }

  // Analytics Report
  private static async generateAnalyticsReport(options: ExportOptions) {
    const dateRange = options.dateRange || {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date()
    }

    // Get daily sales data
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    })

    // Group by date
    const dailyData: Record<string, any> = {}
    
    orders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0]
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          orderCount: 0,
          totalRevenue: 0,
          totalItems: 0,
          categories: new Set(),
        }
      }
      
      dailyData[date].orderCount += 1
      dailyData[date].totalRevenue += order.total
      dailyData[date].totalItems += order.items.reduce((sum, item) => sum + item.quantity, 0)
      
      order.items.forEach(item => {
        dailyData[date].categories.add(item.product.category.name)
      })
    })

    return Object.values(dailyData).map((day: any) => ({
      date: day.date,
      orderCount: day.orderCount,
      totalRevenue: Math.round(day.totalRevenue * 100) / 100,
      averageOrderValue: day.orderCount > 0 ? Math.round((day.totalRevenue / day.orderCount) * 100) / 100 : 0,
      totalItems: day.totalItems,
      categoriesCount: day.categories.size,
      topCategories: Array.from(day.categories).slice(0, 3).join(', '),
    }))
  }

  // Financial Report
  private static async generateFinancialReport(options: ExportOptions) {
    const dateRange = options.dateRange || {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    }

    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: dateRange.from,
          lte: dateRange.to,
        },
        status: { in: ['DELIVERED', 'CONFIRMED', 'SHIPPED'] }
      }
    })

    const groupBy = options.filters?.groupBy || 'daily'
    const financialData: Record<string, any> = {}

    orders.forEach(order => {
      let period: string
      
      if (groupBy === 'monthly') {
        period = order.createdAt.toISOString().substring(0, 7) // YYYY-MM
      } else if (groupBy === 'weekly') {
        const weekStart = new Date(order.createdAt)
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        period = weekStart.toISOString().split('T')[0]
      } else {
        period = order.createdAt.toISOString().split('T')[0] // YYYY-MM-DD
      }

      if (!financialData[period]) {
        financialData[period] = {
          period,
          orderCount: 0,
          grossRevenue: 0,
          discounts: 0,
          refunds: 0,
          tax: 0,
          shipping: 0,
        }
      }

      financialData[period].orderCount += 1
      financialData[period].grossRevenue += order.total
      financialData[period].discounts += order.discountAmount || 0
      financialData[period].tax += order.taxAmount || 0
      financialData[period].shipping += order.shippingAmount || 0
    })

    return Object.values(financialData).map((period: any) => ({
      period: period.period,
      orderCount: period.orderCount,
      grossRevenue: Math.round(period.grossRevenue * 100) / 100,
      discounts: Math.round(period.discounts * 100) / 100,
      tax: Math.round(period.tax * 100) / 100,
      shipping: Math.round(period.shipping * 100) / 100,
      netRevenue: Math.round((period.grossRevenue - period.discounts) * 100) / 100,
      averageOrderValue: period.orderCount > 0 ? 
        Math.round((period.grossRevenue / period.orderCount) * 100) / 100 : 0,
    }))
  }

  // Format data for export
  static formatForExport(data: any[], format: string, columns?: string[]) {
    if (!data || data.length === 0) {
      return { content: '', mimeType: 'text/plain' }
    }

    switch (format) {
      case 'csv':
        return this.formatAsCSV(data, columns)
      case 'json':
        return this.formatAsJSON(data, columns)
      case 'xlsx':
        return this.formatAsXLSX(data, columns)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  private static formatAsCSV(data: any[], columns?: string[]) {
    const headers = columns || Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    return {
      content: csvContent,
      mimeType: 'text/csv'
    }
  }

  private static formatAsJSON(data: any[], columns?: string[]) {
    const filteredData = columns ? 
      data.map(row => {
        const filtered: any = {}
        columns.forEach(col => {
          if (row.hasOwnProperty(col)) {
            filtered[col] = row[col]
          }
        })
        return filtered
      }) : data

    return {
      content: JSON.stringify(filteredData, null, 2),
      mimeType: 'application/json'
    }
  }

  private static formatAsXLSX(data: any[], columns?: string[]) {
    // This would require a library like 'xlsx' or 'exceljs'
    // For now, return CSV format as fallback
    return this.formatAsCSV(data, columns)
  }

  // Get available report templates
  static getReportTemplates() {
    return Object.entries(REPORT_TEMPLATES).map(([key, template]) => ({
      id: key,
      ...template
    }))
  }

  // Generate filename
  static generateFileName(type: string, format: string, customName?: string): string {
    const timestamp = new Date().toISOString().split('T')[0]
    const baseName = customName || `${type}_report_${timestamp}`
    return `${baseName}.${format}`
  }
}
