// app/api/adjustments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate required fields
    if (!body.warehouse_id || !body.date || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Generate a reference number
    const reference = `ADJ-${Date.now().toString().slice(-6)}`

    const result = await prisma.$transaction(async (tx) => {
      // Create adjustment
      const adjustment = await tx.adjustments.create({
        data: {
          reference,
          warehouse_id: parseInt(body.warehouse_id),
          date: new Date(body.date),
          type: body.type || 'addition',
          notes: body.notes || null,
          created_by: 1, // TODO: Get from auth session
        }
      })

      // Process each item
      for (const item of body.items) {
        // Update product stock based on adjustment type
        const stockChange = item.type === "addition" ? item.quantity : -item.quantity
        await tx.products.update({
          where: { id: parseInt(item.product_id) },
          data: {
            stock: {
              increment: stockChange
            }
          }
        })

        // Create adjustment item
        await tx.adjustment_items.create({
          data: {
            adjustment_id: adjustment.id,
            product_id: parseInt(item.product_id),
            quantity: item.quantity,
            type: item.type,
            pre_stock: item.currentStock?.toString() || "0"
          }
        })
      }

      return adjustment
    })

    return NextResponse.json(
      { success: true, adjustment_id: result.id, reference: result.reference },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating adjustment:", error)
    return NextResponse.json(
      { error: "Failed to create adjustment" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const warehouse_id = searchParams.get("warehouse_id")
    const date = searchParams.get("date")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where = {
      ...(warehouse_id && { warehouse_id: parseInt(warehouse_id) }),
      ...(date && { date: new Date(date) }),
    }

    const [adjustments, total] = await Promise.all([
      prisma.adjustments.findMany({
        where,
        include: {
          warehouses: {
            select: { name: true }
          },
          adjustment_items: {
            select: { id: true }
          }
        },
        orderBy: [
          { date: 'desc' },
          { id: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.adjustments.count({ where })
    ])

    const adjList = adjustments.map(a => ({
      id: a.id,
      reference: a.reference,
      warehouse_id: a.warehouse_id,
      date: a.date,
      type: a.type,
      notes: a.notes,
      created_by: a.created_by,
      created_at: a.created_at,
      updated_at: a.updated_at,
      warehouse_name: a.warehouses.name,
      item_count: a.adjustment_items.length
    }))

    return NextResponse.json({
      data: adjList,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching adjustments:", error)
    return NextResponse.json(
      { error: "Failed to fetch adjustments" },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing adjustment id" }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      // Delete adjustment items first (foreign key constraint)
      await tx.adjustment_items.deleteMany({
        where: { adjustment_id: parseInt(id) }
      })

      // Then delete the adjustment
      await tx.adjustments.delete({
        where: { id: parseInt(id) }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting adjustment:", error)
    return NextResponse.json({ error: "Failed to delete adjustment" }, { status: 500 })
  }
}