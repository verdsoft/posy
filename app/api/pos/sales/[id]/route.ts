import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import type { FieldPacket } from "mysql2"


// GET single sale with items
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const conn = await getConnection()
  
  try {
    // Get sale details
    const [sales]: [any[], FieldPacket[]] = await conn.query(
      `SELECT 
        s.*, 
        c.name AS customer_name, 
        w.name AS warehouse_name
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN warehouses w ON s.warehouse_id = w.id
       WHERE s.id = ?`,
      [id]
    )

    if (sales.length === 0) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 })
    }

    // Get sale items
    const [items]: [any[], FieldPacket[]] = await conn.query(
      `SELECT 
        si.*,
        p.name AS product_name,
        p.code AS product_code
       FROM sale_items si
       LEFT JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = ?`,
      [id]
    )

    return NextResponse.json({
      ...sales[0],
      items
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  } 
}

// UPDATE sale
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const conn = await getConnection()
  
  try {
    

    // Update sale
    await conn.execute(
      `UPDATE sales SET 
        reference=?, customer_id=?, warehouse_id=?, date=?, subtotal=?, 
        tax_rate=?, tax_amount=?, discount=?, shipping=?, total=?, 
        paid=?, due=?, status=?, payment_status=?, notes=?, updated_at=NOW()
       WHERE id=?`,
      [
        body.reference,
        body.customer_id,
        body.warehouse_id,
        body.date,
        body.subtotal,
        body.tax_rate,
        body.tax_amount,
        body.discount,
        body.shipping,
        body.total,
        body.paid,
        body.due,
        body.status,
        body.payment_status,
        body.notes,
        id
      ]
    )

    // Delete existing items
    await conn.execute(`DELETE FROM sale_items WHERE sale_id = ?`, [id])

    // Insert new items
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        await conn.execute(
          `INSERT INTO sale_items 
            (id, sale_id, product_id, quantity, unit_price, discount, tax, subtotal)
           VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.discount || 0,
            item.tax || 0,
            (item.unit_price * item.quantity) - (item.discount || 0) + (item.tax || 0)
          ]
        )
      }
    }

    await conn.commit()
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}