'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Mail, Phone, MessageCircle, Clock /*, CheckCircle, AlertCircle*/ } from 'lucide-react'

interface SupportFormData {
  name: string
  email: string
  phone: string
  subject: string
  category: string
  priority: string
  message: string
  orderNumber?: string
}

const supportCategories = [
  { value: 'product-inquiry', label: 'Product Inquiry' },
  { value: 'order-status', label: 'Order Status' },
  { value: 'technical-support', label: 'Technical Support' },
  { value: 'installation', label: 'Installation Services' },
  { value: 'warranty', label: 'Warranty Claim' },
  { value: 'billing', label: 'Billing & Payment' },
  { value: 'returns', label: 'Returns & Exchanges' },
  { value: 'consultation', label: 'Free Consultation' },
  { value: 'other', label: 'Other' }
]

const priorityLevels = [
  { value: 'low', label: 'Low - General inquiry' },
  { value: 'medium', label: 'Medium - Need assistance' },
  { value: 'high', label: 'High - Urgent issue' },
  { value: 'critical', label: 'Critical - Business impact' }
]

export function SupportForm() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<SupportFormData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    subject: '',
    category: '',
    priority: 'medium',
    message: '',
    orderNumber: ''
  })

  const handleInputChange = (field: keyof SupportFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: session?.user?.id
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Support Request Submitted',
          description: `Your ticket #${result.ticketNumber} has been created. We'll respond within 24 hours.`,
        })
        
        // Reset form
        setFormData({
          name: session?.user?.name || '',
          email: session?.user?.email || '',
          phone: '',
          subject: '',
          category: '',
          priority: 'medium',
          message: '',
          orderNumber: ''
        })
      } else {
        throw new Error('Failed to submit support request')
      }
    } catch (error) {
      console.error('Error submitting support request:', error)
      toast({
        title: 'Error',
        description: 'Failed to submit support request. Please try again or contact us directly.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-brand" />
            </div>
            <h3 className="font-semibold mb-2">Call Us</h3>
            <p className="text-sm text-gray-600 mb-2">Speak directly with our experts</p>
            <p className="font-medium text-brand">+971 50 538 2246</p>
            <p className="text-xs text-gray-500 mt-1">Mon-Sat: 8AM-6PM UAE</p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-gold" />
            </div>
            <h3 className="font-semibold mb-2">Email Us</h3>
            <p className="text-sm text-gray-600 mb-2">Send us your detailed inquiry</p>
            <p className="font-medium text-gold">info@nooraltayseer.com</p>
            <p className="text-xs text-gray-500 mt-1">Response within 24 hours</p>
          </CardContent>
        </Card>

        <Card className="text-center hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-2">Get instant assistance</p>
            <p className="font-medium text-green-600">Available Now</p>
            <p className="text-xs text-gray-500 mt-1">Click chat bubble below</p>
          </CardContent>
        </Card>
      </div>

      {/* Support Form */}
      <Card className="shadow-card border-0">
        <CardHeader className="bg-gradient-to-r from-brand to-brand-600 text-white rounded-t-lg">
          <CardTitle className="text-xl flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Submit Support Request
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+971 XX XXX XXXX"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="orderNumber">Order Number (if applicable)</Label>
                <Input
                  id="orderNumber"
                  value={formData.orderNumber}
                  onChange={(e) => handleInputChange('orderNumber', e.target.value)}
                  placeholder="e.g., ORD-12345"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Request Details */}
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                required
                placeholder="Brief description of your inquiry"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority Level</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityLevels.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                required
                placeholder="Please provide detailed information about your inquiry..."
                rows={6}
                className="mt-1"
              />
            </div>

            {/* Response Time Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Expected Response Times</h4>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• <strong>Critical:</strong> Within 2 hours</li>
                    <li>• <strong>High:</strong> Within 4 hours</li>
                    <li>• <strong>Medium:</strong> Within 24 hours</li>
                    <li>• <strong>Low:</strong> Within 48 hours</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name || !formData.email || !formData.subject || !formData.category || !formData.message}
              className="w-full btn-brand"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Submit Support Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
