import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { DashboardNav } from '@/components/dashboard/dashboard-nav'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin')
  }

  return (
    <div className='flex min-h-screen flex-col'>
      <Header />
      <div className='flex-1 pt-32'>
        <div className='container mx-auto px-4 py-6 max-w-7xl'>
          <div className='grid gap-8 md:grid-cols-[240px_1fr]'>
            <aside className='hidden md:flex md:flex-col'>
              <div className='sticky top-48'>
                <DashboardNav />
              </div>
            </aside>
            <main className='flex-1 min-w-0'>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
