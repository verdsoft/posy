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

    const [leaveTypes, total] = await Promise.all([
      prisma.leave_types.findMany({
        where: whereCondition,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.leave_types.count({
        where: whereCondition
      })
    ])

    return NextResponse.json({
      data: leaveTypes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching leave types:", error)
    return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const leaveType = await prisma.leave_types.create({
      data: {
        name: body.name,
        days_allowed: body.days_allowed || 0,
        status: body.status || 'active'
      }
    })

    return NextResponse.json({ success: true, data: leaveType })
  } catch (error: any) {
    console.error("Error creating leave type:", error)
    return NextResponse.json({ error: "Failed to create leave type" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const leaveType = await prisma.leave_types.update({
      where: { id: parseInt(body.id) },
      data: {
        name: body.name,
        days_allowed: body.days_allowed || 0,
        status: body.status || 'active',
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, data: leaveType })
  } catch (error: any) {
    console.error("Error updating leave type:", error)
    return NextResponse.json({ error: "Failed to update leave type" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.leave_types.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting leave type:", error)
    return NextResponse.json({ error: "Failed to delete leave type" }, { status: 500 })
  }
}