import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ProductActions } from './product-actions'
import { ProductsPagination } from './products-pagination'
import { Edit, Eye, Package } from 'lucide-react'

interface ProductsTableProps {
  page: number
  search: string
  category: string
  status: string
  sort: string
}

const ITEMS_PER_PAGE = 10

async function getProducts({
  page,
  search,
  category,
  sort,
}: ProductsTableProps) {
  const skip = (page - 1) * ITEMS_PER_PAGE

  // Build where clause
  const where: Record<string, unknown> = {}
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }
  
  if (category && category !== 'all') {
    where.category = { name: { contains: category, mode: 'insensitive' } }
  }

  // Build orderBy clause
  let orderBy: Record<string, string> = { name: 'asc' }
  switch (sort) {
    case 'name-desc':
      orderBy = { name: 'desc' }
      break
    case 'price':
      orderBy = { price: 'asc' }
      break
    case 'price-desc':
      orderBy = { price: 'desc' }
      break
    case 'created':
      orderBy = { createdAt: 'asc' }
      break
    case 'created-desc':
      orderBy = { createdAt: 'desc' }
      break
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
      orderBy,
      skip,
      take: ITEMS_PER_PAGE,
    }),
    prisma.product.count({ where }),
  ])

  return {
    products,
    totalCount,
    totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
  }
}

export async function ProductsTable(props: ProductsTableProps) {
  const { products, totalCount, totalPages } = await getProducts(props)

  if (products.length === 0) {
    return (
      <div className='p-8 text-center'>
        <div className='flex flex-col items-center justify-center space-y-4'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
            <Package className='w-8 h-8 text-gray-400' />
          </div>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>No products found</h3>
            <p className='text-gray-500 mt-1'>
              {props.search || props.category || props.status
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first product'}
            </p>
          </div>
          <Button asChild className='mt-4'>
            <Link href='/admin/products/new'>Add Product</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {/* Table Header Info */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-medium text-gray-900'>
              Products ({totalCount})
            </h3>
            <p className='text-sm text-gray-500 mt-1'>
              Showing {(props.page - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(props.page * ITEMS_PER_PAGE, totalCount)} of {totalCount} products
            </p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className='px-6 pb-6'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-16'></TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='w-24'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className='hover:bg-gray-50'>
                {/* Product Image */}
                <TableCell>
                  <div className='w-12 h-12 rounded-lg overflow-hidden bg-gray-100'>
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={48}
                        height={48}
                        className='object-cover w-full h-full'
                      />
                    ) : (
                      <div className='w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center'>
                        <span className='text-blue-600 text-xs font-semibold'>
                          {product.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Product Info */}
                <TableCell>
                  <div className='space-y-1'>
                    <div className='font-medium text-gray-900 line-clamp-1'>
                      {product.name}
                    </div>
                    <div className='text-sm text-gray-500 line-clamp-1'>
                      {product.description}
                    </div>
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell>
                  <Badge variant='secondary' className='bg-blue-100 text-blue-800'>
                    {product.category?.name || 'Uncategorized'}
                  </Badge>
                </TableCell>

                {/* Price */}
                <TableCell>
                  <span className='font-medium'>
                    {formatCurrency(product.price)}
                  </span>
                </TableCell>

                {/* Stock */}
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <span className={`font-medium ${
                      product.stock > 10 
                        ? 'text-green-600' 
                        : product.stock > 0 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`}>
                      {product.stock}
                    </span>
                    {product.stock <= 5 && product.stock > 0 && (
                      <Badge variant='outline' className='border-yellow-300 text-yellow-600 text-xs'>
                        Low
                      </Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge variant='outline' className='border-red-300 text-red-600 text-xs'>
                        Out
                      </Badge>
                    )}
                  </div>
                </TableCell>

                {/* Orders Count */}
                <TableCell>
                  <span className='text-gray-600'>
                    {product._count.orderItems}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell>
                  <Badge 
                    variant='secondary'
                    className={
                      product.stock > 0
                        ? 'bg-green-100 text-green-800 border-green-200'
                        : 'bg-gray-100 text-gray-800 border-gray-200'
                    }
                  >
                    {product.stock > 0 ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='sm'
                      asChild
                      className='h-8 w-8 p-0'
                    >
                      <Link href={`/products/${product.id}`}>
                        <Eye className='h-4 w-4' />
                      </Link>
                    </Button>
                    <Button
                      variant='ghost'
                      size='sm'
                      asChild
                      className='h-8 w-8 p-0'
                    >
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className='h-4 w-4' />
                      </Link>
                    </Button>
                    <ProductActions productId={product.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='mt-6'>
            <ProductsPagination
              currentPage={props.page}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  )
}
