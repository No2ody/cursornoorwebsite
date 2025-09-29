'use client'

import { useCallback } from 'react'
import {
  trackEvent,
  trackAddToCart,
  trackRemoveFromCart,
  trackViewItem,
  trackBeginCheckout,
  trackPurchase,
  trackSearch,
  trackLogin,
  trackSignUp,
  trackCustomerJourney,
  trackQuoteRequest,
  trackConsultationRequest,
  trackSupportTicket,
  type AnalyticsEvent,
  type EcommerceEvent,
  type EcommerceItem
} from '@/lib/analytics'

export function useAnalytics() {
  // Product tracking
  const trackProductView = useCallback((product: {
    id: string
    name: string
    category: string
    price: number
    brand?: string
  }) => {
    const item: EcommerceItem = {
      item_id: product.id,
      item_name: product.name,
      category: product.category,
      quantity: 1,
      price: product.price,
      item_brand: product.brand,
    }
    trackViewItem(item)
  }, [])

  const trackProductAddToCart = useCallback((product: {
    id: string
    name: string
    category: string
    price: number
    quantity: number
    brand?: string
  }) => {
    const ecommerceData: EcommerceEvent = {
      currency: 'AED',
      value: product.price * product.quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        item_brand: product.brand,
      }]
    }
    trackAddToCart(ecommerceData)
  }, [])

  const trackProductRemoveFromCart = useCallback((product: {
    id: string
    name: string
    category: string
    price: number
    quantity: number
    brand?: string
  }) => {
    const ecommerceData: EcommerceEvent = {
      currency: 'AED',
      value: product.price * product.quantity,
      items: [{
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: product.quantity,
        price: product.price,
        item_brand: product.brand,
      }]
    }
    trackRemoveFromCart(ecommerceData)
  }, [])

  // Checkout tracking
  const trackCheckoutBegin = useCallback((cartItems: Array<{
    id: string
    name: string
    category: string
    price: number
    quantity: number
    brand?: string
  }>, totalValue: number, coupon?: string) => {
    const ecommerceData: EcommerceEvent = {
      currency: 'AED',
      value: totalValue,
      items: cartItems.map(item => ({
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        item_brand: item.brand,
      })),
      coupon
    }
    trackBeginCheckout(ecommerceData)
  }, [])

  const trackOrderComplete = useCallback((order: {
    id: string
    items: Array<{
      id: string
      name: string
      category: string
      price: number
      quantity: number
      brand?: string
    }>
    total: number
    shipping?: number
    tax?: number
    coupon?: string
  }) => {
    const ecommerceData: EcommerceEvent & { transaction_id: string } = {
      transaction_id: order.id,
      currency: 'AED',
      value: order.total,
      items: order.items.map(item => ({
        item_id: item.id,
        item_name: item.name,
        category: item.category,
        quantity: item.quantity,
        price: item.price,
        item_brand: item.brand,
      })),
      shipping: order.shipping,
      tax: order.tax,
      coupon: order.coupon
    }
    trackPurchase(ecommerceData)
  }, [])

  // Search tracking
  const trackProductSearch = useCallback((searchTerm: string, resultsCount?: number, filters?: Record<string, any>) => {
    trackSearch(searchTerm, resultsCount)
    
    // Additional search analytics
    trackEvent({
      action: 'product_search',
      category: 'engagement',
      label: searchTerm,
      value: resultsCount,
      custom_parameters: {
        search_term: searchTerm,
        results_count: resultsCount,
        filters: filters,
      }
    })
  }, [])

  // User authentication tracking
  const trackUserLogin = useCallback((method: 'email' | 'google' | 'github') => {
    trackLogin(method)
  }, [])

  const trackUserSignUp = useCallback((method: 'email' | 'google' | 'github') => {
    trackSignUp(method)
  }, [])

  // Customer journey tracking
  const trackJourneyStage = useCallback((stage: 'awareness' | 'consideration' | 'purchase' | 'retention' | 'advocacy', data?: Record<string, any>) => {
    trackCustomerJourney(stage, data)
  }, [])

  // Business-specific tracking
  const trackQuoteRequestSubmit = useCallback((productIds: string[], totalValue: number, contactMethod: string) => {
    trackQuoteRequest(productIds, totalValue)
    
    trackEvent({
      action: 'quote_request_submit',
      category: 'business',
      label: contactMethod,
      value: totalValue,
      custom_parameters: {
        product_count: productIds.length,
        contact_method: contactMethod,
      }
    })
  }, [])

  const trackConsultationRequestSubmit = useCallback((serviceType: 'lighting' | 'bathroom' | 'general', contactInfo: Record<string, any>) => {
    trackConsultationRequest(serviceType)
    
    trackEvent({
      action: 'consultation_request_submit',
      category: 'business',
      label: serviceType,
      custom_parameters: {
        service_type: serviceType,
        has_phone: !!contactInfo.phone,
        has_address: !!contactInfo.address,
      }
    })
  }, [])

  const trackSupportTicketSubmit = useCallback((category: string, priority: string, isAuthenticated: boolean) => {
    trackSupportTicket(category, priority)
    
    trackEvent({
      action: 'support_ticket_submit',
      category: 'customer_service',
      label: category,
      custom_parameters: {
        priority: priority,
        user_authenticated: isAuthenticated,
      }
    })
  }, [])

  // Engagement tracking
  const trackNewsletterSignup = useCallback((source: string) => {
    trackEvent({
      action: 'newsletter_signup',
      category: 'engagement',
      label: source,
      custom_parameters: {
        signup_source: source,
      }
    })
  }, [])

  const trackSocialShare = useCallback((platform: string, contentType: string, contentId?: string) => {
    trackEvent({
      action: 'social_share',
      category: 'engagement',
      label: platform,
      custom_parameters: {
        platform: platform,
        content_type: contentType,
        content_id: contentId,
      }
    })
  }, [])

  const trackFileDownload = useCallback((fileName: string, fileType: string) => {
    trackEvent({
      action: 'file_download',
      category: 'engagement',
      label: fileName,
      custom_parameters: {
        file_name: fileName,
        file_type: fileType,
      }
    })
  }, [])

  const trackVideoPlay = useCallback((videoTitle: string, videoDuration?: number) => {
    trackEvent({
      action: 'video_play',
      category: 'engagement',
      label: videoTitle,
      custom_parameters: {
        video_title: videoTitle,
        video_duration: videoDuration,
      }
    })
  }, [])

  // Navigation tracking
  const trackCategoryView = useCallback((categoryName: string, productCount: number) => {
    trackEvent({
      action: 'category_view',
      category: 'navigation',
      label: categoryName,
      value: productCount,
      custom_parameters: {
        category_name: categoryName,
        product_count: productCount,
      }
    })
  }, [])

  const trackFilterUsage = useCallback((filterType: string, filterValue: string, resultsCount: number) => {
    trackEvent({
      action: 'filter_usage',
      category: 'navigation',
      label: filterType,
      value: resultsCount,
      custom_parameters: {
        filter_type: filterType,
        filter_value: filterValue,
        results_count: resultsCount,
      }
    })
  }, [])

  // Performance tracking
  const trackPageLoadTime = useCallback((pageName: string, loadTime: number) => {
    trackEvent({
      action: 'page_load_time',
      category: 'performance',
      label: pageName,
      value: Math.round(loadTime),
      custom_parameters: {
        page_name: pageName,
        load_time_ms: Math.round(loadTime),
      }
    })
  }, [])

  const trackErrorOccurrence = useCallback((errorType: string, errorMessage: string, pageName: string) => {
    trackEvent({
      action: 'error_occurrence',
      category: 'errors',
      label: errorType,
      custom_parameters: {
        error_type: errorType,
        error_message: errorMessage,
        page_name: pageName,
      }
    })
  }, [])

  return {
    // Product tracking
    trackProductView,
    trackProductAddToCart,
    trackProductRemoveFromCart,
    
    // Checkout tracking
    trackCheckoutBegin,
    trackOrderComplete,
    
    // Search tracking
    trackProductSearch,
    
    // User authentication
    trackUserLogin,
    trackUserSignUp,
    
    // Customer journey
    trackJourneyStage,
    
    // Business tracking
    trackQuoteRequestSubmit,
    trackConsultationRequestSubmit,
    trackSupportTicketSubmit,
    
    // Engagement tracking
    trackNewsletterSignup,
    trackSocialShare,
    trackFileDownload,
    trackVideoPlay,
    
    // Navigation tracking
    trackCategoryView,
    trackFilterUsage,
    
    // Performance tracking
    trackPageLoadTime,
    trackErrorOccurrence,
    
    // Generic event tracking
    trackEvent,
  }
}
