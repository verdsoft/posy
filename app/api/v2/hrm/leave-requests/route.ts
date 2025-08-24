import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

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

    const where = search ? "WHERE employee_name LIKE ? OR leave_type LIKE ?" : ""
    const params = search ? [`%${search}%`, `%${search}%`, limit, offset] : [limit, offset]

    const [rows]: any = await conn.query(
      `SELECT * FROM leave_requests ${where} ORDER BY start_date DESC LIMIT ? OFFSET ?`,
      params
    )

    const [totalRows]: any = await conn.query(
      `SELECT COUNT(*) as total FROM leave_requests ${search ? where : ''}`,
      search ? [`%${search}%`, `%${search}%`] : []
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
  } catch {
    return NextResponse.json({ data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } })
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
    await conn.query(
      `INSERT INTO leave_requests (employee_name, company_id, department_id, leave_type, start_date, finish_date, reason, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [body.employee_name || null, body.company_id || null, body.department_id || null, body.leave_type || null, body.start_date || null, body.finish_date || null, body.reason || null, body.status || 'pending']
    )
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
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
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    await conn.query(
      `UPDATE leave_requests SET employee_name=?, company_id=?, department_id=?, leave_type=?, start_date=?, finish_date=?, reason=?, status=?, updated_at=NOW() WHERE id=?`,
      [body.employee_name || null, body.company_id || null, body.department_id || null, body.leave_type || null, body.start_date || null, body.finish_date || null, body.reason || null, body.status || 'pending', body.id]
    )
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
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
    await conn.query(`DELETE FROM leave_requests WHERE id = ?`, [id])
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}


