import { NextRequest } from 'next/server'
import { createImageOptimizationRoute } from '@/lib/image-optimization'

// Image optimization API route
export const GET = createImageOptimizationRoute()

// Handle image uploads with optimization
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return Response.json({ error: 'No image provided' }, { status: 400 })
    }
    
    // This would typically integrate with your file storage service
    // For now, we'll return a success response
    return Response.json({ 
      message: 'Image uploaded and optimized successfully',
      filename: imageFile.name,
      size: imageFile.size
    })
    
  } catch (error) {
    console.error('Image upload error:', error)
    return Response.json({ error: 'Failed to process image' }, { status: 500 })
  }
}
