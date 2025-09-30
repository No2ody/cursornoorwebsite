import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

// Image optimization configuration
export const IMAGE_CONFIG = {
  // Supported formats
  SUPPORTED_FORMATS: ['jpeg', 'jpg', 'png', 'webp', 'avif'] as const,
  
  // Quality settings
  QUALITY: {
    webp: 85,
    avif: 80,
    jpeg: 85,
    png: 90
  },
  
  // Size presets for responsive images
  SIZES: {
    thumbnail: { width: 150, height: 150 },
    small: { width: 300, height: 300 },
    medium: { width: 600, height: 600 },
    large: { width: 1200, height: 1200 },
    hero: { width: 1920, height: 1080 }
  },
  
  // Cache settings
  CACHE_MAX_AGE: 31536000, // 1 year
  STALE_WHILE_REVALIDATE: 86400 // 1 day
}

export type ImageFormat = typeof IMAGE_CONFIG.SUPPORTED_FORMATS[number]
export type ImageSize = keyof typeof IMAGE_CONFIG.SIZES

interface OptimizeImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: ImageFormat
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  background?: string
}

export class ImageOptimizer {
  
  /**
   * Optimize image with Sharp
   */
  static async optimizeImage(
    inputBuffer: Buffer,
    options: OptimizeImageOptions = {}
  ): Promise<{ buffer: Buffer; contentType: string; size: number }> {
    const {
      width,
      height,
      quality,
      format = 'webp',
      fit = 'cover',
      background = 'white'
    } = options
    
    let pipeline = sharp(inputBuffer)
    
    // Resize if dimensions provided
    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit,
        background,
        withoutEnlargement: true
      })
    }
    
    // Apply format-specific optimizations
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({
          quality: quality || IMAGE_CONFIG.QUALITY.webp,
          effort: 6 // Higher effort for better compression
        })
        break
        
      case 'avif':
        pipeline = pipeline.avif({
          quality: quality || IMAGE_CONFIG.QUALITY.avif,
          effort: 9 // Maximum effort for AVIF
        })
        break
        
      case 'jpeg':
      case 'jpg':
        pipeline = pipeline.jpeg({
          quality: quality || IMAGE_CONFIG.QUALITY.jpeg,
          progressive: true,
          mozjpeg: true
        })
        break
        
      case 'png':
        pipeline = pipeline.png({
          quality: quality || IMAGE_CONFIG.QUALITY.png,
          progressive: true,
          compressionLevel: 9
        })
        break
    }
    
    const buffer = await pipeline.toBuffer()
    
    return {
      buffer,
      contentType: `image/${format}`,
      size: buffer.length
    }
  }
  
  /**
   * Generate responsive image variants
   */
  static async generateResponsiveImages(
    inputBuffer: Buffer,
    baseName: string,
    outputDir: string
  ): Promise<{
    variants: Array<{
      size: ImageSize
      format: ImageFormat
      path: string
      width: number
      height: number
      fileSize: number
    }>
  }> {
    const variants = []
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true })
    
    // Generate variants for each size and format
    for (const [sizeName, dimensions] of Object.entries(IMAGE_CONFIG.SIZES)) {
      for (const format of ['webp', 'jpeg'] as ImageFormat[]) {
        try {
          const optimized = await this.optimizeImage(inputBuffer, {
            ...dimensions,
            format
          })
          
          const fileName = `${baseName}-${sizeName}.${format}`
          const filePath = path.join(outputDir, fileName)
          
          await fs.writeFile(filePath, optimized.buffer)
          
          variants.push({
            size: sizeName as ImageSize,
            format,
            path: filePath,
            width: dimensions.width,
            height: dimensions.height,
            fileSize: optimized.size
          })
        } catch (error) {
          console.error(`Failed to generate ${sizeName} ${format} variant:`, error)
        }
      }
    }
    
    return { variants }
  }
  
  /**
   * Get optimal image format based on browser support
   */
  static getOptimalFormat(acceptHeader: string): ImageFormat {
    if (acceptHeader.includes('image/avif')) {
      return 'avif'
    }
    if (acceptHeader.includes('image/webp')) {
      return 'webp'
    }
    return 'jpeg'
  }
  
  /**
   * Generate srcset for responsive images
   */
  static generateSrcSet(
    basePath: string,
    variants: Array<{ size: ImageSize; width: number; format: ImageFormat }>
  ): string {
    return variants
      .filter(v => v.format === 'webp') // Prefer WebP for srcset
      .map(v => `${basePath}-${v.size}.${v.format} ${v.width}w`)
      .join(', ')
  }
  
  /**
   * Create Next.js Image component props
   */
  static createImageProps(
    src: string,
    alt: string,
    options: {
      priority?: boolean
      sizes?: string
      fill?: boolean
      width?: number
      height?: number
    } = {}
  ) {
    const {
      priority = false,
      sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      fill = false,
      width,
      height
    } = options
    
    return {
      src,
      alt,
      priority,
      sizes,
      fill,
      width,
      height,
      quality: 85,
      placeholder: 'blur' as const,
      blurDataURL: this.generateBlurDataURL(),
      style: {
        objectFit: 'cover' as const,
        objectPosition: 'center'
      }
    }
  }
  
  /**
   * Generate blur placeholder data URL
   */
  static generateBlurDataURL(width = 10, height = 10): string {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>
    `
    
    const base64 = Buffer.from(svg).toString('base64')
    return `data:image/svg+xml;base64,${base64}`
  }
  
  /**
   * Validate image file
   */
  static async validateImage(buffer: Buffer): Promise<{
    isValid: boolean
    format?: string
    width?: number
    height?: number
    size: number
    errors: string[]
  }> {
    const errors: string[] = []
    let metadata: sharp.Metadata
    
    try {
      metadata = await sharp(buffer).metadata()
    } catch {
      return {
        isValid: false,
        size: buffer.length,
        errors: ['Invalid image format or corrupted file']
      }
    }
    
    // Check file size (max 10MB)
    if (buffer.length > 10 * 1024 * 1024) {
      errors.push('File size exceeds 10MB limit')
    }
    
    // Check dimensions (max 5000x5000)
    if (metadata.width && metadata.width > 5000) {
      errors.push('Image width exceeds 5000px limit')
    }
    
    if (metadata.height && metadata.height > 5000) {
      errors.push('Image height exceeds 5000px limit')
    }
    
    // Check format
    if (metadata.format && !IMAGE_CONFIG.SUPPORTED_FORMATS.includes(metadata.format as ImageFormat)) {
      errors.push(`Unsupported format: ${metadata.format}`)
    }
    
    return {
      isValid: errors.length === 0,
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: buffer.length,
      errors
    }
  }
  
  /**
   * Create optimized image response with proper headers
   */
  static createImageResponse(
    buffer: Buffer,
    contentType: string,
    options: {
      maxAge?: number
      staleWhileRevalidate?: number
      etag?: string
    } = {}
  ): NextResponse {
    const {
      maxAge = IMAGE_CONFIG.CACHE_MAX_AGE,
      staleWhileRevalidate = IMAGE_CONFIG.STALE_WHILE_REVALIDATE,
      etag
    } = options
    
    const response = new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
        'Content-Length': buffer.length.toString(),
        ...(etag && { 'ETag': etag })
      }
    })
    
    return response
  }
}

/**
 * Image optimization middleware for API routes
 */
export function withImageOptimization(
  handler: (request: NextRequest, optimizedImage?: Buffer) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Only process POST requests with image data
      if (request.method !== 'POST') {
        return handler(request)
      }
      
      const formData = await request.formData()
      const imageFile = formData.get('image') as File
      
      if (!imageFile) {
        return handler(request)
      }
      
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      
      // Validate image
      const validation = await ImageOptimizer.validateImage(buffer)
      if (!validation.isValid) {
        return NextResponse.json(
          { error: 'Invalid image', details: validation.errors },
          { status: 400 }
        )
      }
      
      // Get optimal format based on Accept header
      const acceptHeader = request.headers.get('accept') || ''
      const optimalFormat = ImageOptimizer.getOptimalFormat(acceptHeader)
      
      // Optimize image
      const optimized = await ImageOptimizer.optimizeImage(buffer, {
        format: optimalFormat,
        width: 1200, // Default max width
        height: 1200 // Default max height
      })
      
      return handler(request, optimized.buffer)
      
    } catch (error) {
      console.error('Image optimization error:', error)
      return handler(request)
    }
  }
}

/**
 * Generate image optimization API route
 */
export function createImageOptimizationRoute() {
  return async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url)
      const src = searchParams.get('src')
      const width = searchParams.get('w') ? parseInt(searchParams.get('w')!) : undefined
      const height = searchParams.get('h') ? parseInt(searchParams.get('h')!) : undefined
      const quality = searchParams.get('q') ? parseInt(searchParams.get('q')!) : undefined
      const format = searchParams.get('f') as ImageFormat || 'webp'
      
      if (!src) {
        return NextResponse.json({ error: 'Missing src parameter' }, { status: 400 })
      }
      
      // Fetch original image
      const imageResponse = await fetch(src)
      if (!imageResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 404 })
      }
      
      const buffer = Buffer.from(await imageResponse.arrayBuffer())
      
      // Optimize image
      const optimized = await ImageOptimizer.optimizeImage(buffer, {
        width,
        height,
        quality,
        format
      })
      
      // Generate ETag for caching
      const etag = `"${Buffer.from(src + width + height + quality + format).toString('base64')}"`
      
      // Check if client has cached version
      const ifNoneMatch = request.headers.get('if-none-match')
      if (ifNoneMatch === etag) {
        return new NextResponse(null, { status: 304 })
      }
      
      return ImageOptimizer.createImageResponse(
        optimized.buffer,
        optimized.contentType,
        { etag }
      )
      
    } catch (error) {
      console.error('Image optimization route error:', error)
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}
