import React, { ReactElement, cloneElement, Children } from 'react'

// WCAG 2.1 AA compliance utilities
export const ACCESSIBILITY_CONFIG = {
  // Color contrast ratios
  CONTRAST_RATIOS: {
    NORMAL_TEXT: 4.5,
    LARGE_TEXT: 3.0,
    UI_COMPONENTS: 3.0
  },
  
  // Focus management
  FOCUS: {
    OUTLINE_WIDTH: '2px',
    OUTLINE_STYLE: 'solid',
    OUTLINE_OFFSET: '2px'
  },
  
  // Animation preferences
  ANIMATION: {
    REDUCED_MOTION_DURATION: '0.01ms',
    DEFAULT_DURATION: '200ms'
  },
  
  // Text sizing
  TEXT: {
    MIN_SIZE: '16px',
    LINE_HEIGHT: 1.5,
    PARAGRAPH_SPACING: '1em'
  }
}

// ARIA attributes and roles
export const ARIA_ROLES = {
  // Landmark roles
  BANNER: 'banner',
  NAVIGATION: 'navigation',
  MAIN: 'main',
  COMPLEMENTARY: 'complementary',
  CONTENTINFO: 'contentinfo',
  SEARCH: 'search',
  
  // Widget roles
  BUTTON: 'button',
  LINK: 'link',
  MENUITEM: 'menuitem',
  TAB: 'tab',
  TABPANEL: 'tabpanel',
  DIALOG: 'dialog',
  ALERTDIALOG: 'alertdialog',
  
  // Live region roles
  ALERT: 'alert',
  STATUS: 'status',
  LOG: 'log',
  
  // Document structure roles
  ARTICLE: 'article',
  HEADING: 'heading',
  LIST: 'list',
  LISTITEM: 'listitem'
} as const

export const ARIA_PROPERTIES = {
  // States
  EXPANDED: 'aria-expanded',
  SELECTED: 'aria-selected',
  CHECKED: 'aria-checked',
  DISABLED: 'aria-disabled',
  HIDDEN: 'aria-hidden',
  PRESSED: 'aria-pressed',
  
  // Properties
  LABEL: 'aria-label',
  LABELLEDBY: 'aria-labelledby',
  DESCRIBEDBY: 'aria-describedby',
  CONTROLS: 'aria-controls',
  OWNS: 'aria-owns',
  HASPOPUP: 'aria-haspopup',
  LIVE: 'aria-live',
  ATOMIC: 'aria-atomic',
  RELEVANT: 'aria-relevant',
  
  // Relationships
  ACTIVEDESCENDANT: 'aria-activedescendant',
  SETSIZE: 'aria-setsize',
  POSINSET: 'aria-posinset'
} as const

// Accessibility utilities
export class AccessibilityUtils {
  
  /**
   * Generate unique IDs for ARIA relationships
   */
  static generateId(prefix: string = 'a11y'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * Calculate color contrast ratio
   */
  static calculateContrastRatio(color1: string, color2: string): number {
    const getLuminance = (color: string): number => {
      // Convert hex to RGB
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255
      
      // Calculate relative luminance
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
      })
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
    }
    
    const lum1 = getLuminance(color1)
    const lum2 = getLuminance(color2)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }
  
  /**
   * Check if color contrast meets WCAG standards
   */
  static meetsContrastRequirement(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA',
    isLargeText: boolean = false
  ): boolean {
    const ratio = this.calculateContrastRatio(foreground, background)
    
    if (level === 'AAA') {
      return isLargeText ? ratio >= 4.5 : ratio >= 7.0
    }
    
    return isLargeText ? ratio >= 3.0 : ratio >= 4.5
  }
  
  /**
   * Create accessible button props
   */
  static createButtonProps(options: {
    label: string
    description?: string
    pressed?: boolean
    expanded?: boolean
    controls?: string
    disabled?: boolean
  }) {
    const { label, description, pressed, expanded, controls, disabled } = options
    
    return {
      role: ARIA_ROLES.BUTTON,
      'aria-label': label,
      ...(description && { 'aria-describedby': description }),
      ...(pressed !== undefined && { 'aria-pressed': pressed }),
      ...(expanded !== undefined && { 'aria-expanded': expanded }),
      ...(controls && { 'aria-controls': controls }),
      ...(disabled && { 'aria-disabled': true, tabIndex: -1 })
    }
  }
  
  /**
   * Create accessible form field props
   */
  static createFormFieldProps(options: {
    id: string
    label: string
    description?: string
    error?: string
    required?: boolean
    invalid?: boolean
  }) {
    const { id, label, description, error, required, invalid } = options
    const describedBy = [description, error].filter(Boolean).join(' ')
    
    return {
      id,
      'aria-label': label,
      ...(describedBy && { 'aria-describedby': describedBy }),
      ...(required && { 'aria-required': true }),
      ...(invalid && { 'aria-invalid': true })
    }
  }
  
  /**
   * Create accessible navigation props
   */
  static createNavigationProps(options: {
    label: string
    current?: string
    items: Array<{ id: string; label: string; href: string; current?: boolean }>
  }) {
    const { label, items } = options
    
    return {
      role: ARIA_ROLES.NAVIGATION,
      'aria-label': label,
      items: items.map(item => ({
        ...item,
        'aria-current': item.current ? 'page' : undefined
      }))
    }
  }
  
  /**
   * Create accessible modal/dialog props
   */
  static createDialogProps(options: {
    title: string
    description?: string
    modal?: boolean
  }) {
    const { title, description, modal = true } = options
    const titleId = this.generateId('dialog-title')
    const descId = description ? this.generateId('dialog-desc') : undefined
    
    return {
      role: modal ? ARIA_ROLES.DIALOG : ARIA_ROLES.ALERTDIALOG,
      'aria-labelledby': titleId,
      ...(descId && { 'aria-describedby': descId }),
      'aria-modal': modal,
      titleId,
      descId
    }
  }
  
  /**
   * Create accessible table props
   */
  static createTableProps(options: {
    caption: string
    headers: Array<{ id: string; label: string; sortable?: boolean; sorted?: 'asc' | 'desc' }>
  }) {
    const { caption, headers } = options
    
    return {
      role: 'table',
      'aria-label': caption,
      headers: headers.map(header => ({
        ...header,
        role: 'columnheader',
        ...(header.sortable && {
          'aria-sort': header.sorted || 'none',
          tabIndex: 0
        })
      }))
    }
  }
  
  /**
   * Create live region for announcements
   */
  static createLiveRegion(options: {
    politeness?: 'polite' | 'assertive' | 'off'
    atomic?: boolean
    relevant?: 'additions' | 'removals' | 'text' | 'all'
  } = {}) {
    const { politeness = 'polite', atomic = false, relevant = 'additions text' } = options
    
    return {
      'aria-live': politeness,
      'aria-atomic': atomic,
      'aria-relevant': relevant,
      role: politeness === 'assertive' ? ARIA_ROLES.ALERT : ARIA_ROLES.STATUS
    }
  }
  
  /**
   * Check if element is focusable
   */
  static isFocusable(element: HTMLElement): boolean {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ]
    
    return focusableSelectors.some(selector => element.matches(selector))
  }
  
  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ')
    
    return Array.from(container.querySelectorAll(focusableSelectors))
  }
  
  /**
   * Trap focus within a container
   */
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container)
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement?.focus()
        }
      }
    }
    
    container.addEventListener('keydown', handleKeyDown)
    
    // Focus first element
    firstElement?.focus()
    
    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }
  
  /**
   * Announce message to screen readers
   */
  static announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', priority)
    announcer.setAttribute('aria-atomic', 'true')
    announcer.className = 'sr-only'
    announcer.textContent = message
    
    document.body.appendChild(announcer)
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcer)
    }, 1000)
  }
}

// React hooks for accessibility
export function useAccessibleId(prefix: string = 'a11y'): string {
  return AccessibilityUtils.generateId(prefix)
}

export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLElement>(null)
  
  React.useEffect(() => {
    if (!isActive || !containerRef.current) return
    
    const cleanup = AccessibilityUtils.trapFocus(containerRef.current)
    return cleanup
  }, [isActive])
  
  return containerRef
}

export function useAnnouncer() {
  return React.useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    AccessibilityUtils.announce(message, priority)
  }, [])
}

// Accessible component wrappers
export interface SkipLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function SkipLink({ href, children, className = '' }: SkipLinkProps) {
  return (
    <a
      href={href}
      className={`skip-link ${className}`}
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 999,
        padding: '8px 16px',
        backgroundColor: '#000',
        color: '#fff',
        textDecoration: 'none',
        fontSize: '14px'
      }}
      onFocus={(e) => {
        const target = e.target as HTMLElement
        target.style.left = '6px'
        target.style.top = '6px'
      }}
      onBlur={(e) => {
        const target = e.target as HTMLElement
        target.style.left = '-9999px'
        target.style.top = 'auto'
      }}
    >
      {children}
    </a>
  )
}

export interface VisuallyHiddenProps {
  children: React.ReactNode
  as?: keyof React.JSX.IntrinsicElements
}

export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return (
    <Component
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0
      }}
    >
      {children}
    </Component>
  )
}

export interface FocusableProps {
  children: React.ReactElement
  disabled?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

export function Focusable({ children, disabled, onFocus, onBlur }: FocusableProps) {
  const childProps = children.props as any
  const props: any = {
    tabIndex: disabled ? -1 : 0,
    onFocus,
    onBlur,
    style: {
      ...(childProps?.style || {}),
      outline: 'none'
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        childProps?.onClick?.(event)
      }
      childProps?.onKeyDown?.(event)
    }
  }
  
  return cloneElement(children, props)
}

// CSS-in-JS accessibility styles
export const accessibilityStyles = {
  // Screen reader only content
  srOnly: {
    position: 'absolute' as const,
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden' as const,
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap' as const,
    border: 0
  },
  
  // Focus styles
  focusVisible: {
    outline: `${ACCESSIBILITY_CONFIG.FOCUS.OUTLINE_WIDTH} ${ACCESSIBILITY_CONFIG.FOCUS.OUTLINE_STYLE} #E6C36A`,
    outlineOffset: ACCESSIBILITY_CONFIG.FOCUS.OUTLINE_OFFSET
  },
  
  // High contrast mode support
  highContrast: {
    '@media (prefers-contrast: high)': {
      border: '1px solid',
      backgroundColor: 'Canvas',
      color: 'CanvasText'
    }
  },
  
  // Reduced motion support
  reducedMotion: {
    '@media (prefers-reduced-motion: reduce)': {
      animationDuration: ACCESSIBILITY_CONFIG.ANIMATION.REDUCED_MOTION_DURATION,
      transitionDuration: ACCESSIBILITY_CONFIG.ANIMATION.REDUCED_MOTION_DURATION
    }
  },
  
  // Minimum touch target size (44px x 44px)
  touchTarget: {
    minWidth: '44px',
    minHeight: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
}

// Accessibility testing utilities
export const AccessibilityTesting = {
  /**
   * Check for common accessibility issues
   */
  auditElement(element: HTMLElement): Array<{ type: string; message: string; severity: 'error' | 'warning' }> {
    const issues: Array<{ type: string; message: string; severity: 'error' | 'warning' }> = []
    
    // Check for missing alt text on images
    const images = element.querySelectorAll('img')
    images.forEach(img => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push({
          type: 'missing-alt-text',
          message: 'Image missing alt text',
          severity: 'error'
        })
      }
    })
    
    // Check for missing form labels
    const inputs = element.querySelectorAll('input, select, textarea')
    inputs.forEach(input => {
      const hasLabel = input.getAttribute('aria-label') || 
                      input.getAttribute('aria-labelledby') ||
                      element.querySelector(`label[for="${input.id}"]`)
      
      if (!hasLabel) {
        issues.push({
          type: 'missing-form-label',
          message: 'Form control missing label',
          severity: 'error'
        })
      }
    })
    
    // Check for insufficient color contrast
    const textElements = element.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button')
    textElements.forEach(el => {
      const styles = window.getComputedStyle(el)
      const color = styles.color
      const backgroundColor = styles.backgroundColor
      
      if (color && backgroundColor && color !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        // This is a simplified check - in practice, you'd need a more robust color parsing
        const fontSize = parseFloat(styles.fontSize)
        const isLargeText = fontSize >= 18 || (fontSize >= 14 && styles.fontWeight === 'bold')
        
        // Note: This would need actual color parsing to work properly
        // For now, it's just a placeholder for the concept
      }
    })
    
    return issues
  },
  
  /**
   * Generate accessibility report
   */
  generateReport(element: HTMLElement): {
    score: number
    issues: Array<{ type: string; message: string; severity: 'error' | 'warning' }>
    recommendations: string[]
  } {
    const issues = this.auditElement(element)
    const errorCount = issues.filter(issue => issue.severity === 'error').length
    const warningCount = issues.filter(issue => issue.severity === 'warning').length
    
    // Simple scoring algorithm
    const totalElements = element.querySelectorAll('*').length
    const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 5))
    
    const recommendations = [
      'Add alt text to all images',
      'Ensure all form controls have labels',
      'Use semantic HTML elements',
      'Provide sufficient color contrast',
      'Make all interactive elements keyboard accessible',
      'Use ARIA attributes appropriately',
      'Test with screen readers'
    ]
    
    return {
      score,
      issues,
      recommendations
    }
  }
}
