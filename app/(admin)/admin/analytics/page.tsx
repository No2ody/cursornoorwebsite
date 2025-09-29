import { Metadata } from 'next'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'

export const metadata: Metadata = {
  title: 'Analytics Dashboard - Noor AlTayseer Admin',
  description: 'View website analytics, customer behavior, and performance metrics',
}

export default function AnalyticsPage() {
  return <AnalyticsDashboard />
}