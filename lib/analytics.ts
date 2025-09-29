// Google Analytics and Tag Manager configuration
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

// Enhanced E-commerce Events
export interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  custom_parameters?: Record<string, any>
}

export interface EcommerceItem {
  item_id: string
  item_name: string
  category: string
  quantity: number
  price: number
  item_brand?: string
  item_variant?: string
}

export interface EcommerceEvent {
  currency: string
  value: number
  items: EcommerceItem[]
  transaction_id?: string
  coupon?: string
  shipping?: number
  tax?: number
}

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    // Load gtag script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)

    // Initialize gtag
    window.gtag = window.gtag || function() {
      ((window.gtag as any).q = (window.gtag as any).q || []).push(arguments)
    }
    window.gtag('js', new Date())
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
  }
}

// Initialize Google Tag Manager
export const initGTM = () => {
  if (typeof window !== 'undefined' && GTM_ID) {
    // GTM script
    const script = document.createElement('script')
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${GTM_ID}');
    `
    document.head.appendChild(script)

    // GTM noscript iframe
    const noscript = document.createElement('noscript')
    noscript.innerHTML = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `
    document.body.appendChild(noscript)
  }
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: title || document.title,
      page_location: url,
    })
  }

  // Also send to GTM dataLayer
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'page_view',
      page_title: title || document.title,
      page_location: url,
    })
  }
}

// Track custom events
export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    })
  }

  // Also send to GTM dataLayer
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: event.action,
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event.custom_parameters,
    })
  }
}

// E-commerce tracking functions
export const trackPurchase = (data: EcommerceEvent & { transaction_id: string }) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: data.transaction_id,
      value: data.value,
      currency: data.currency,
      items: data.items,
      coupon: data.coupon,
      shipping: data.shipping,
      tax: data.tax,
    })
  }

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: data.transaction_id,
        value: data.value,
        currency: data.currency,
        items: data.items,
        coupon: data.coupon,
        shipping: data.shipping,
        tax: data.tax,
      }
    })
  }
}

export const trackAddToCart = (data: EcommerceEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: data.currency,
      value: data.value,
      items: data.items,
    })
  }

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: data.currency,
        value: data.value,
        items: data.items,
      }
    })
  }
}

export const trackRemoveFromCart = (data: EcommerceEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: data.currency,
      value: data.value,
      items: data.items,
    })
  }

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'remove_from_cart',
      ecommerce: {
        currency: data.currency,
        value: data.value,
        items: data.items,
      }
    })
  }
}

export const trackViewItem = (item: EcommerceItem) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'AED',
      value: item.price,
      items: [item],
    })
  }

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: 'AED',
        value: item.price,
        items: [item],
      }
    })
  }
}

export const trackBeginCheckout = (data: EcommerceEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: data.currency,
      value: data.value,
      items: data.items,
      coupon: data.coupon,
    })
  }

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: data.currency,
        value: data.value,
        items: data.items,
        coupon: data.coupon,
      }
    })
  }
}

export const trackSearch = (searchTerm: string, resultsCount?: number) => {
  trackEvent({
    action: 'search',
    category: 'engagement',
    label: searchTerm,
    value: resultsCount,
    custom_parameters: {
      search_term: searchTerm,
      results_count: resultsCount,
    }
  })
}

export const trackLogin = (method: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'login', {
      method: method,
    })
  }

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'login',
      method: method,
    })
  }
}

export const trackSignUp = (method: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sign_up', {
      method: method,
    })
  }

  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'sign_up',
      method: method,
    })
  }
}

// Customer journey tracking
export const trackCustomerJourney = (stage: string, data?: Record<string, any>) => {
  trackEvent({
    action: 'customer_journey',
    category: 'engagement',
    label: stage,
    custom_parameters: {
      journey_stage: stage,
      ...data,
    }
  })
}

// Business-specific tracking
export const trackQuoteRequest = (productIds: string[], totalValue: number) => {
  trackEvent({
    action: 'quote_request',
    category: 'business',
    label: 'product_quote',
    value: totalValue,
    custom_parameters: {
      product_ids: productIds,
      product_count: productIds.length,
    }
  })
}

export const trackConsultationRequest = (serviceType: string) => {
  trackEvent({
    action: 'consultation_request',
    category: 'business',
    label: serviceType,
    custom_parameters: {
      service_type: serviceType,
    }
  })
}

export const trackSupportTicket = (category: string, priority: string) => {
  trackEvent({
    action: 'support_ticket',
    category: 'customer_service',
    label: category,
    custom_parameters: {
      ticket_category: category,
      priority: priority,
    }
  })
}

// Declare global gtag and dataLayer types
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}