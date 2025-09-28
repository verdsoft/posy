import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const search = (searchParams.get("search") || "").trim()
    const offset = (page - 1) * limit

    const whereCondition = search ? {
      name: {
        contains: search,
        mode: 'insensitive' as const
      }
    } : {}

    const [companies, total] = await Promise.all([
      prisma.companies.findMany({
        where: whereCondition,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.companies.count({
        where: whereCondition
      })
    ])

    return NextResponse.json({
      data: companies,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const company = await prisma.companies.create({
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        country: body.country || null,
        tax_number: body.tax_number || null,
        logo: body.logo || null,
        status: body.status || 'active'
      }
    })

    return NextResponse.json({ success: true, data: company })
  } catch (error: any) {
    console.error("Error creating company:", error)
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const company = await prisma.companies.update({
      where: { id: parseInt(body.id) },
      data: {
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        city: body.city || null,
        country: body.country || null,
        tax_number: body.tax_number || null,
        logo: body.logo || null,
        status: body.status || 'active',
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, data: company })
  } catch (error: any) {
    console.error("Error updating company:", error)
    return NextResponse.json({ error: "Failed to update company" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.companies.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting company:", error)
    return NextResponse.json({ error: "Failed to delete company" }, { status: 500 })
  }
}