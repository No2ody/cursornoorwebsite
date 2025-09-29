import { Metadata } from 'next'
import { BannerManagement } from '@/components/admin/banners/banner-management'

export const metadata: Metadata = {
  title: 'Banner Management - Noor AlTayseer Admin',
  description: 'Manage promotional banners and sliders with scheduling and analytics',
}

export default function BannersPage() {
  return <BannerManagement />
}
