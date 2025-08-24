import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { v4 as uuidv4 } from "uuid"

export async function GET(req: NextRequest) {
  const pool = getConnection()
  let conn: any
  try {
    conn = await pool.getConnection()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const search = (searchParams.get("search") || "").trim()
    const offset = (page - 1) * limit

    const where = search ? "WHERE reference LIKE ?" : ""
    const params = search ? [`%${search}%`, limit, offset] : [limit, offset]

    const [rows]: any = await conn.query(
      `SELECT * FROM transfers ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      params
    )

    const [totalRows]: any = await conn.query(
      `SELECT COUNT(*) as total FROM transfers ${search ? where : ''}`,
      search ? [`%${search}%`] : []
    )

    return NextResponse.json({
      data: rows,
      pagination: {
        total: totalRows[0]?.total || 0,
        page,
        limit,
        totalPages: Math.ceil((totalRows[0]?.total || 0) / limit),
      },
    })
  } catch (error) {
    return NextResponse.json({
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      warning: "Transfers table not available or query failed.",
    })
  } finally {
    if (conn) conn.release()
  }
}

export async function POST(req: NextRequest) {
  const pool = getConnection()
  let conn: any
  try {
    conn = await pool.getConnection()
    const body = await req.json()

    const id = uuidv4()
    const reference = body.reference || `TR-${Date.now()}`
    const from_warehouse_id = body.from_warehouse_id || body.fromWarehouseId
    const to_warehouse_id = body.to_warehouse_id || body.toWarehouseId
    const date = body.date
    const notes = body.notes || null
    const status = body.status || 'pending'

    await conn.query(
      `INSERT INTO transfers (id, reference, from_warehouse_id, to_warehouse_id, date, status, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [id, reference, from_warehouse_id, to_warehouse_id, date, status, notes]
    )

    const items = Array.isArray(body.items) ? body.items : []
    for (const item of items) {
      await conn.query(
        `INSERT INTO transfer_items (id, transfer_id, product_id, quantity, cost, created_at)
         VALUES (UUID(), ?, ?, ?, ?, NOW())`,
        [id, item.product_id, item.quantity || 0, item.cost || 0]
      )
    }

    return NextResponse.json({ success: true, id, reference })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

export async function PUT(req: NextRequest) {
  const pool = getConnection()
  let conn: any
  try {
    conn = await pool.getConnection()
    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await conn.query(
      `UPDATE transfers SET reference=?, from_warehouse_id=?, to_warehouse_id=?, date=?, status=?, notes=?, updated_at=NOW() WHERE id=?`,
      [body.reference || null, body.from_warehouse_id || null, body.to_warehouse_id || null, body.date || null, body.status || 'pending', body.notes || null, id]
    )
    // For brevity, not updating items here. Can add if needed.
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

export async function DELETE(req: NextRequest) {
  const pool = getConnection()
  let conn: any
  try {
    conn = await pool.getConnection()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await conn.query(`DELETE FROM transfer_items WHERE transfer_id = ?`, [id])
    await conn.query(`DELETE FROM transfers WHERE id = ?`, [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}


