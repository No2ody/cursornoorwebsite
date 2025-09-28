import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { acceptInvitation } from '@/lib/company-management'
import prisma from '@/lib/prisma'
import { InvitationStatus } from '@prisma/client'

// GET /api/invitations/[token] - Get invitation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invitation = await prisma.userInvitation.findUnique({
      where: { token },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            industry: true,
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

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json({ 
        error: 'Invitation is no longer valid',
        status: invitation.status 
      }, { status: 400 })
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ 
        error: 'Invitation has expired' 
      }, { status: 400 })
    }

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error('Get invitation error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitation details' },
      { status: 500 }
    )
  }
}

// POST /api/invitations/[token] - Accept invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await params

    const updatedUser = await acceptInvitation({
      token,
      userId: session.user.id,
    })

    return NextResponse.json({ 
      success: true, 
      user: updatedUser,
      message: 'Invitation accepted successfully'
    })
  } catch (error) {
    console.error('Accept invitation error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to accept invitation'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/invitations/[token] - Decline invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const invitation = await prisma.userInvitation.findUnique({
      where: { token },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json({ 
        error: 'Invitation is no longer valid' 
      }, { status: 400 })
    }

    // Update invitation status to declined
    await prisma.userInvitation.update({
      where: { token },
      data: {
        status: InvitationStatus.DECLINED,
      },
    })

    return NextResponse.json({ 
      success: true,
      message: 'Invitation declined'
    })
  } catch (error) {
    console.error('Decline invitation error:', error)
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    )
  }
}
