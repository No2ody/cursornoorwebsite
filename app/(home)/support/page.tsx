import { Metadata } from 'next'
import { SupportForm } from '@/components/support/support-form'
import { FAQSection } from '@/components/support/faq-section'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  HelpCircle, 
  Clock, 
  Users, 
  Award, 
  Shield,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Customer Support - Noor AlTayseer',
  description: 'Get help with your lighting and bathroom fixture needs. Expert support, FAQs, and professional assistance available.',
}

export default function SupportPage() {
  const supportStats = [
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Emergency services available around the clock',
      color: 'text-blue-600'
    },
    {
      icon: Users,
      title: 'Expert Team',
      description: 'Certified lighting and plumbing specialists',
      color: 'text-green-600'
    },
    {
      icon: Award,
      title: '15+ Years',
      description: 'Experience in UAE construction industry',
      color: 'text-gold'
    },
    {
      icon: Shield,
      title: 'Guaranteed',
      description: 'Quality service with warranty coverage',
      color: 'text-purple-600'
    }
  ]

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-brand-50 min-h-[calc(100vh-8rem)]">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-100 text-brand px-4 py-2 rounded-full text-sm font-medium mb-6">
            <MessageCircle className="w-4 h-4" />
            Professional Customer Support
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-brand mb-4">
            How Can We Help You?
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get expert assistance with your lighting and bathroom fixture needs. 
            Our certified specialists are here to provide professional support and guidance.
          </p>
        </div>

        {/* Support Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {supportStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 shadow-card">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{stat.title}</h3>
                  <p className="text-sm text-gray-600">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Contact Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="faq" className="space-y-8">
            <FAQSection />
          </TabsContent>

          <TabsContent value="contact" className="space-y-8">
            <SupportForm />
          </TabsContent>
        </Tabs>

        {/* Emergency Contact */}
        <Card className="mt-12 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-red-900 mb-2">Emergency Support</h3>
              <p className="text-red-700 mb-4">
                For urgent lighting or plumbing emergencies, call our 24/7 hotline
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <a 
                  href="tel:+971505382246" 
                  className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +971 50 538 2246
                </a>
                <span className="text-sm text-red-600">
                  Average response time: 4 hours
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-card">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-brand" />
              </div>
              <h3 className="font-semibold mb-2">Phone Support</h3>
              <p className="text-sm text-gray-600 mb-2">Mon-Sat: 8:00 AM - 6:00 PM</p>
              <p className="font-medium text-brand">+971 50 538 2246</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-card">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-semibold mb-2">Email Support</h3>
              <p className="text-sm text-gray-600 mb-2">Response within 24 hours</p>
              <p className="font-medium text-gold">info@nooraltayseer.com</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow border-0 shadow-card">
            <CardContent className="pt-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Visit Our Showroom</h3>
              <p className="text-sm text-gray-600 mb-2">Dubai Business District</p>
              <p className="font-medium text-green-600">Dubai, UAE</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
