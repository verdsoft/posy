import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { v4 as uuidv4 } from "uuid"
import type { FieldPacket } from "mysql2"

// CREATE (POST)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const conn = await getConnection()
  
  try {
    
    
    const returnId = uuidv4()
    const reference = body.reference || `SR-${Date.now()}`
    
    // Create sales return
    await conn.execute(
      `INSERT INTO sales_returns 
        (id, reference, sale_id, customer_id, warehouse_id, date, 
         subtotal, tax_rate, tax_amount, discount, shipping, total, 
         status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        returnId,
        reference,
        body.sale_id,
        body.customer_id,
        body.warehouse_id,
        body.date,
        body.subtotal || 0,
        body.tax_rate || 0,
        body.tax_amount || 0,
        body.discount || 0,
        body.shipping || 0,
        body.total,
        body.status || "completed",
        body.notes || null
      ]
    )
    
    // Create return items
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        await conn.execute(
          `INSERT INTO sales_return_items 
            (id, return_id, product_id, sale_item_id, quantity, 
             unit_price, discount, tax, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            returnId,
            item.product_id,
            item.sale_item_id,
            item.quantity,
            item.unit_price,
            item.discount || 0,
            item.tax || 0,
            item.subtotal
          ]
        )
        
        // Update product stock
        await conn.execute(
          `UPDATE products 
           SET quantity = quantity + ? 
           WHERE id = ?`,
          [item.quantity, item.product_id]
        )
      }
    }
    
    await conn.commit()
    return NextResponse.json({ success: true, returnId, reference })
  } catch (error: unknown) {
    
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  } 
}

// READ ALL (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  
  const offset = (page - 1) * limit
  const conn = await getConnection()
  
  try {
    // Get sales returns
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
       WHERE sr.reference LIKE ? OR c.name LIKE ? OR s.reference LIKE ?
       ORDER BY sr.created_at DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`, limit, offset]
    )

    // Get total count for pagination
    const [totalRows]: any[] = await conn.query(
      `SELECT COUNT(*) as total 
       FROM sales_returns sr
       LEFT JOIN customers c ON sr.customer_id = c.id
       LEFT JOIN sales s ON sr.sale_id = s.id
       WHERE sr.reference LIKE ? OR c.name LIKE ? OR s.reference LIKE ?`,
      [`%${search}%`, `%${search}%`, `%${search}%`]
    )
    
    return NextResponse.json({
      data: returns,
      pagination: {
        total: totalRows[0].total,
        page,
        limit,
        totalPages: Math.ceil(totalRows[0].total / limit)
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}