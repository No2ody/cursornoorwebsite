'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X, ImageIcon, Upload } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Image from 'next/image'

interface ImageUploaderProps {
  value: string[]
  onChange: (value: string[]) => void
  maxFiles?: number
  disabled?: boolean
}

export function ImageUploader({
  value,
  onChange,
  maxFiles = 10,
  disabled = false,
}: ImageUploaderProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Check if adding these files would exceed the limit
    if (value.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload ${maxFiles} images total`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const newImageUrls: string[] = []

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image file`,
            variant: "destructive",
          })
          continue
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} is larger than 5MB`,
            variant: "destructive",
          })
          continue
        }

        // Convert file to base64 data URL for preview
        const reader = new FileReader()
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })

        newImageUrls.push(dataUrl)
      }

      if (newImageUrls.length > 0) {
        onChange([...value, ...newImageUrls])
        toast({
          title: "Upload successful",
          description: `${newImageUrls.length} image(s) uploaded successfully`,
        })
      }
    } catch {
      toast({
        title: "Upload failed",
        description: "Failed to process the selected files",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove))
    toast({
      title: "Image removed",
      description: "Image has been removed successfully",
    })
  }

  const canUploadMore = value.length < maxFiles

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Display existing images */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border">
                <Image 
                  src={url} 
                  alt={`Product image ${index + 1}`} 
                  fill
                  className="object-cover"
                  onError={() => {
                    toast({
                      title: "Image Error",
                      description: "Failed to load image",
                      variant: "destructive",
                    })
                  }}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveImage(index)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
              {index === 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute bottom-1 left-1 text-xs"
                >
                  Primary
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canUploadMore && !disabled && (
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {value.length === 0 ? 'Upload Product Images' : 'Add More Images'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Choose image files from your computer. Supports JPG, PNG, WebP (max 5MB each)
            </p>
            <Button 
              type="button"
              variant="outline" 
              onClick={handleFileSelect}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Select Images
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {value.length} of {maxFiles} images uploaded
        </span>
        {value.length >= maxFiles && (
          <span className="text-orange-600">Maximum images reached</span>
        )}
      </div>
    </div>
  )
}