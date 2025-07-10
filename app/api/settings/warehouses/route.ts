import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

// GET: List all warehouses
export async function GET() {
  try {
    const conn = await getConnection()
    const [rows]: any = await conn.query("SELECT * FROM warehouses")
    
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a new warehouse
export async function POST(req: NextRequest) {
  try {
    const { name, phone, country, city, email, zip_code } = await req.json()
    if (!name || !phone || !country || !city || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const conn = await getConnection()
    const [result]: any = await conn.execute(
      "INSERT INTO warehouses (name, phone, country, city, email, zip_code) VALUES (?, ?, ?, ?, ?, ?)",
      [name, phone, country, city, email, zip_code || ""]
    )
    const [rows]: any = await conn.query("SELECT * FROM warehouses WHERE id = ?", [result.insertId])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update a warehouse
export async function PUT(req: NextRequest) {
  try {
    const { id, name, phone, country, city, email, zip_code } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const conn = await getConnection()
    await conn.execute(
      "UPDATE warehouses SET name=?, phone=?, country=?, city=?, email=?, zip_code=? WHERE id=?",
      [name, phone, country, city, email, zip_code || "", id]
    )
    const [rows]: any = await conn.query("SELECT * FROM warehouses WHERE id = ?", [id])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete a warehouse
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const conn = await getConnection()
    await conn.execute("DELETE FROM warehouses WHERE id = ?", [id])
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}