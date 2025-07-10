import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const conn = await getConnection()
  try {
    // Insert quotation
    const [quotationResult]: any = await conn.execute(
      `INSERT INTO quotations 
        (date, warehouse_id, customer_id, order_tax, discount, shipping, status, note, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        body.date,
        body.warehouse_id,
        body.customer_id,
        body.order_tax,
        body.discount,
        body.shipping,
        body.status,
        body.note,
      ]
    )
    const quotationId = quotationResult.insertId

    // Insert quotation items
    for (const item of body.items) {
      await conn.execute(
        `INSERT INTO quotation_items 
          (quotation_id, product_id, name, code, price, quantity, discount, tax, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quotationId,
          item.id,
          item.name,
          item.code,
          item.price,
          item.quantity,
          item.discount,
          item.tax,
          item.price * item.quantity - item.discount + item.tax,
        ]
      )
    }

    
    return NextResponse.json({ success: true, id: quotationId })
  } catch (error: any) {
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// (Optional) GET: List quotations
export async function GET() {
  const conn = await getConnection()
  try {
    const [rows]: any = await conn.query(
      `SELECT q.id, q.date, c.name as customer_name, w.name as warehouse_name, q.status, q.discount, q.order_tax, q.shipping, q.note, q.created_at
       FROM quotations q
       JOIN customers c ON q.customer_id = c.id
       JOIN warehouses w ON q.warehouse_id = w.id
       ORDER BY q.created_at DESC
       LIMIT 100`
    )
    
    return NextResponse.json(rows)
  } catch (error: any) {
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}