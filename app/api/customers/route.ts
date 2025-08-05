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

    const searchQuery = `WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?`
    const [rows]: any = await conn.query(
      `SELECT id, name, email, phone, address, city, country, total_sales, total_paid, total_due FROM customers 
       ${search ? searchQuery : ''}
       ORDER BY name ASC
       LIMIT ? OFFSET ?`,
      search ? [`%${search}%`, `%${search}%`, `%${search}%`, limit, offset] : [limit, offset]
    )

    const [totalRows]: any = await conn.query(
        `SELECT COUNT(*) as total FROM customers ${search ? searchQuery : ''}`,
        search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []
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
    console.error("Error fetching customers:", error)
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

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const [result]: any = await conn.query(
      "INSERT INTO customers (name, email, phone, country, city, address) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email || null, phone || null, country || null, city || null, address || null]
    )

    const [newCustomer]: any = await conn.query(
      "SELECT id, name, email, phone, address, city, country, total_sales, total_paid, total_due FROM customers WHERE id = ?",
      [result.insertId]
    )

    return NextResponse.json(newCustomer[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating customer:", error)
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

    if (!id || !name) {
      return NextResponse.json({ error: "ID and name are required" }, { status: 400 })
    }

    await conn.query(
      "UPDATE customers SET name = ?, email = ?, phone = ?, country = ?, city = ?, address = ? WHERE id = ?",
      [name, email || null, phone || null, country || null, city || null, address || null, id]
    )

    const [updatedCustomer]: any = await conn.query(
      "SELECT id, name, email, phone, address, city, country, total_sales, total_paid, total_due FROM customers WHERE id = ?",
      [id]
    )

    return NextResponse.json(updatedCustomer[0])
  } catch (error: any) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

export async function DELETE(request: NextRequest) {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 })
    }

    const [existingCustomer]: any = await conn.query("SELECT id FROM customers WHERE id = ?", [id])

    if (existingCustomer.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    await conn.query("DELETE FROM customers WHERE id = ?", [id])

    return NextResponse.json({ message: "Customer deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting customer:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}
