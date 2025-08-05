import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

export async function GET(req: NextRequest) {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const offset = (page - 1) * limit

    let whereClause = ""
    let queryParams: any[] = []
    
    if (search) {
      whereClause = "WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?"
      queryParams = [`%${search}%`, `%${search}%`, `%${search}%`]
    }

    const [rows]: any = await conn.query(
      `SELECT id, name, email, phone, country, city, address FROM suppliers 
       ${whereClause}
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    )

    const [totalRows]: any = await conn.query(
        `SELECT COUNT(*) as total FROM suppliers ${whereClause}`,
        queryParams
    );

    return NextResponse.json({
        data: rows,
        pagination: {
            total: totalRows[0].total,
            page,
            limit,
            totalPages: Math.ceil(totalRows[0].total / limit),
        },
    });
  } catch (error: any) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

export async function POST(request: NextRequest) {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const body = await request.json()
    const { name, email, phone, country, city, address } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    const [result]: any = await conn.query(
      "INSERT INTO suppliers (name, email, phone, country, city, address) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, phone || null, country || null, city || null, address || null]
    )

    const [newSupplier]: any = await conn.query(
      "SELECT id, name, email, phone, country, city, address FROM suppliers WHERE id = ?",
      [result.insertId]
    )

    return NextResponse.json(newSupplier[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating supplier:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

export async function PUT(request: NextRequest) {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const body = await request.json()
    const { id, name, email, phone, country, city, address } = body

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "ID, name and email are required" },
        { status: 400 }
      )
    }

    await conn.query(
      "UPDATE suppliers SET name = ?, email = ?, phone = ?, country = ?, city = ?, address = ? WHERE id = ?",
      [name, email, phone || null, country || null, city || null, address || null, id]
    )

    const [updatedSupplier]: any = await conn.query(
      "SELECT id, name, email, phone, country, city, address FROM suppliers WHERE id = ?",
      [id]
    )

    return NextResponse.json(updatedSupplier[0])
  } catch (error: any) {
    console.error("Error updating supplier:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

export async function DELETE(request: NextRequest) {
  const conn = await getConnection()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      )
    }

    // Check if supplier exists
    const [existingSupplier]: any = await conn.query(
      "SELECT id FROM suppliers WHERE id = ?",
      [id]
    )

    if (existingSupplier.length === 0) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      )
    }

    await conn.query("DELETE FROM suppliers WHERE id = ?", [id])

    return NextResponse.json({ message: "Supplier deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting supplier:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } 
}