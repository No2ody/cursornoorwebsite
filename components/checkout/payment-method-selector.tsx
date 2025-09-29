'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
// import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Banknote,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'
import { STRIPE_PAYMENT_METHODS, getAvailableStripePaymentMethods, calculateStripeProcessingFee } from '@/lib/stripe'

interface PaymentMethodSelectorProps {
  amount: number
  currency?: string
  onPaymentMethodChange: (methods: string[]) => void
  onProcessingFeeChange: (fee: number) => void
  userType?: 'individual' | 'business'
}

const PAYMENT_METHOD_ICONS = {
  'credit-card': CreditCard,
  'apple-pay': Smartphone,
  'google-pay': Smartphone,
  'bank-transfer': Building2,
  'alipay': Smartphone,
  'klarna': Clock,
  'afterpay': Clock,
  'cash': Banknote,
}

const PAYMENT_METHOD_COLORS = {
  card: 'bg-blue-50 border-blue-200 text-blue-800',
  wallet: 'bg-purple-50 border-purple-200 text-purple-800',
  bank_transfer: 'bg-green-50 border-green-200 text-green-800',
  cash: 'bg-orange-50 border-orange-200 text-orange-800',
}

export function PaymentMethodSelector({
  amount,
  currency = 'aed',
  onPaymentMethodChange,
  onProcessingFeeChange,
  userType = 'individual'
}: PaymentMethodSelectorProps) {
  const [selectedMethods, setSelectedMethods] = useState<string[]>(['card'])
  const [availableMethods, setAvailableMethods] = useState<string[]>([])
  const [processingFees, setProcessingFees] = useState<Record<string, number>>({})

  useEffect(() => {
    const methods = getAvailableStripePaymentMethods(amount, currency)
    setAvailableMethods(methods)
    
    // Calculate processing fees for all methods
    const fees: Record<string, number> = {}
    methods.forEach(method => {
      fees[method] = calculateStripeProcessingFee(amount, method)
    })
    setProcessingFees(fees)
    
    // Set default selection to the first available method
    if (methods.length > 0 && selectedMethods.length === 0) {
      setSelectedMethods([methods[0]])
      onPaymentMethodChange([methods[0]])
      onProcessingFeeChange(fees[methods[0]] || 0)
    }
  }, [amount, currency, selectedMethods.length, onPaymentMethodChange, onProcessingFeeChange])

  const handleMethodSelection = (method: string, selected: boolean) => {
    let newSelection: string[]
    
    if (selected) {
      newSelection = [...selectedMethods, method]
    } else {
      newSelection = selectedMethods.filter(m => m !== method)
    }
    
    // Ensure at least one method is selected
    if (newSelection.length === 0) {
      newSelection = ['card'] // Default fallback
    }
    
    setSelectedMethods(newSelection)
    onPaymentMethodChange(newSelection)
    
    // Calculate total processing fee for selected methods (use the lowest)
    const lowestFee = Math.min(...newSelection.map(m => processingFees[m] || 0))
    onProcessingFeeChange(lowestFee)
  }

  const groupMethodsByType = () => {
    const groups: Record<string, string[]> = {
      cards: [],
      wallets: [],
      banks: [],
      alternative: []
    }
    
    availableMethods.forEach(methodKey => {
      const method = STRIPE_PAYMENT_METHODS[methodKey as keyof typeof STRIPE_PAYMENT_METHODS]
      if (!method) return
      
      switch (method.type) {
        case 'card':
          groups.cards.push(methodKey)
          break
        case 'wallet' as any:
          groups.wallets.push(methodKey)
          break
        case 'bank_transfer' as any:
          groups.banks.push(methodKey)
          break
        default:
          groups.alternative.push(methodKey)
      }
    })
    
    return groups
  }

  const renderPaymentMethod = (methodKey: string) => {
    const method = STRIPE_PAYMENT_METHODS[methodKey as keyof typeof STRIPE_PAYMENT_METHODS]
    if (!method) return null
    
    const IconComponent = PAYMENT_METHOD_ICONS[method.icon as keyof typeof PAYMENT_METHOD_ICONS] || CreditCard
    const isSelected = selectedMethods.includes(methodKey)
    const fee = processingFees[methodKey] || 0
    const colorClass = (PAYMENT_METHOD_COLORS as any)[method.type] || PAYMENT_METHOD_COLORS.card
    
    return (
      <div
        key={methodKey}
        className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
          isSelected 
            ? 'border-brand bg-brand-50 shadow-md' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
        onClick={() => handleMethodSelection(methodKey, !isSelected)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{method.displayName}</h4>
                {isSelected && <CheckCircle className="w-4 h-4 text-brand" />}
              </div>
              <p className="text-sm text-gray-600 mt-1">{method.description}</p>
              
              {/* Processing fee */}
              {fee > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <Info className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Processing fee: {fee < 10 ? `${method.processingFee}%` : `AED ${fee.toFixed(2)}`}
                  </span>
                </div>
              )}
              
              {/* Amount limits */}
              {((method as any).minimumAmount || (method as any).maximumAmount) && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 text-amber-500" />
                  <span className="text-xs text-amber-600">
                    {(method as any).minimumAmount && `Min: AED ${(method as any).minimumAmount}`}
                    {(method as any).minimumAmount && (method as any).maximumAmount && ' • '}
                    {(method as any).maximumAmount && `Max: AED ${(method as any).maximumAmount}`}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant={isSelected ? 'default' : 'secondary'} className="text-xs">
              {method.type.replace('_', ' ')}
            </Badge>
            
            {/* Security indicators */}
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">Secure</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const methodGroups = groupMethodsByType()
  const totalFee = Math.min(...selectedMethods.map(m => processingFees[m] || 0))

  return (
    <Card className="shadow-card border-0">
      <CardHeader className="bg-gradient-to-r from-brand to-brand-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Payment amount summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Order Total:</span>
              <span className="text-lg font-bold text-brand">
                {currency.toUpperCase()} {amount.toFixed(2)}
              </span>
            </div>
            {totalFee > 0 && (
              <>
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Processing Fee:</span>
                  <span className="text-gray-800">
                    {currency.toUpperCase()} {totalFee.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center font-medium mt-2 pt-2 border-t">
                  <span>Total to Pay:</span>
                  <span className="text-lg text-brand">
                    {currency.toUpperCase()} {(amount + totalFee).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Card payments */}
          {methodGroups.cards.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Credit & Debit Cards
              </h3>
              <div className="space-y-3">
                {methodGroups.cards.map(renderPaymentMethod)}
              </div>
            </div>
          )}

          {/* Digital wallets */}
          {methodGroups.wallets.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Digital Wallets
              </h3>
              <div className="space-y-3">
                {methodGroups.wallets.map(renderPaymentMethod)}
              </div>
            </div>
          )}

          {/* Bank transfers */}
          {methodGroups.banks.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Bank Transfers
              </h3>
              <div className="space-y-3">
                {methodGroups.banks.map(renderPaymentMethod)}
              </div>
            </div>
          )}

          {/* Alternative methods */}
          {methodGroups.alternative.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Buy Now, Pay Later
              </h3>
              <div className="space-y-3">
                {methodGroups.alternative.map(renderPaymentMethod)}
              </div>
            </div>
          )}

          {/* Security notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              All payments are secured with 256-bit SSL encryption and PCI DSS compliance. 
              Your payment information is never stored on our servers.
            </AlertDescription>
          </Alert>

          {/* Business customer notice */}
          {userType === 'business' && (
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                Business customers can access additional payment terms and invoicing options. 
                Contact our sales team for custom payment arrangements.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
