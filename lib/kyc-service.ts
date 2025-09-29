// KYC/KYB Service Layer
import { PrismaClient, KYCStatus, KYBStatus, OnboardingStep, DocumentType, DocumentStatus, RiskLevel, VerificationLevel } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Validation schemas
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  address: z.object({
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    postalCode: z.string().min(3, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
  }).optional(),
})

export const businessInfoSchema = z.object({
  companyName: z.string().min(2, 'Company name is required'),
  businessType: z.enum(['LLC', 'CORPORATION', 'PARTNERSHIP', 'SOLE_PROPRIETORSHIP', 'OTHER']),
  registrationNumber: z.string().min(3, 'Registration number is required'),
  taxId: z.string().optional(),
  vatNumber: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  businessAddress: z.object({
    street: z.string().min(5, 'Business address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().optional(),
    postalCode: z.string().min(3, 'Postal code is required'),
    country: z.string().min(2, 'Country is required'),
  }),
  authorizedSignatories: z.array(z.object({
    name: z.string().min(2, 'Signatory name is required'),
    title: z.string().min(2, 'Title is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
  })).min(1, 'At least one authorized signatory is required'),
})

export const documentUploadSchema = z.object({
  type: z.nativeEnum(DocumentType),
  fileName: z.string().min(1, 'File name is required'),
  fileUrl: z.string().url('Valid file URL is required'),
  fileMimeType: z.string().min(1, 'File type is required'),
  fileSize: z.number().positive('File size must be positive'),
  documentNumber: z.string().optional(),
  issuedDate: z.string().optional(),
  expiryDate: z.string().optional(),
  issuingAuthority: z.string().optional(),
})

// KYC/KYB Service Class
export class KYCService {
  // Initialize onboarding session
  static async initializeOnboarding(userId: string, accountType: 'INDIVIDUAL' | 'BUSINESS') {
    const existingSession = await prisma.onboardingSession.findUnique({
      where: { userId }
    })

    if (existingSession) {
      return existingSession
    }

    const session = await prisma.onboardingSession.create({
      data: {
        userId,
        currentStep: OnboardingStep.EMAIL_VERIFICATION,
        stepData: {
          accountType,
          startedAt: new Date().toISOString(),
        },
        completedSteps: [OnboardingStep.REGISTRATION],
      }
    })

    // Update user onboarding step
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: OnboardingStep.EMAIL_VERIFICATION }
    })

    return session
  }

  // Get onboarding progress
  static async getOnboardingProgress(userId: string) {
    const session = await prisma.onboardingSession.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
            firstName: true,
            lastName: true,
            phone: true,
            accountType: true,
            kycStatus: true,
            kybStatus: true,
            verificationLevel: true,
            onboardingStep: true,
            verificationDocuments: {
              select: {
                id: true,
                type: true,
                status: true,
                createdAt: true,
              }
            }
          }
        }
      }
    })

    if (!session) {
      return null
    }

    // Calculate progress percentage
    const totalSteps = session.user.accountType === 'BUSINESS' ? 10 : 8
    const completedSteps = session.completedSteps.length
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100)

    // Determine next required documents
    const requiredDocuments = this.getRequiredDocuments(
      session.user.accountType,
      session.currentStep
    )

    const uploadedDocuments = session.user.verificationDocuments.map(doc => doc.type)
    const pendingDocuments = requiredDocuments.filter(
      docType => !uploadedDocuments.includes(docType)
    )

    return {
      ...session,
      progressPercentage,
      requiredDocuments,
      pendingDocuments,
      canProceed: this.canProceedToNextStep(session.currentStep, session.user),
    }
  }

  // Update personal information
  static async updatePersonalInfo(userId: string, data: z.infer<typeof personalInfoSchema>) {
    const validatedData = personalInfoSchema.parse(data)

    // Update user profile
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone,
      }
    })

    // Update onboarding session
    await this.updateOnboardingStep(userId, OnboardingStep.DOCUMENT_UPLOAD, {
      personalInfo: validatedData,
      completedAt: new Date().toISOString(),
    })

    return { success: true }
  }

  // Update business information
  static async updateBusinessInfo(userId: string, data: z.infer<typeof businessInfoSchema>) {
    const validatedData = businessInfoSchema.parse(data)

    // Update onboarding session with business data
    await this.updateOnboardingStep(userId, OnboardingStep.DOCUMENT_UPLOAD, {
      businessInfo: validatedData,
      completedAt: new Date().toISOString(),
    })

    return { success: true }
  }

  // Upload verification document
  static async uploadDocument(userId: string, data: z.infer<typeof documentUploadSchema>) {
    const validatedData = documentUploadSchema.parse(data)

    // Check if document type already exists
    const existingDoc = await prisma.verificationDocument.findFirst({
      where: {
        userId,
        type: validatedData.type,
        status: { not: DocumentStatus.REJECTED }
      }
    })

    if (existingDoc) {
      throw new Error(`Document of type ${validatedData.type} already uploaded`)
    }

    // Determine document category
    const category = this.getDocumentCategory(validatedData.type)

    // Create document record
    const document = await prisma.verificationDocument.create({
      data: {
        userId,
        type: validatedData.type,
        category: category as any,
        fileName: validatedData.fileName,
        fileUrl: validatedData.fileUrl,
        fileMimeType: validatedData.fileMimeType,
        fileSize: validatedData.fileSize,
        documentNumber: validatedData.documentNumber,
        issuedDate: validatedData.issuedDate ? new Date(validatedData.issuedDate) : null,
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        issuingAuthority: validatedData.issuingAuthority,
        status: DocumentStatus.PENDING,
      }
    })

    // Update onboarding progress
    await this.checkAndUpdateOnboardingProgress(userId)

    return document
  }

  // Verify document (admin function)
  static async verifyDocument(
    documentId: string, 
    adminId: string, 
    approved: boolean, 
    notes?: string
  ) {
    const document = await prisma.verificationDocument.findUnique({
      where: { id: documentId },
      include: { user: true }
    })

    if (!document) {
      throw new Error('Document not found')
    }

    // Update document status
    await prisma.verificationDocument.update({
      where: { id: documentId },
      data: {
        status: approved ? DocumentStatus.APPROVED : DocumentStatus.REJECTED,
        verifiedAt: approved ? new Date() : null,
        verifiedBy: adminId,
        verificationNotes: notes,
        rejectionReason: approved ? null : notes,
      }
    })

    // Update user KYC/KYB status if all required documents are approved
    await this.updateVerificationStatus(document.userId)

    return { success: true }
  }

  // Risk assessment
  static async performRiskAssessment(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        verificationDocuments: true,
        orders: { take: 10, orderBy: { createdAt: 'desc' } },
        company: true,
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    let riskScore = 0
    let riskLevel: RiskLevel = RiskLevel.LOW

    // Risk factors
    const factors = {
      // Account age (newer accounts = higher risk)
      accountAge: this.calculateAccountAge(user.createdAt),
      // Verification status
      hasVerifiedDocuments: user.verificationDocuments.some(doc => doc.status === DocumentStatus.APPROVED),
      // Transaction history
      orderCount: user.orders.length,
      totalSpent: user.orders.reduce((sum, order) => sum + order.total, 0),
      // Business account factors
      isBusinessAccount: user.accountType === 'BUSINESS',
      hasCompanyInfo: !!user.company,
    }

    // Calculate risk score (0-100)
    if (factors.accountAge < 30) riskScore += 20 // New account
    if (!factors.hasVerifiedDocuments) riskScore += 30 // No verified documents
    if (factors.orderCount === 0) riskScore += 15 // No order history
    if (factors.isBusinessAccount && !factors.hasCompanyInfo) riskScore += 25 // Business without company info

    // Determine risk level
    if (riskScore >= 70) riskLevel = RiskLevel.CRITICAL
    else if (riskScore >= 50) riskLevel = RiskLevel.HIGH
    else if (riskScore >= 25) riskLevel = RiskLevel.MEDIUM
    else riskLevel = RiskLevel.LOW

    // Update user risk assessment
    await prisma.user.update({
      where: { id: userId },
      data: {
        riskScore,
        riskLevel,
        lastRiskAssessment: new Date(),
      }
    })

    return { riskScore, riskLevel, factors }
  }

  // Helper methods
  private static async updateOnboardingStep(
    userId: string, 
    step: OnboardingStep, 
    stepData: Record<string, unknown>
  ) {
    const session = await prisma.onboardingSession.findUnique({
      where: { userId }
    })

    if (!session) {
      throw new Error('Onboarding session not found')
    }

    const updatedStepData = {
      ...session.stepData as object,
      [step]: stepData,
    }

    const updatedCompletedSteps = session.completedSteps.includes(step)
      ? session.completedSteps
      : [...session.completedSteps, step]

    await prisma.onboardingSession.update({
      where: { userId },
      data: {
        currentStep: step,
        stepData: updatedStepData as any,
        completedSteps: updatedCompletedSteps,
        lastActiveAt: new Date(),
      }
    })

    await prisma.user.update({
      where: { id: userId },
      data: { onboardingStep: step }
    })
  }

  private static async checkAndUpdateOnboardingProgress(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { verificationDocuments: true }
    })

    if (!user) return

    const requiredDocs = this.getRequiredDocuments(user.accountType, user.onboardingStep)
    const approvedDocs = user.verificationDocuments
      .filter(doc => doc.status === DocumentStatus.APPROVED)
      .map(doc => doc.type)

    const hasAllRequiredDocs = requiredDocs.every(docType => 
      approvedDocs.includes(docType)
    )

    if (hasAllRequiredDocs && user.onboardingStep === OnboardingStep.DOCUMENT_UPLOAD) {
      await this.updateOnboardingStep(userId, OnboardingStep.IDENTITY_VERIFICATION, {
        documentsCompleted: true,
        completedAt: new Date().toISOString(),
      })
    }
  }

  private static async updateVerificationStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { verificationDocuments: true }
    })

    if (!user) return

    const approvedDocs = user.verificationDocuments.filter(
      doc => doc.status === DocumentStatus.APPROVED
    )

    let kycStatus = user.kycStatus
    let kybStatus = user.kybStatus
    let verificationLevel = user.verificationLevel

    if (user.accountType === 'INDIVIDUAL') {
      const hasIdentityDoc = approvedDocs.some(doc => 
        [DocumentType.NATIONAL_ID, DocumentType.PASSPORT, DocumentType.DRIVING_LICENSE].includes(doc.type as any)
      )
      const hasAddressDoc = approvedDocs.some(doc => 
        [DocumentType.UTILITY_BILL, DocumentType.BANK_STATEMENT].includes(doc.type as any)
      )

      if (hasIdentityDoc && hasAddressDoc) {
        kycStatus = KYCStatus.APPROVED
        verificationLevel = VerificationLevel.ENHANCED
      } else if (hasIdentityDoc) {
        kycStatus = KYCStatus.IN_PROGRESS
        verificationLevel = VerificationLevel.STANDARD
      }
    } else {
      // Business account
      const hasBusinessLicense = approvedDocs.some(doc => doc.type === DocumentType.BUSINESS_LICENSE)
      const hasTaxCert = approvedDocs.some(doc => doc.type === DocumentType.TAX_CERTIFICATE)
      const hasIncorporationCert = approvedDocs.some(doc => doc.type === DocumentType.CERTIFICATE_OF_INCORPORATION)

      if (hasBusinessLicense && hasTaxCert && hasIncorporationCert) {
        kybStatus = KYBStatus.APPROVED
        verificationLevel = VerificationLevel.PREMIUM
      } else if (hasBusinessLicense) {
        kybStatus = KYBStatus.IN_PROGRESS
        verificationLevel = VerificationLevel.ENHANCED
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus, kybStatus, verificationLevel }
    })
  }

  private static getRequiredDocuments(accountType: string, step: OnboardingStep): DocumentType[] {
    if (accountType === 'INDIVIDUAL') {
      switch (step) {
        case OnboardingStep.DOCUMENT_UPLOAD:
        case OnboardingStep.IDENTITY_VERIFICATION:
          return [DocumentType.NATIONAL_ID, DocumentType.UTILITY_BILL]
        default:
          return []
      }
    } else {
      // Business account
      switch (step) {
        case OnboardingStep.DOCUMENT_UPLOAD:
        case OnboardingStep.BUSINESS_VERIFICATION:
          return [
            DocumentType.BUSINESS_LICENSE,
            DocumentType.TAX_CERTIFICATE,
            DocumentType.CERTIFICATE_OF_INCORPORATION,
            DocumentType.AUTHORIZED_SIGNATORY_LIST
          ]
        default:
          return []
      }
    }
  }

  private static getDocumentCategory(type: DocumentType) {
    const categoryMap = {
      [DocumentType.NATIONAL_ID]: 'IDENTITY',
      [DocumentType.PASSPORT]: 'IDENTITY',
      [DocumentType.DRIVING_LICENSE]: 'IDENTITY',
      [DocumentType.UTILITY_BILL]: 'ADDRESS',
      [DocumentType.BANK_STATEMENT]: 'FINANCIAL',
      [DocumentType.BUSINESS_LICENSE]: 'BUSINESS',
      [DocumentType.TAX_CERTIFICATE]: 'BUSINESS',
      [DocumentType.VAT_CERTIFICATE]: 'BUSINESS',
      [DocumentType.CERTIFICATE_OF_INCORPORATION]: 'BUSINESS',
      [DocumentType.MEMORANDUM_OF_ASSOCIATION]: 'BUSINESS',
      [DocumentType.BOARD_RESOLUTION]: 'BUSINESS',
      [DocumentType.AUTHORIZED_SIGNATORY_LIST]: 'BUSINESS',
      [DocumentType.PROOF_OF_ADDRESS]: 'ADDRESS',
      [DocumentType.FINANCIAL_STATEMENT]: 'FINANCIAL',
      [DocumentType.BANK_LETTER]: 'FINANCIAL',
      [DocumentType.OTHER]: 'COMPLIANCE',
    }
    return categoryMap[type] || 'COMPLIANCE'
  }

  private static canProceedToNextStep(currentStep: OnboardingStep, user: any): boolean {
    switch (currentStep) {
      case OnboardingStep.EMAIL_VERIFICATION:
        return !!user.emailVerified
      case OnboardingStep.PHONE_VERIFICATION:
        return !!user.phone
      case OnboardingStep.PROFILE_COMPLETION:
        return !!(user.firstName && user.lastName)
      case OnboardingStep.DOCUMENT_UPLOAD:
        const requiredDocs = this.getRequiredDocuments(user.accountType, currentStep)
        const uploadedDocs = user.verificationDocuments?.map((doc: any) => doc.type) || []
        return requiredDocs.every(docType => uploadedDocs.includes(docType))
      default:
        return true
    }
  }

  private static calculateAccountAge(createdAt: Date): number {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - createdAt.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) // Days
  }
}
