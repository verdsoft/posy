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

    const [shifts, total] = await Promise.all([
      prisma.office_shifts.findMany({
        where: whereCondition,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.office_shifts.count({
        where: whereCondition
      })
    ])

    return NextResponse.json({
      data: shifts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching shifts:", error)
    return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const shift = await prisma.office_shifts.create({
      data: {
        name: body.name,
        start_time: new Date(body.start_time),
        end_time: new Date(body.end_time),
        status: body.status || 'active'
      }
    })

    return NextResponse.json({ success: true, data: shift })
  } catch (error: any) {
    console.error("Error creating shift:", error)
    return NextResponse.json({ error: "Failed to create shift" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const shift = await prisma.office_shifts.update({
      where: { id: parseInt(body.id) },
      data: {
        name: body.name,
        start_time: new Date(body.start_time),
        end_time: new Date(body.end_time),
        status: body.status || 'active',
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, data: shift })
  } catch (error: any) {
    console.error("Error updating shift:", error)
    return NextResponse.json({ error: "Failed to update shift" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.office_shifts.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting shift:", error)
    return NextResponse.json({ error: "Failed to delete shift" }, { status: 500 })
  }
}