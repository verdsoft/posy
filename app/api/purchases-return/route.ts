import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/mysql";
import { v4 as uuidv4 } from "uuid";
import type { FieldPacket } from "mysql2";

// GET: List all purchase returns
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")
  
  const offset = (page - 1) * limit
  const pool = getConnection()
  let conn
  
  try {
    conn = await pool.getConnection()
    const searchQuery = `WHERE pr.reference LIKE ? OR s.name LIKE ? OR p.reference LIKE ?`
    // Get purchase returns
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
       ${search ? searchQuery : ''}
       ORDER BY pr.created_at DESC
       LIMIT ? OFFSET ?`,
      search ? [`%${search}%`, `%${search}%`, `%${search}%`, limit, offset] : [limit, offset]
    )

    // Get total count for pagination
    const [totalRows]: [any[], FieldPacket[]] = await conn.query(
      `SELECT COUNT(*) as total 
       FROM purchase_returns pr
       LEFT JOIN suppliers s ON pr.supplier_id = s.id
       LEFT JOIN purchases p ON pr.purchase_id = p.id
       ${search ? searchQuery : ''}`,
      search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []
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
  } finally {
    if (conn) conn.release()
  }
}

// POST: Create a new purchase return
export async function POST(req: NextRequest) {
  const body = await req.json();
  const pool = getConnection();
  let conn;
  
  try {
    conn = await pool.getConnection();
    const returnId = uuidv4()
    const reference = body.reference || `PR-${Date.now()}`
    
    // Create purchase return
    await conn.execute(
      `INSERT INTO purchase_returns 
        (id, reference, purchase_id, supplier_id, warehouse_id, date, 
         subtotal, tax_rate, tax_amount, discount, shipping, total, 
         status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        returnId,
        reference,
        body.purchase_id,
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
        body.notes || null
      ]
    )
    
    // Create return items
    if (Array.isArray(body.items)) {
      for (const item of body.items) {
        await conn.execute(
          `INSERT INTO purchase_return_items 
            (id, return_id, product_id, purchase_item_id, quantity, 
             unit_cost, discount, tax, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            returnId,
            item.product_id,
            item.purchase_item_id || null,
            item.quantity,
            item.unit_cost,
            item.discount || 0,
            item.tax || 0,
            item.subtotal
          ]
        )
        
        // Update product stock (subtract from warehouse)
        await conn.execute(
          `UPDATE products 
           SET stock = stock - ? 
           WHERE id = ?`,
          [item.quantity, item.product_id]
        )
      }
    }
    
    return NextResponse.json({ success: true, returnId, reference })
  } catch (error: unknown) {
    console.error('Purchase return creation error:', error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}