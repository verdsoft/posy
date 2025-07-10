import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { v4 as uuidv4 } from "uuid"
import { Sale } from "@/lib/types/api"
import type { FieldPacket} from "mysql2"

// CREATE (POST)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const conn = await getConnection()
  try {
    const saleId = uuidv4()
    const reference = body.reference || `SL-${Date.now()}`
    await conn.execute(
      `INSERT INTO sales 
        (id, reference, customer_id, warehouse_id, date, subtotal, tax_rate, tax_amount, discount, shipping, total, paid, due, status, payment_status, notes, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        saleId,
        reference,
        body.customer_id || null,
        body.warehouse_id || null,
        body.date,
        body.subtotal || 0,
        body.tax_rate || 0,
        body.tax_amount || 0,
        body.discount || 0,
        body.shipping || 0,
        body.total,
        body.paid || 0,
        body.due || 0,
        body.status || "completed",
        body.payment_status || "paid",
        body.notes || null,
        body.created_by || null,
      ]
    )
    // Insert sale items
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        await conn.execute(
          `INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price, discount, tax, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            saleId,
            item.id,
            item.quantity,
            item.price,
            item.discount || 0,
            item.tax || 0,
            (item.price * item.quantity) - (item.discount || 0) + (item.tax || 0)
          ]
        )
      }
    }
    
    return NextResponse.json({ success: true, saleId, reference })
  } catch (error: unknown) {
    console.error(error)
    
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


// READ ONE (GET by id)
export async function GET_ONE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  const conn = await getConnection()
  try {
    const [sales]: [Sale[], FieldPacket[]] = await conn.query<Sale[]>(
        `SELECT 
        s.*, 
        c.name AS customer_name, 
        w.name AS warehouse_name
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN warehouses w ON s.warehouse_id = w.id
       WHERE s.id = ? 
       LIMIT 1`,
        [id]
      )
    
    if (sales.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(sales[0])
  } catch (error: unknown) {
    
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// READ ALL (GET)
export async function GET() {
  const conn = await getConnection()
  try {
    const [sales]: [Sale[], FieldPacket[]] = await conn.query<Sale[]>(
      `SELECT 
        s.*, 
        c.name AS customer_name, 
        w.name AS warehouse_name
       FROM sales s
       LEFT JOIN customers c ON s.customer_id = c.id
       LEFT JOIN warehouses w ON s.warehouse_id = w.id
       ORDER BY s.created_at DESC
       LIMIT 100`
    )
    
    return NextResponse.json(sales)
  } catch (error: unknown) {
    
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


// UPDATE (PUT)
export async function PUT(req: NextRequest) {
  const body = await req.json()
  if (!body.id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const conn = await getConnection()
  try {
    await conn.execute(
      `UPDATE sales SET 
        reference=?, customer_id=?, warehouse_id=?, date=?, subtotal=?, tax_rate=?, tax_amount=?, discount=?, shipping=?, total=?, paid=?, due=?, status=?, payment_status=?, notes=?, updated_at=NOW()
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
        body.id
      ]
    )
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  const conn = await getConnection()
  try {
    await conn.execute(`DELETE FROM sales WHERE id = ?`, [id])
    
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}