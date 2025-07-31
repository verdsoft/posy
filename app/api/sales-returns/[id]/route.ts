import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import type { FieldPacket } from "mysql2"

// GET single sales return
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const conn = await getConnection()
  
  try {
    // Get return details
    const [returns]: [any[], FieldPacket[]] = await conn.query(
      `SELECT 
        sr.*,
        c.name AS customer_name,
        w.name AS warehouse_name,
        s.reference AS sale_reference
       FROM sales_returns sr
       LEFT JOIN customers c ON sr.customer_id = c.id
       LEFT JOIN warehouses w ON sr.warehouse_id = w.id
       LEFT JOIN sales s ON sr.sale_id = s.id
       WHERE sr.id = ?`,
      [id]
    )

    if (returns.length === 0) {
      return NextResponse.json({ error: "Sales return not found" }, { status: 404 })
    }

    // Get return items
    const [items]: [any[], FieldPacket[]] = await conn.query(
      `SELECT 
        sri.*,
        p.name AS product_name,
        p.code AS product_code
       FROM sales_return_items sri
       LEFT JOIN products p ON sri.product_id = p.id
       WHERE sri.return_id = ?`,
      [id]
    )

    return NextResponse.json({
      ...returns[0],
      items
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE sales return
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params
  const conn = await getConnection()
  
  try {
    
    
    // Get items to restore stock
    const [items]: [any[], FieldPacket[]] = await conn.query(
      `SELECT product_id, quantity FROM sales_return_items WHERE return_id = ?`,
      [id]
    )
    
    // Restore product stock
    for (const item of items) {
      await conn.execute(
        `UPDATE products 
         SET quantity = quantity - ? 
         WHERE id = ?`,
        [item.quantity, item.product_id]
      )
    }
    
    // Delete return items
    await conn.execute(`DELETE FROM sales_return_items WHERE return_id = ?`, [id])
    
    // Delete return
    await conn.execute(`DELETE FROM sales_returns WHERE id = ?`, [id])
    
    await conn.commit()
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  } 
}