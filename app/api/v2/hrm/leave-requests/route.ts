import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const employee_id = searchParams.get("employee_id")
    const status = searchParams.get("status")
    const offset = (page - 1) * limit

    let whereCondition: any = {}
    if (employee_id) whereCondition.employee_id = parseInt(employee_id)
    if (status) whereCondition.status = status

    const [leaveRequests, total] = await Promise.all([
      prisma.leave_requests.findMany({
        where: whereCondition,
        include: {
          employees: {
            select: { id: true, name: true, employee_id: true }
          },
          leave_types: {
            select: { id: true, name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.leave_requests.count({
        where: whereCondition
      })
    ])

    return NextResponse.json({
      data: leaveRequests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching leave requests:", error)
    return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const leaveRequest = await prisma.leave_requests.create({
      data: {
        employee_id: body.employee_id,
        leave_type_id: body.leave_type_id,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        days: Math.ceil((new Date(body.end_date).getTime() - new Date(body.start_date).getTime()) / (1000 * 3600 * 24)) + 1,
        reason: body.reason || null,
        status: body.status || 'pending',
        approved_by: 1, // Defaulting to system/admin for now as we don't have auth context
        approved_at: body.status === 'approved' ? new Date() : null
      }
    })

    return NextResponse.json({ success: true, data: leaveRequest })
  } catch (error: any) {
    console.error("Error creating leave request:", error)
    return NextResponse.json({ error: "Failed to create leave request" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const leaveRequest = await prisma.leave_requests.update({
      where: { id: parseInt(body.id) },
      data: {
        employee_id: body.employee_id,
        leave_type_id: body.leave_type_id,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        days: Math.ceil((new Date(body.end_date).getTime() - new Date(body.start_date).getTime()) / (1000 * 3600 * 24)) + 1,
        reason: body.reason || null,
        status: body.status || 'pending',
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, data: leaveRequest })
  } catch (error: any) {
    console.error("Error updating leave request:", error)
    return NextResponse.json({ error: "Failed to update leave request" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.leave_requests.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting leave request:", error)
    return NextResponse.json({ error: "Failed to delete leave request" }, { status: 500 })
  }
}