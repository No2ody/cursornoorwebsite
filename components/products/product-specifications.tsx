'use client'

import { Info, Zap, Package, Shield, Settings } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

interface ProductSpecificationsProps {
  product: {
    id: string
    name: string
    description: string
    category?: {
      name: string
    }
  }
}

export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  // Generate specifications based on product category and name
  const generateSpecifications = () => {
    const isLighting = product.category?.name.toLowerCase().includes('led') || 
                     product.category?.name.toLowerCase().includes('light')
    const isBathroom = product.category?.name.toLowerCase().includes('bath') || 
                      product.category?.name.toLowerCase().includes('mirror')
    
    const baseSpecs = {
      general: [
        { label: 'Brand', value: 'Noor AlTayseer' },
        { label: 'Category', value: product.category?.name || 'General' },
        { label: 'Model', value: product.name.split(' ').slice(0, 2).join(' ') },
        { label: 'Warranty', value: '2 Years' },
      ]
    }

    if (isLighting) {
      return {
        ...baseSpecs,
        electrical: [
          { label: 'Power Consumption', value: '10-50W' },
          { label: 'Voltage', value: '220-240V AC' },
          { label: 'LED Lifespan', value: '50,000+ hours' },
          { label: 'Color Temperature', value: '3000K-6500K' },
          { label: 'Lumens Output', value: '800-5000 lm' },
          { label: 'CRI', value: '≥80' },
        ],
        features: [
          { label: 'Dimmable', value: 'Yes' },
          { label: 'Energy Rating', value: 'A++' },
          { label: 'Beam Angle', value: '120°' },
          { label: 'IP Rating', value: 'IP65' },
          { label: 'Materials', value: 'Aluminum Alloy' },
        ],
        installation: [
          { label: 'Mounting Type', value: 'Surface/Recessed' },
          { label: 'Installation', value: 'Professional Required' },
          { label: 'Cut-out Size', value: 'Various (see manual)' },
          { label: 'Driver Included', value: 'Yes' },
        ]
      }
    }

    if (isBathroom) {
      return {
        ...baseSpecs,
        dimensions: [
          { label: 'Width', value: '600-1200mm' },
          { label: 'Height', value: '600-800mm' },
          { label: 'Depth', value: '20-150mm' },
          { label: 'Weight', value: '5-25kg' },
        ],
        features: [
          { label: 'Material', value: 'Tempered Glass/Ceramic' },
          { label: 'Water Resistance', value: 'IP44' },
          { label: 'Anti-Fog', value: 'Available' },
          { label: 'LED Backlight', value: 'Integrated' },
          { label: 'Touch Switch', value: 'Yes' },
        ],
        installation: [
          { label: 'Mounting', value: 'Wall Mount' },
          { label: 'Installation Type', value: 'Built-in/Surface' },
          { label: 'Professional Install', value: 'Recommended' },
          { label: 'Electrical Connection', value: '220V AC' },
        ]
      }
    }

    return {
      ...baseSpecs,
      specifications: [
        { label: 'Materials', value: 'High Quality Components' },
        { label: 'Installation', value: 'Professional Required' },
        { label: 'Maintenance', value: 'Low Maintenance' },
        { label: 'Certification', value: 'CE, RoHS' },
      ]
    }
  }

  const specifications = generateSpecifications()

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'electrical':
        return <Zap className="w-4 h-4 text-yellow-600" />
      case 'dimensions':
        return <Package className="w-4 h-4 text-blue-600" />
      case 'features':
        return <Settings className="w-4 h-4 text-green-600" />
      case 'installation':
        return <Info className="w-4 h-4 text-purple-600" />
      default:
        return <Shield className="w-4 h-4 text-gray-600" />
    }
  }

  const getSectionTitle = (section: string) => {
    switch (section) {
      case 'general':
        return 'General Information'
      case 'electrical':
        return 'Electrical Specifications'
      case 'dimensions':
        return 'Dimensions & Weight'
      case 'features':
        return 'Features & Materials'
      case 'installation':
        return 'Installation Requirements'
      case 'specifications':
        return 'Technical Specifications'
      default:
        return section.charAt(0).toUpperCase() + section.slice(1)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5 text-brand" />
          Product Specifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full" defaultValue={['general']}>
          {Object.entries(specifications).map(([section, specs]) => (
            <AccordionItem key={section} value={section}>
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-2">
                  {getSectionIcon(section)}
                  <span className="font-medium">{getSectionTitle(section)}</span>
                  <Badge variant="secondary" className="ml-auto mr-2">
                    {specs.length} items
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-3 pt-2">
                  {specs.map((spec, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-gray-600 font-medium">
                          {spec.label}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                          {spec.value}
                        </span>
                      </div>
                      {index < specs.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-6 p-4 bg-brand-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-brand flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-brand mb-1">
                Professional Installation Recommended
              </p>
              <p className="text-xs text-gray-600">
                For optimal performance and warranty coverage, we recommend professional installation by our certified technicians.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
