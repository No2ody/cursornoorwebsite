import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WishlistItem } from '@/types'

interface WishlistStore {
  items: WishlistItem[]
  addItem: (product: WishlistItem) => void
  removeItem: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  clearWishlist: () => void
  getItemCount: () => number
}

export const useWishlist = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const items = get().items
        const existingItem = items.find(item => item.id === product.id)
        
        if (!existingItem) {
          set({ items: [...items, product] })
        }
      },
      
      removeItem: (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) })
      },
      
      isInWishlist: (productId) => {
        return get().items.some(item => item.id === productId)
      },
      
      clearWishlist: () => {
        set({ items: [] })
      },
      
      getItemCount: () => {
        return get().items.length
      },
    }),
    {
      name: 'noor-wishlist',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
