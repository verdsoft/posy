import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

export async function GET(
  req: NextRequest,
  context: any
) {
  let connection: any
  try {
    const { id } = await context.params
    connection = await getConnection()

    const [adjustments] = await connection.execute(
      `SELECT 
        a.*, 
        w.name AS warehouse_name
       FROM adjustments a
       JOIN warehouses w ON a.warehouse_id = w.id
       WHERE a.id = ?`,
      [id]
    )

    if ((adjustments as any[]).length === 0) {
      return NextResponse.json({ error: "Adjustment not found" }, { status: 404 })
    }

    const [items] = await connection.execute(
      `SELECT 
        ai.*,
        p.code AS product_code,
        p.name AS product_name,
        u.name AS unit_name
       FROM adjustment_items ai
       JOIN products p ON ai.product_id = p.id
       LEFT JOIN units u ON p.unit_id = u.id
       WHERE ai.adjustment_id = ?`,
      [id]
    )

    return NextResponse.json({
      ...(adjustments as any[])[0],
      item_count: (items as any[]).length,
      items
    })
  } catch (error) {
    console.error("[v2] Error fetching adjustment:", error)
    return NextResponse.json({ error: "Failed to fetch adjustment" }, { status: 500 })
  } finally {
    try { connection?.release?.() } catch {}
  }
}

export async function PUT(req: NextRequest, context: any) {
  let connection: any
  try {
    const { id } = await context.params
    const body = await req.json()

    connection = await getConnection()

    // Load existing items to revert stock
    const [existingItems] = await connection.execute(
      `SELECT product_id, quantity, type FROM adjustment_items WHERE adjustment_id = ?`,
      [id]
    )

    // Revert stock changes from existing items
    for (const item of existingItems as any[]) {
      const revertChange = item.type === 'addition' ? -Number(item.quantity) : Number(item.quantity)
      await connection.execute(`UPDATE products SET stock = COALESCE(stock, 0) + ? WHERE id = ?`, [revertChange, item.product_id])
    }

    // Delete existing items
    await connection.execute(`DELETE FROM adjustment_items WHERE adjustment_id = ?`, [id])

    // Update header
    await connection.execute(
      `UPDATE adjustments SET warehouse_id = ?, date = ?, type = ?, notes = ?, updated_at = NOW() WHERE id = ?`,
      [body.warehouse_id, body.date, body.type || 'addition', body.notes || null, id]
    )

    // Apply new items and update stock
    for (const item of body.items || []) {
      const stockChange = item.type === 'addition' ? Number(item.quantity) : -Number(item.quantity)
      await connection.execute(`UPDATE products SET stock = COALESCE(stock, 0) + ? WHERE id = ?`, [stockChange, item.product_id])
      await connection.execute(
        `INSERT INTO adjustment_items (adjustment_id, product_id, quantity, type, created_at) VALUES (?, ?, ?, ?, NOW())`,
        [id, item.product_id, item.quantity, item.type]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v2] Error updating adjustment:", error)
    return NextResponse.json({ error: "Failed to update adjustment" }, { status: 500 })
  } finally {
    try { connection?.release?.() } catch {}
  }
}


