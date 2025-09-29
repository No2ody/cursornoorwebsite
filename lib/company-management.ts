import prisma from '@/lib/prisma'
import { 
  CompanyRole, 
  InvitationStatus, 
  UserAccountType, 
  CompanyAccountType,
  CatalogAccessMode 
} from '@prisma/client'
import { z } from 'zod'

// Validation schemas
export const createCompanySchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  accountType: z.nativeEnum(CompanyAccountType).default(CompanyAccountType.STANDARD),
})

export const inviteUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.nativeEnum(CompanyRole),
  message: z.string().optional(),
})

export const updateCompanySettingsSchema = z.object({
  requireApprovalForOrders: z.boolean().optional(),
  orderApprovalLimit: z.number().positive().optional(),
  allowUserInvitations: z.boolean().optional(),
  maxUsers: z.number().int().positive().optional(),
  restrictedCategories: z.array(z.string()).optional(),
  allowedCategories: z.array(z.string()).optional(),
  catalogMode: z.nativeEnum(CatalogAccessMode).optional(),
  customPricingEnabled: z.boolean().optional(),
  volumeDiscountEnabled: z.boolean().optional(),
  notifyOnNewOrders: z.boolean().optional(),
  notifyOnLargeOrders: z.boolean().optional(),
  largeOrderThreshold: z.number().positive().optional(),
})

// Utility functions
export function generateCompanySlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateInvitationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// Permission checking utilities
export function canManageUsers(role: CompanyRole): boolean {
  return [CompanyRole.OWNER, CompanyRole.ADMIN, CompanyRole.MANAGER].includes(role as any)
}

export function canPlaceOrders(role: CompanyRole): boolean {
  return [CompanyRole.OWNER, CompanyRole.ADMIN, CompanyRole.MANAGER, CompanyRole.PURCHASER].includes(role as any)
}

export function canViewOrders(role: CompanyRole): boolean {
  return Object.values(CompanyRole).includes(role) // All roles can view orders
}

export function canManageCompany(role: CompanyRole): boolean {
  return [CompanyRole.OWNER, CompanyRole.ADMIN].includes(role as any)
}

export function canInviteUsers(role: CompanyRole): boolean {
  return [CompanyRole.OWNER, CompanyRole.ADMIN, CompanyRole.MANAGER].includes(role as any)
}

// Company management functions
export async function createCompany({
  ownerId,
  companyData,
}: {
  ownerId: string
  companyData: z.infer<typeof createCompanySchema>
}) {
  // Check if slug is available
  const existingCompany = await prisma.company.findUnique({
    where: { slug: companyData.slug },
  })

  if (existingCompany) {
    throw new Error('Company slug already exists')
  }

  // Create company with default settings
  const company = await prisma.$transaction(async (tx) => {
    // Create the company
    const newCompany = await tx.company.create({
      data: {
        ...companyData,
        ownerId,
      },
    })

    // Create default company settings
    await tx.companySettings.create({
      data: {
        companyId: newCompany.id,
      },
    })

    // Update user to be a business account
    await tx.user.update({
      where: { id: ownerId },
      data: {
        accountType: UserAccountType.BUSINESS,
        companyId: newCompany.id,
        companyRole: CompanyRole.OWNER,
      },
    })

    return newCompany
  })

  return company
}

export async function getCompanyDetails(companyId: string) {
  return await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          companyRole: true,
          isActive: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
      settings: true,
      invitations: {
        where: {
          status: InvitationStatus.PENDING,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          inviter: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      _count: {
        select: {
          users: true,
          invitations: true,
        },
      },
    },
  })
}

export async function inviteUserToCompany({
  companyId,
  inviterId,
  invitationData,
}: {
  companyId: string
  inviterId: string
  invitationData: z.infer<typeof inviteUserSchema>
}) {
  // Verify inviter has permission
  const inviter = await prisma.user.findFirst({
    where: {
      id: inviterId,
      companyId,
      isActive: true,
    },
    include: {
      company: {
        include: {
          settings: true,
        },
      },
    },
  })

  if (!inviter || !inviter.companyRole) {
    throw new Error('User not found or not part of company')
  }

  if (!canInviteUsers(inviter.companyRole)) {
    throw new Error('Insufficient permissions to invite users')
  }

  // Check company settings
  if (inviter.company?.settings && !inviter.company.settings.allowUserInvitations) {
    throw new Error('User invitations are disabled for this company')
  }

  // Check user limit
  if (inviter.company?.settings?.maxUsers) {
    const currentUserCount = await prisma.user.count({
      where: { companyId, isActive: true },
    })

    if (currentUserCount >= inviter.company.settings.maxUsers) {
      throw new Error('Company has reached maximum user limit')
    }
  }

  // Check if user is already part of the company
  const existingUser = await prisma.user.findFirst({
    where: {
      email: invitationData.email,
      companyId,
    },
  })

  if (existingUser) {
    throw new Error('User is already part of this company')
  }

  // Check for existing pending invitation
  const existingInvitation = await prisma.userInvitation.findFirst({
    where: {
      email: invitationData.email,
      companyId,
      status: InvitationStatus.PENDING,
      expiresAt: {
        gt: new Date(),
      },
    },
  })

  if (existingInvitation) {
    throw new Error('Pending invitation already exists for this email')
  }

  // Create invitation
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

  const invitation = await prisma.userInvitation.create({
    data: {
      email: invitationData.email,
      companyId,
      role: invitationData.role,
      invitedBy: inviterId,
      message: invitationData.message,
      expiresAt,
    },
    include: {
      company: {
        select: {
          name: true,
          slug: true,
        },
      },
      inviter: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return invitation
}

export async function acceptInvitation({
  token,
  userId,
}: {
  token: string
  userId: string
}) {
  const invitation = await prisma.userInvitation.findUnique({
    where: { token },
    include: {
      company: true,
    },
  })

  if (!invitation) {
    throw new Error('Invitation not found')
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    throw new Error('Invitation is no longer valid')
  }

  if (invitation.expiresAt < new Date()) {
    throw new Error('Invitation has expired')
  }

  // Get user details
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  if (user.email !== invitation.email) {
    throw new Error('Invitation email does not match user email')
  }

  // Accept invitation
  const result = await prisma.$transaction(async (tx) => {
    // Update invitation status
    await tx.userInvitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.ACCEPTED,
        acceptedBy: userId,
        acceptedAt: new Date(),
      },
    })

    // Update user
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        accountType: UserAccountType.BUSINESS,
        companyId: invitation.companyId,
        companyRole: invitation.role,
        invitedBy: invitation.invitedBy,
        invitedAt: invitation.createdAt,
        acceptedAt: new Date(),
      },
    })

    return updatedUser
  })

  return result
}

export async function removeUserFromCompany({
  companyId,
  userId,
  removedBy,
}: {
  companyId: string
  userId: string
  removedBy: string
}) {
  // Verify remover has permission
  const remover = await prisma.user.findFirst({
    where: {
      id: removedBy,
      companyId,
      isActive: true,
    },
  })

  if (!remover || !remover.companyRole) {
    throw new Error('User not found or not part of company')
  }

  if (!canManageUsers(remover.companyRole)) {
    throw new Error('Insufficient permissions to remove users')
  }

  // Get user to be removed
  const userToRemove = await prisma.user.findFirst({
    where: {
      id: userId,
      companyId,
    },
  })

  if (!userToRemove) {
    throw new Error('User not found in company')
  }

  // Cannot remove company owner
  if (userToRemove.companyRole === CompanyRole.OWNER) {
    throw new Error('Cannot remove company owner')
  }

  // Cannot remove yourself unless you are transferring ownership
  if (userId === removedBy) {
    throw new Error('Cannot remove yourself from company')
  }

  // Remove user from company
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      accountType: UserAccountType.INDIVIDUAL,
      companyId: null,
      companyRole: null,
    },
  })

  return updatedUser
}

export async function updateUserRole({
  companyId,
  userId,
  newRole,
  updatedBy,
}: {
  companyId: string
  userId: string
  newRole: CompanyRole
  updatedBy: string
}) {
  // Verify updater has permission
  const updater = await prisma.user.findFirst({
    where: {
      id: updatedBy,
      companyId,
      isActive: true,
    },
  })

  if (!updater || !updater.companyRole) {
    throw new Error('User not found or not part of company')
  }

  if (!canManageUsers(updater.companyRole)) {
    throw new Error('Insufficient permissions to update user roles')
  }

  // Get user to be updated
  const userToUpdate = await prisma.user.findFirst({
    where: {
      id: userId,
      companyId,
    },
  })

  if (!userToUpdate) {
    throw new Error('User not found in company')
  }

  // Cannot change owner role
  if (userToUpdate.companyRole === CompanyRole.OWNER) {
    throw new Error('Cannot change owner role')
  }

  // Cannot set someone as owner unless you are the owner
  if (newRole === CompanyRole.OWNER && updater.companyRole !== CompanyRole.OWNER) {
    throw new Error('Only company owner can assign owner role')
  }

  // Update user role
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      companyRole: newRole,
    },
  })

  return updatedUser
}

export async function updateCompanySettings({
  companyId,
  userId,
  settings,
}: {
  companyId: string
  userId: string
  settings: z.infer<typeof updateCompanySettingsSchema>
}) {
  // Verify user has permission
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      companyId,
      isActive: true,
    },
  })

  if (!user || !user.companyRole) {
    throw new Error('User not found or not part of company')
  }

  if (!canManageCompany(user.companyRole)) {
    throw new Error('Insufficient permissions to update company settings')
  }

  // Update settings
  const updatedSettings = await prisma.companySettings.upsert({
    where: { companyId },
    update: settings,
    create: {
      companyId,
      ...settings,
    },
  })

  return updatedSettings
}

// Get user's company context
export async function getUserCompanyContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: {
        include: {
          settings: true,
        },
      },
    },
  })

  if (!user) {
    throw new Error('User not found')
  }

  return {
    user,
    company: user.company,
    settings: user.company?.settings,
    permissions: user.companyRole ? {
      canManageUsers: canManageUsers(user.companyRole),
      canPlaceOrders: canPlaceOrders(user.companyRole),
      canViewOrders: canViewOrders(user.companyRole),
      canManageCompany: canManageCompany(user.companyRole),
      canInviteUsers: canInviteUsers(user.companyRole),
    } : null,
  }
}
