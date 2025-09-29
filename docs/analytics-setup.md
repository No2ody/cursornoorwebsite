# Google Analytics & Tag Manager Setup Guide

## Overview
This guide explains how to set up Google Analytics 4 (GA4) and Google Tag Manager (GTM) for comprehensive customer journey tracking on the Noor AlTayseer e-commerce platform.

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Google Analytics & Tag Manager
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
NEXT_PUBLIC_GTM_ID="GTM-XXXXXXX"

# Optional: Additional Analytics
NEXT_PUBLIC_HOTJAR_ID="your-hotjar-id"
NEXT_PUBLIC_FACEBOOK_PIXEL_ID="your-facebook-pixel-id"
```

## Setup Steps

### 1. Google Analytics 4 Setup
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property
3. Get your Measurement ID (starts with G-)
4. Add it to `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### 2. Google Tag Manager Setup
1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Create a new container
3. Get your Container ID (starts with GTM-)
4. Add it to `NEXT_PUBLIC_GTM_ID`

### 3. Enhanced E-commerce Configuration
The platform automatically tracks:
- Product views
- Add to cart events
- Remove from cart events
- Begin checkout
- Purchase completion
- Search queries
- User authentication
- Customer journey stages

## Tracked Events

### E-commerce Events
- `view_item` - Product page views
- `add_to_cart` - Items added to cart
- `remove_from_cart` - Items removed from cart
- `begin_checkout` - Checkout process started
- `purchase` - Order completed

### Custom Events
- `product_search` - Search functionality usage
- `quote_request` - Business quote requests
- `consultation_request` - Service consultations
- `support_ticket` - Customer support interactions
- `customer_journey` - Journey stage tracking

### User Events
- `login` - User authentication
- `sign_up` - New user registration
- `newsletter_signup` - Newsletter subscriptions

## Analytics Dashboard

Access the analytics dashboard at `/admin/analytics` to view:
- Visitor trends and statistics
- Revenue and conversion metrics
- Top performing products
- Popular search terms
- Traffic source analysis
- Customer behavior insights

## Implementation Details

### Automatic Tracking
The analytics system automatically tracks:
- Page views on route changes
- E-commerce events from cart interactions
- Search behavior and results
- User authentication events

### Manual Tracking
Use the `useAnalytics` hook for custom tracking:

```typescript
import { useAnalytics } from '@/hooks/use-analytics'

function MyComponent() {
  const analytics = useAnalytics()
  
  const handleCustomEvent = () => {
    analytics.trackEvent({
      action: 'custom_action',
      category: 'engagement',
      label: 'button_click'
    })
  }
}
```

## Data Privacy & GDPR Compliance

The implementation includes:
- Consent management ready integration
- IP anonymization enabled
- Data retention controls
- Cookie policy compliance

## Performance Considerations

- Scripts load asynchronously
- Minimal impact on page load times
- Efficient event batching
- Error handling and fallbacks

## Troubleshooting

### Common Issues
1. **Events not appearing**: Check console for errors and verify IDs
2. **Duplicate events**: Ensure analytics provider is only used once
3. **Missing data**: Verify environment variables are set correctly

### Debug Mode
Enable debug mode in development:
```javascript
window.gtag('config', 'GA_MEASUREMENT_ID', {
  debug_mode: true
})
```

## Business Intelligence Features

### Customer Journey Tracking
- Awareness stage (first visit, product browsing)
- Consideration stage (product comparisons, wishlist)
- Purchase stage (checkout, payment)
- Retention stage (repeat visits, reorders)
- Advocacy stage (reviews, referrals)

### B2B Analytics
- Quote request tracking
- Consultation booking analysis
- Business customer behavior
- Sales funnel optimization

### Performance Metrics
- Page load times
- Error occurrence tracking
- User experience metrics
- Conversion optimization data

This comprehensive analytics setup provides deep insights into customer behavior, business performance, and optimization opportunities for the Noor AlTayseer platform.
