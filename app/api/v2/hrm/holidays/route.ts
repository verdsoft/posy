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

    const [holidays, total] = await Promise.all([
      prisma.holidays.findMany({
        where: whereCondition,
        orderBy: { start_date: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.holidays.count({
        where: whereCondition
      })
    ])

    return NextResponse.json({
      data: holidays,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching holidays:", error)
    return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const holiday = await prisma.holidays.create({
      data: {
        name: body.name,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        description: body.description || null,
        status: body.status || 'active'
      }
    })

    return NextResponse.json({ success: true, data: holiday })
  } catch (error: any) {
    console.error("Error creating holiday:", error)
    return NextResponse.json({ error: "Failed to create holiday" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const holiday = await prisma.holidays.update({
      where: { id: parseInt(body.id) },
      data: {
        name: body.name,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        description: body.description || null,
        status: body.status || 'active',
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, data: holiday })
  } catch (error: any) {
    console.error("Error updating holiday:", error)
    return NextResponse.json({ error: "Failed to update holiday" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.holidays.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting holiday:", error)
    return NextResponse.json({ error: "Failed to delete holiday" }, { status: 500 })
  }
}