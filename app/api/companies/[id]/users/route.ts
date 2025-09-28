import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { 
  inviteUserToCompany, 
  removeUserFromCompany, 
  updateUserRole,
  inviteUserSchema,
  getUserCompanyContext 
} from '@/lib/company-management'
import { z } from 'zod'
import { CompanyRole } from '@prisma/client'

const updateUserRoleSchema = z.object({
  userId: z.string(),
  role: z.nativeEnum(CompanyRole),
})

const removeUserSchema = z.object({
  userId: z.string(),
})

// GET /api/companies/[id]/users - Get company users
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params

    // Verify user has access to this company
    const userContext = await getUserCompanyContext(session.user.id)
    
    if (!userContext.company || userContext.company.id !== companyId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const prisma = (await import('@/lib/prisma')).default
    const users = await prisma.user.findMany({
      where: { 
        companyId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        jobTitle: true,
        department: true,
        companyRole: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        invitedBy: true,
        invitedAt: true,
        acceptedAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get company users error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company users' },
      { status: 500 }
    )
  }
}

// POST /api/companies/[id]/users - Invite user or update user role
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params
    const body = await request.json()
    const { action } = body

    if (action === 'invite') {
      const validatedData = inviteUserSchema.parse(body)

      const invitation = await inviteUserToCompany({
        companyId,
        inviterId: session.user.id,
        invitationData: validatedData,
      })

      return NextResponse.json({ 
        success: true, 
        invitation,
        message: 'User invitation sent successfully'
      })
    } else if (action === 'updateRole') {
      const validatedData = updateUserRoleSchema.parse(body)

      const updatedUser = await updateUserRole({
        companyId,
        userId: validatedData.userId,
        newRole: validatedData.role,
        updatedBy: session.user.id,
      })

      return NextResponse.json({ 
        success: true, 
        user: updatedUser,
        message: 'User role updated successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Company users action error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process request'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/companies/[id]/users - Remove user from company
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: companyId } = await params
    const body = await request.json()
    const { userId } = removeUserSchema.parse(body)

    const updatedUser = await removeUserFromCompany({
      companyId,
      userId,
      removedBy: session.user.id,
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: 'User removed from company successfully'
    })
  } catch (error) {
    console.error('Remove user error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to remove user'
      },
      { status: 500 }
    )
  }
}
