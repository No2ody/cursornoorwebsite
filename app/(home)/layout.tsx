import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CustomerChat } from '@/components/support/customer-chat'

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex min-h-screen flex-col'>
      <Header />
      <main id="main-content" className='flex-1'>{children}</main>
      <Footer />
      <CustomerChat />
    </div>
  )
}
