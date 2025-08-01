import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import type { FieldPacket } from "mysql2"

// GET: Get a single purchase return with items
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const conn = await getConnection()
  
  try {
    // Get purchase return details
    const [returns]: [any[], FieldPacket[]] = await conn.query(
      `SELECT 
        pr.*,
        s.name AS supplier_name,
        w.name AS warehouse_name,
        p.reference AS purchase_reference
       FROM purchase_returns pr
       LEFT JOIN suppliers s ON pr.supplier_id = s.id
       LEFT JOIN warehouses w ON pr.warehouse_id = w.id
       LEFT JOIN purchases p ON pr.purchase_id = p.id
       WHERE pr.id = ?`,
      [id]
    )
    
    if (returns.length === 0) {
      return NextResponse.json({ error: "Purchase return not found" }, { status: 404 })
    }
    
    // Get return items
    const [items]: [any[], FieldPacket[]] = await conn.query(
      `SELECT 
        pri.*,
        p.name AS product_name,
        p.code AS product_code
       FROM purchase_return_items pri
       LEFT JOIN products p ON pri.product_id = p.id
       WHERE pri.return_id = ?`,
      [id]
    )
    
    return NextResponse.json({ ...returns[0], items })
  } catch (error: unknown) {
    console.error('Purchase return fetch error:', error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PUT: Update a purchase return
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const conn = await getConnection()
  
  try {
    // Update purchase return
    await conn.execute(
      `UPDATE purchase_returns 
       SET supplier_id = ?, warehouse_id = ?, date = ?, subtotal = ?, 
           tax_rate = ?, tax_amount = ?, discount = ?, shipping = ?, 
           total = ?, status = ?, notes = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        body.supplier_id,
        body.warehouse_id,
        body.date,
        body.subtotal || 0,
        body.tax_rate || 0,
        body.tax_amount || 0,
        body.discount || 0,
        body.shipping || 0,
        body.total,
        body.status || "completed",
        body.notes || null,
        id
      ]
    )
    
    // Delete existing items
    await conn.execute(
      `DELETE FROM purchase_return_items WHERE return_id = ?`,
      [id]
    )
    
    // Insert new items
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        await conn.execute(
          `INSERT INTO purchase_return_items 
            (id, return_id, product_id, purchase_item_id, quantity, 
             unit_cost, discount, tax, subtotal)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            item.product_id,
            item.purchase_item_id || null,
            item.quantity,
            item.unit_cost,
            item.discount || 0,
            item.tax || 0,
            item.subtotal
          ]
        )
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Purchase return update error:', error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE: Delete a purchase return
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const conn = await getConnection()
  
  try {
    // Delete return items first
    await conn.execute(
      `DELETE FROM purchase_return_items WHERE return_id = ?`,
      [id]
    )
    
    // Delete purchase return
    await conn.execute(
      `DELETE FROM purchase_returns WHERE id = ?`,
      [id]
    )
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Purchase return delete error:', error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}