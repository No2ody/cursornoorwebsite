import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { createCompany, createCompanySchema } from '@/lib/company-management'
import { z } from 'zod'

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createCompanySchema.parse(body)

    const company = await createCompany({
      ownerId: session.user.id,
      companyData: validatedData,
    })

    return NextResponse.json({ 
      success: true, 
      company,
      message: 'Company created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('Create company error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create company'
      },
      { status: 500 }
    )
  }
}
