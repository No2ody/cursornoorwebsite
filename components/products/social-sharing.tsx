'use client'

import { useState } from 'react'
import { Share2, Copy, Check, Twitter, Facebook, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'

interface SocialSharingProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    images: string[]
  }
  className?: string
}

export function SocialSharing({ product, className }: SocialSharingProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()

  const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `Check out this amazing ${product.name} - AED ${product.price.toFixed(2)} from Noor AlTayseer`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Link copied!",
        description: "Product link has been copied to your clipboard.",
      })
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      })
    }
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
  }

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this product: ${product.name}`)
    const body = encodeURIComponent(`
Hi,

I found this interesting product and thought you might like it:

${product.name}
Price: AED ${product.price.toFixed(2)}

${product.description}

Check it out here: ${currentUrl}

Best regards
    `)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`gap-2 hover:bg-brand-50 hover:border-brand ${className}`}
        >
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
          {copied ? (
            <Check className="w-4 h-4 mr-2 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 mr-2" />
          )}
          {copied ? 'Copied!' : 'Copy Link'}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleFacebookShare} className="cursor-pointer">
          <Facebook className="w-4 h-4 mr-2 text-blue-600" />
          Share on Facebook
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleTwitterShare} className="cursor-pointer">
          <Twitter className="w-4 h-4 mr-2 text-sky-500" />
          Share on Twitter
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleWhatsAppShare} className="cursor-pointer">
          <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
          Share on WhatsApp
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleEmailShare} className="cursor-pointer">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Share via Email
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
