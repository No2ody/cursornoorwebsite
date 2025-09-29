'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Search, HelpCircle, Lightbulb, Wrench, Truck, CreditCard, Shield } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
}

const faqData: FAQItem[] = [
  // Product & Lighting
  {
    id: '1',
    question: 'What types of LED lighting do you offer?',
    answer: 'We offer a comprehensive range of LED lighting solutions including downlights, track lights, linear lights, panel lights, strip lights, outdoor lighting, and smart lighting systems. All our LED products are energy-efficient and come with a 2-year warranty.',
    category: 'products',
    tags: ['led', 'lighting', 'products', 'types']
  },
  {
    id: '2',
    question: 'Do you provide lighting design consultation?',
    answer: 'Yes! We offer free lighting design consultation services. Our certified lighting designers will assess your space and provide customized lighting solutions that meet your functional and aesthetic requirements.',
    category: 'products',
    tags: ['consultation', 'design', 'free', 'lighting']
  },
  {
    id: '3',
    question: 'What bathroom fixtures do you carry?',
    answer: 'Our bathroom collection includes premium faucets, showerheads, bathtubs, vanities, mirrors, accessories, and complete bathroom suites. We carry both modern and traditional styles from leading manufacturers.',
    category: 'products',
    tags: ['bathroom', 'fixtures', 'faucets', 'vanities']
  },

  // Installation & Services
  {
    id: '4',
    question: 'Do you provide installation services?',
    answer: 'Yes, we provide professional installation services for all our products. Our certified technicians ensure proper installation with a 1-year service warranty. Installation can be scheduled during checkout or by contacting our support team.',
    category: 'installation',
    tags: ['installation', 'service', 'warranty', 'technicians']
  },
  {
    id: '5',
    question: 'How much does installation cost?',
    answer: 'Installation costs vary based on the complexity and type of products. Basic LED installation starts from AED 50 per fixture. Bathroom fixture installation ranges from AED 150-500 depending on the item. We provide free quotes before any work begins.',
    category: 'installation',
    tags: ['cost', 'pricing', 'installation', 'quote']
  },
  {
    id: '6',
    question: 'Do you offer emergency repair services?',
    answer: 'Yes, we provide emergency repair services for lighting and plumbing issues. Our emergency service is available 24/7 with a 4-hour response time within Dubai. Additional charges apply for emergency calls.',
    category: 'installation',
    tags: ['emergency', 'repair', '24/7', 'response']
  },

  // Shipping & Delivery
  {
    id: '7',
    question: 'What are your shipping options and costs?',
    answer: 'We offer free shipping on orders over AED 500 within UAE. Standard delivery takes 2-3 business days. Express delivery (next day) is available for AED 25. We also offer same-day delivery in Dubai for AED 50.',
    category: 'shipping',
    tags: ['shipping', 'delivery', 'free', 'express', 'same-day']
  },
  {
    id: '8',
    question: 'Do you deliver outside UAE?',
    answer: 'Currently, we only deliver within the UAE. We serve all Emirates including Dubai, Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain.',
    category: 'shipping',
    tags: ['delivery', 'uae', 'emirates', 'international']
  },
  {
    id: '9',
    question: 'Can I track my order?',
    answer: 'Yes, you will receive a tracking number via SMS and email once your order ships. You can track your order status in real-time through our website or by calling our customer service.',
    category: 'shipping',
    tags: ['tracking', 'order', 'status', 'sms', 'email']
  },

  // Payment & Pricing
  {
    id: '10',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, bank transfers, and cash on delivery. For business customers, we also offer 30-day payment terms upon credit approval.',
    category: 'payment',
    tags: ['payment', 'credit card', 'cod', 'bank transfer', 'business']
  },
  {
    id: '11',
    question: 'Do you offer bulk pricing for contractors?',
    answer: 'Yes, we offer special contractor pricing for bulk orders and registered trade professionals. Contact our sales team with your project requirements for a customized quote.',
    category: 'payment',
    tags: ['bulk', 'contractor', 'pricing', 'trade', 'discount']
  },
  {
    id: '12',
    question: 'Can I get a quote for my project?',
    answer: 'Absolutely! We provide detailed quotes for all projects, big or small. You can request a quote through our website, call us, or visit our showroom. We typically respond within 24 hours.',
    category: 'payment',
    tags: ['quote', 'project', 'pricing', 'estimate']
  },

  // Warranty & Returns
  {
    id: '13',
    question: 'What is your warranty policy?',
    answer: 'LED lighting products come with a 2-year manufacturer warranty. Bathroom fixtures have a 1-year warranty. Installation services include a 1-year workmanship warranty. Warranty covers defects in materials and workmanship.',
    category: 'warranty',
    tags: ['warranty', 'guarantee', '2-year', 'defects', 'workmanship']
  },
  {
    id: '14',
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of purchase for unused items in original packaging. Custom or special-order items cannot be returned. Return shipping costs are customer responsibility unless the item is defective.',
    category: 'warranty',
    tags: ['return', '30-day', 'unused', 'packaging', 'policy']
  },
  {
    id: '15',
    question: 'How do I make a warranty claim?',
    answer: 'To make a warranty claim, contact our support team with your order number and description of the issue. We may request photos or videos. Approved claims will be processed within 5-7 business days.',
    category: 'warranty',
    tags: ['warranty', 'claim', 'support', 'process', 'photos']
  }
]

const categories = [
  { id: 'all', name: 'All Questions', icon: HelpCircle, color: 'bg-gray-100 text-gray-700' },
  { id: 'products', name: 'Products & Lighting', icon: Lightbulb, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'installation', name: 'Installation & Services', icon: Wrench, color: 'bg-blue-100 text-blue-700' },
  { id: 'shipping', name: 'Shipping & Delivery', icon: Truck, color: 'bg-green-100 text-green-700' },
  { id: 'payment', name: 'Payment & Pricing', icon: CreditCard, color: 'bg-purple-100 text-purple-700' },
  { id: 'warranty', name: 'Warranty & Returns', icon: Shield, color: 'bg-red-100 text-red-700' }
]

export function FAQSection() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-brand mb-4">Frequently Asked Questions</h2>
        <p className="text-lg text-gray-600">Find quick answers to common questions about our products and services</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          placeholder="Search FAQs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 py-3 text-lg"
        />
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => {
          const Icon = category.icon
          const isActive = selectedCategory === category.id
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-brand text-white' 
                  : `${category.color} hover:opacity-80`
              }`}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </button>
          )
        })}
      </div>

      {/* Results Count */}
      {searchTerm && (
        <div className="text-sm text-gray-600">
          Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''} for &ldquo;{searchTerm}&rdquo;
        </div>
      )}

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse different categories.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFAQs.map((faq) => {
            const isExpanded = expandedItems.has(faq.id)
            const categoryInfo = categories.find(cat => cat.id === faq.category)
            
            return (
              <Card key={faq.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <button
                    onClick={() => toggleExpanded(faq.id)}
                    className="w-full text-left p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 pr-4">{faq.question}</h3>
                        {categoryInfo && (
                          <Badge variant="secondary" className={`${categoryInfo.color} text-xs`}>
                            {categoryInfo.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {isExpanded && (
                    <div className="px-6 pb-6">
                      <div className="border-t pt-4">
                        <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-4">
                          {faq.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Still Need Help */}
      <Card className="bg-gradient-to-r from-brand-50 to-gold-50 border-brand-200">
        <CardContent className="p-6 text-center">
          <HelpCircle className="w-12 h-12 text-brand mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-brand mb-2">Still need help?</h3>
          <p className="text-gray-700 mb-4">
            Can&rsquo;t find what you&rsquo;re looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="btn-brand">
              Submit Support Request
            </button>
            <button className="btn-ghost-brand">
              Call +971 50 538 2246
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
