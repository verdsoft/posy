import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const employee_id = searchParams.get("employee_id")
    const date = searchParams.get("date")
    const offset = (page - 1) * limit

    let whereCondition: any = {}
    if (employee_id) whereCondition.employee_id = parseInt(employee_id)
    if (date) whereCondition.date = new Date(date)

    const [attendance, total] = await Promise.all([
      prisma.attendance.findMany({
        where: whereCondition,
        include: {
          employees: {
            select: { id: true, name: true, employee_id: true }
          }
        },
        orderBy: { date: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.attendance.count({
        where: whereCondition
      })
    ])

    return NextResponse.json({
      data: attendance,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const attendance = await prisma.attendance.create({
      data: {
        employee_id: body.employee_id,
        date: new Date(body.date),
        time_in: body.time_in ? new Date(body.time_in) : null,
        time_out: body.time_out ? new Date(body.time_out) : null,
        hours_worked: body.hours_worked ? parseFloat(body.hours_worked) : null,
        status: body.status || 'present'
      }
    })

    return NextResponse.json({ success: true, data: attendance })
  } catch (error: any) {
    console.error("Error creating attendance:", error)
    return NextResponse.json({ error: "Failed to create attendance" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const attendance = await prisma.attendance.update({
      where: { id: parseInt(body.id) },
      data: {
        employee_id: body.employee_id,
        date: new Date(body.date),
        time_in: body.time_in ? new Date(body.time_in) : null,
        time_out: body.time_out ? new Date(body.time_out) : null,
        hours_worked: body.hours_worked ? parseFloat(body.hours_worked) : null,
        status: body.status || 'present',
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, data: attendance })
  } catch (error: any) {
    console.error("Error updating attendance:", error)
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.attendance.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting attendance:", error)
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 })
  }
}