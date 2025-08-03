import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

// GET: List all warehouses
export async function GET() {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const [rows]: any = await conn.query("SELECT * FROM warehouses")
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

// POST: Create a new warehouse
export async function POST(req: NextRequest) {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const { name, phone, country, city, email, zip_code } = await req.json()
    if (!name || !phone || !country || !city || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const [result]: any = await conn.execute(
      "INSERT INTO warehouses (name, phone, country, city, email, zip_code) VALUES (?, ?, ?, ?, ?, ?)",
      [name, phone, country, city, email, zip_code || ""]
    )
    const [rows]: any = await conn.query("SELECT * FROM warehouses WHERE id = ?", [result.insertId])
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

// PUT: Update a warehouse
export async function PUT(req: NextRequest) {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const { id, name, phone, country, city, email, zip_code } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    await conn.execute("UPDATE warehouses SET name=?, phone=?, country=?, city=?, email=?, zip_code=? WHERE id=?", [
      name,
      phone,
      country,
      city,
      email,
      zip_code || "",
      id,
    ])
    const [rows]: any = await conn.query("SELECT * FROM warehouses WHERE id = ?", [id])
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

// DELETE: Delete a warehouse
export async function DELETE(req: NextRequest) {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    await conn.execute("DELETE FROM warehouses WHERE id = ?", [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}
