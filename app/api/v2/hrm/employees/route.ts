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
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
        { position: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    const [employees, total] = await Promise.all([
      prisma.employees.findMany({
        where: whereCondition,
        include: {
          departments: {
            select: { id: true, name: true }
          },
          office_shifts: {
            select: { id: true, name: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.employees.count({
        where: whereCondition
      })
    ])

    return NextResponse.json({
      data: employees,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching employees:", error)
    return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const employee = await prisma.employees.create({
      data: {
        employee_id: body.employee_id,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        department_id: body.department_id,
        shift_id: body.shift_id,
        position: body.position || null,
        salary: body.salary ? parseFloat(body.salary) : null,
        hire_date: body.hire_date ? new Date(body.hire_date) : null,
        address: body.address || null,
        status: body.status || 'active'
      }
    })

    return NextResponse.json({ success: true, data: employee })
  } catch (error: any) {
    console.error("Error creating employee:", error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const employee = await prisma.employees.update({
      where: { id: parseInt(body.id) },
      data: {
        employee_id: body.employee_id,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        department_id: body.department_id,
        shift_id: body.shift_id,
        position: body.position || null,
        salary: body.salary ? parseFloat(body.salary) : null,
        hire_date: body.hire_date ? new Date(body.hire_date) : null,
        address: body.address || null,
        status: body.status || 'active',
        updated_at: new Date()
      }
    })

    return NextResponse.json({ success: true, data: employee })
  } catch (error: any) {
    console.error("Error updating employee:", error)
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.employees.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting employee:", error)
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 })
  }
}