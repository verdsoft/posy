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

    const [departments, total] = await Promise.all([
      prisma.departments.findMany({
        where: whereCondition,
        include: {
          companies: {
            select: { id: true, name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.departments.count({
        where: whereCondition
      })
    ])

    return NextResponse.json({
      data: departments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching departments:", error)
    return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const department = await prisma.departments.create({
      data: {
        name: body.name || body.department,
        company_id: body.company_id,
        description: body.description || null,
        status: body.status || 'active'
      }
    })

    return NextResponse.json({ success: true, data: department })
  } catch (error: any) {
    console.error("Error creating department:", error)
    return NextResponse.json({ error: "Failed to create department" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const department = await prisma.departments.update({
      where: { id: parseInt(body.id) },
      data: {
        name: body.name || body.department,
        company_id: body.company_id,
        description: body.description || null,
        status: body.status || 'active',
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, data: department })
  } catch (error: any) {
    console.error("Error updating department:", error)
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.departments.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting department:", error)
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 })
  }
}


