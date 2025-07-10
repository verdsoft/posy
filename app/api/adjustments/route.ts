// app/api/adjustments/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { Adjustment, AdjustmentItem } from "@/lib/types"

export async function POST(req: NextRequest) {
  try {
    const connection = await getConnection()
    const body = await req.json()

    // Validate required fields
    if (!body.warehouse_id || !body.date || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    await connection.beginTransaction()

    try {
      // Generate a reference number (you might want to customize this)
      const reference = `ADJ-${Date.now().toString().slice(-6)}`
      const adjustment_id = crypto.randomUUID(); // <-- Move this line up

      // Insert adjustment
      const [adjustmentResult] = await connection.execute(
        `INSERT INTO adjustments 
         (reference, id, warehouse_id, date, type, notes, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          reference,
          adjustment_id, // Now this is defined!
          body.warehouse_id, // ✅ goes into warehouse_id column
          body.date,
          body.type || 'addition', // Default to addition if not specified
          body.notes || null,
        ]
      )

      // Process each item
      for (const item of body.items) {
        // Update product stock based on adjustment type
        const stockChange = item.type === "addition" ? item.quantity : -item.quantity
        await connection.execute(
          `UPDATE products SET stock = stock + ? WHERE id = ?`,
          [stockChange, item.product_id]
        )

        // Insert adjustment item
        await connection.execute(
          `INSERT INTO adjustment_items 
           (adjustment_id, product_id, quantity, type, created_at) 
           VALUES (?, ?, ?, ?, NOW())`,
          [adjustment_id, item.product_id, item.quantity, item.type]
        )
      }

      await connection.commit()

      return NextResponse.json(
        { success: true, adjustment_id, reference },
        { status: 201 }
      )
    } catch (error) {
      await connection.rollback()
      throw error
    }
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
    const offset = (page - 1) * limit

    const connection = await getConnection()

    let baseQuery = `
      SELECT 
        a.id, a.reference, a.warehouse_id, a.date, a.type, a.notes,
        a.created_at, a.updated_at,
        w.name AS warehouse_name,
        COUNT(ai.id) AS item_count
      FROM adjustments a
      JOIN warehouses w ON a.warehouse_id = w.id
      LEFT JOIN adjustment_items ai ON a.id = ai.adjustment_id
    `
    let countQuery = `SELECT COUNT(*) as total FROM adjustments a`
    const queryParams: (string | number)[] = []
    const countParams: (string | number)[] = []

    if (warehouse_id) {
      baseQuery += " WHERE a.warehouse_id = ?"
      countQuery += " WHERE a.warehouse_id = ?"
      queryParams.push(warehouse_id)
      countParams.push(warehouse_id)
    }

    if (date) {
      baseQuery += warehouse_id ? " AND a.date = ?" : " WHERE a.date = ?"
      countQuery += warehouse_id ? " AND a.date = ?" : " WHERE a.date = ?"
      queryParams.push(date)
      countParams.push(date)
    }

    baseQuery += ` GROUP BY a.id ORDER BY a.date DESC, a.id DESC LIMIT ${Number(limit)} OFFSET ${Number(offset)}`

    const [adjustments] = await connection.execute(baseQuery, queryParams)
    const [countResult] = await connection.execute(countQuery, countParams)
    const total = (countResult as any)[0].total

    return NextResponse.json({
      data: adjustments,
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