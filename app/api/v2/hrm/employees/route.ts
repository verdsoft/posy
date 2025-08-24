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

    const where = search ? "WHERE CONCAT_WS(' ', first_name, last_name, email, phone) LIKE ?" : ""
    const params = search ? [`%${search}%`, limit, offset] : [limit, offset]

    // Fall back to SELECT * to avoid column mismatch if schema differs
    const [rows]: any = await conn.query(
      `SELECT * FROM employees ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      params
    )

    const [totalRows]: any = await conn.query(
      `SELECT COUNT(*) as total FROM employees ${search ? where : ''}`,
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
    // If table doesn't exist or any other error, return empty structure so UI still works
    return NextResponse.json({
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      warning: "Employees table not available or query failed.",
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
    const {
      first_name, last_name, email, phone,
      company_id, department_id, designation, shift_id
    } = body
    await conn.query(
      `INSERT INTO employees (first_name, last_name, email, phone, company_id, department_id, designation, shift_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [first_name || null, last_name || null, email || null, phone || null, company_id || null, department_id || null, designation || null, shift_id || null]
    )
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
      `UPDATE employees SET first_name=?, last_name=?, email=?, phone=?, company_id=?, department_id=?, designation=?, shift_id=?, updated_at=NOW() WHERE id=?`,
      [body.first_name || null, body.last_name || null, body.email || null, body.phone || null, body.company_id || null, body.department_id || null, body.designation || null, body.shift_id || null, id]
    )
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
    await conn.query(`DELETE FROM employees WHERE id = ?`, [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}


