'use client'

import { useMemo } from 'react'
import { calculatePasswordStrength } from '@/lib/password-security'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle, Shield } from 'lucide-react'

interface PasswordStrengthProps {
  password: string
  showFeedback?: boolean
  className?: string
}

export function PasswordStrength({ 
  password, 
  showFeedback = true, 
  className = '' 
}: PasswordStrengthProps) {
  const strength = useMemo(() => {
    return calculatePasswordStrength(password)
  }, [password])

  const getColorClasses = (level: string) => {
    switch (level) {
      case 'weak':
        return {
          progress: 'bg-red-500',
          badge: 'bg-red-100 text-red-800 border-red-200',
          text: 'text-red-600',
          icon: XCircle
        }
      case 'fair':
        return {
          progress: 'bg-orange-500',
          badge: 'bg-orange-100 text-orange-800 border-orange-200',
          text: 'text-orange-600',
          icon: AlertCircle
        }
      case 'good':
        return {
          progress: 'bg-yellow-500',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: 'text-yellow-600',
          icon: AlertCircle
        }
      case 'strong':
        return {
          progress: 'bg-blue-500',
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          text: 'text-blue-600',
          icon: CheckCircle
        }
      case 'very-strong':
        return {
          progress: 'bg-green-500',
          badge: 'bg-green-100 text-green-800 border-green-200',
          text: 'text-green-600',
          icon: Shield
        }
      default:
        return {
          progress: 'bg-gray-300',
          badge: 'bg-gray-100 text-gray-800 border-gray-200',
          text: 'text-gray-600',
          icon: XCircle
        }
    }
  }

  const colors = getColorClasses(strength.level)
  const IconComponent = colors.icon

  if (!password) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Password Strength Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Password Strength
          </span>
          <Badge variant="outline" className={colors.badge}>
            <IconComponent className="w-3 h-3 mr-1" />
            {strength.level.replace('-', ' ').toUpperCase()}
          </Badge>
        </div>
        
        <div className="relative">
          <Progress 
            value={strength.score} 
            className="h-2"
          />
          <div 
            className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${colors.progress}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Weak</span>
          <span>Strong</span>
        </div>
      </div>

      {/* Password Requirements & Feedback */}
      {showFeedback && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Security Requirements
          </h4>
          
          <div className="grid grid-cols-1 gap-2 text-sm">
            {/* Length Check */}
            <PasswordRequirement
              met={password.length >= 8}
              text="At least 8 characters"
            />
            
            {/* Character Type Checks */}
            <PasswordRequirement
              met={/[a-z]/.test(password)}
              text="Contains lowercase letters"
            />
            
            <PasswordRequirement
              met={/[A-Z]/.test(password)}
              text="Contains uppercase letters"
            />
            
            <PasswordRequirement
              met={/\d/.test(password)}
              text="Contains numbers"
            />
            
            <PasswordRequirement
              met={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)}
              text="Contains special characters"
            />
            
            {/* Security Checks */}
            <PasswordRequirement
              met={!/(.)\1{2,}/.test(password)}
              text="No repeated characters"
            />
            
            <PasswordRequirement
              met={!/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789)/i.test(password)}
              text="No sequential characters"
            />
          </div>

          {/* Feedback Messages */}
          {strength.feedback.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {strength.feedback.map((feedback, index) => (
                    <li key={index} className="text-sm">
                      {feedback}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  )
}

interface PasswordRequirementProps {
  met: boolean
  text: string
}

function PasswordRequirement({ met, text }: PasswordRequirementProps) {
  return (
    <div className={`flex items-center gap-2 ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? (
        <CheckCircle className="w-4 h-4 text-green-500" />
      ) : (
        <XCircle className="w-4 h-4 text-gray-400" />
      )}
      <span className={`text-sm ${met ? 'font-medium' : ''}`}>
        {text}
      </span>
    </div>
  )
}
