import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (id) {
      const transfer = await prisma.transfers.findUnique({
        where: { id: parseInt(id) },
        include: {
          warehouses_transfers_from_warehouse_idTowarehouses: {
            select: { id: true, name: true }
          },
          warehouses_transfers_to_warehouse_idTowarehouses: {
            select: { id: true, name: true }
          },
          transfer_items: {
            include: {
              products: {
                select: { id: true, name: true, code: true, cost: true }
              }
            }
          }
        }
      })
      if (!transfer) {
        return NextResponse.json({ error: "Transfer not found" }, { status: 404 })
      }
      const formattedTransfer = {
        ...transfer,
        from_warehouse: transfer.warehouses_transfers_from_warehouse_idTowarehouses,
        to_warehouse: transfer.warehouses_transfers_to_warehouse_idTowarehouses,
      }
      return NextResponse.json(formattedTransfer)
    }

    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const search = (searchParams.get("search") || "").trim()
    const offset = (page - 1) * limit

    const whereCondition = search ? {
      OR: [
        { reference: { contains: search, mode: 'insensitive' as const } },
        { warehouses_transfers_from_warehouse_idTowarehouses: { name: { contains: search, mode: 'insensitive' as const } } },
        { warehouses_transfers_to_warehouse_idTowarehouses: { name: { contains: search, mode: 'insensitive' as const } } }
      ]
    } : {}

    const [transfers, total] = await Promise.all([
      prisma.transfers.findMany({
        where: whereCondition,
        include: {
          warehouses_transfers_from_warehouse_idTowarehouses: {
            select: { id: true, name: true }
          },
          warehouses_transfers_to_warehouse_idTowarehouses: {
            select: { id: true, name: true }
          },
          transfer_items: {
            include: {
              products: {
                select: { id: true, name: true, code: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.transfers.count({
        where: whereCondition
      })
    ])

    const formattedTransfers = transfers.map(t => ({
      ...t,
      from_warehouse: t.warehouses_transfers_from_warehouse_idTowarehouses,
      to_warehouse: t.warehouses_transfers_to_warehouse_idTowarehouses,
    }))

    return NextResponse.json({
      data: formattedTransfers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching transfers:", error)
    return NextResponse.json({
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Ensure we have a valid user ID
    let validUserId = body.user_id ? parseInt(body.user_id.toString()) : null
    if (!validUserId) {
      // Try to find the first admin user
      const adminUser = await prisma.users.findFirst({
        where: { role: 'admin' }
      })
      if (adminUser) {
        validUserId = adminUser.id
      } else {
        // If no admin user exists, try to find any user
        const anyUser = await prisma.users.findFirst()
        if (anyUser) {
          validUserId = anyUser.id
        } else {
          return NextResponse.json(
            { error: 'No valid user found. Please ensure at least one user exists in the system.' },
            { status: 400 }
          )
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create transfer
      const transfer = await tx.transfers.create({
        data: {
          reference: body.reference || `TR-${Date.now()}`,
          warehouses_transfers_from_warehouse_idTowarehouses: {
            connect: { id: parseInt(body.from_warehouse_id) }
          },
          warehouses_transfers_to_warehouse_idTowarehouses: {
            connect: { id: parseInt(body.to_warehouse_id) }
          },
          date: new Date(body.date),
          subtotal: parseFloat(body.subtotal || 0),
          tax_rate: parseFloat(body.tax_rate || 0),
          tax_amount: parseFloat(body.tax_amount || 0),
          discount: parseFloat(body.discount || 0),
          shipping: parseFloat(body.shipping || 0),
          total: parseFloat(body.total || 0),
          status: body.status || 'pending',
          notes: body.notes || null,
          users: {
            connect: { id: validUserId }
          }
        }
      })

      // Create transfer items
      if (body.items && Array.isArray(body.items)) {
        for (const item of body.items) {
          await tx.transfer_items.create({
            data: {
              transfer_id: transfer.id,
              product_id: item.product_id,
              quantity: parseFloat(item.quantity),
              unit_cost: parseFloat(item.net_unit_cost || item.unit_cost || 0),
              discount: parseFloat(item.discount || 0),
              tax: parseFloat(item.tax || 0),
              subtotal: parseFloat(item.subtotal)
            }
          })
        }
      }

      return transfer
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Error creating transfer:", error)
    return NextResponse.json({ error: error.message || "Failed to create transfer" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const result = await prisma.$transaction(async (tx) => {
      // Update transfer
      const transfer = await tx.transfers.update({
        where: { id: parseInt(body.id) },
        data: {
          reference: body.reference,
          from_warehouse_id: body.from_warehouse_id,
          to_warehouse_id: body.to_warehouse_id,
          date: new Date(body.date),
          subtotal: parseFloat(body.subtotal || 0),
          tax_rate: parseFloat(body.tax_rate || 0),
          tax_amount: parseFloat(body.tax_amount || 0),
          discount: parseFloat(body.discount || 0),
          shipping: parseFloat(body.shipping || 0),
          total: parseFloat(body.total || 0),
          status: body.status || 'pending',
          notes: body.notes || null,
          updated_at: new Date()
        }
      })

      // Delete existing items and create new ones
      if (body.items && Array.isArray(body.items)) {
        await tx.transfer_items.deleteMany({
          where: { transfer_id: transfer.id }
        })

        for (const item of body.items) {
          await tx.transfer_items.create({
            data: {
              transfer_id: transfer.id,
              product_id: item.product_id,
              quantity: parseFloat(item.quantity),
              unit_cost: parseFloat(item.net_unit_cost || item.unit_cost || 0),
              discount: parseFloat(item.discount || 0),
              tax: parseFloat(item.tax || 0),
              subtotal: parseFloat(item.subtotal)
            }
          })
        }
      }

      return transfer
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Error updating transfer:", error)
    return NextResponse.json({ error: "Failed to update transfer" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.$transaction(async (tx) => {
      // Delete transfer items first
      await tx.transfer_items.deleteMany({
        where: { transfer_id: parseInt(id) }
      })

      // Delete transfer
      await tx.transfers.delete({
        where: { id: parseInt(id) }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting transfer:", error)
    return NextResponse.json({ error: "Failed to delete transfer" }, { status: 500 })
  }
}