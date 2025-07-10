import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

// GET: List all units
export async function GET() {
  try {
    const conn = await getConnection()
    const [rows]: any = await conn.query("SELECT * FROM units")
    
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a new unit
export async function POST(req: NextRequest) {
  try {
    const { name, short_name, base_unit, operator, operation_value } = await req.json()
    if (!name || !short_name || !operator || operation_value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const conn = await getConnection()
    const [result]: any = await conn.execute(
      "INSERT INTO units (name, short_name, base_unit, operator, operation_value) VALUES (?, ?, ?, ?, ?)",
      [name, short_name, base_unit || "-", operator, operation_value]
    )
    const [rows]: any = await conn.query("SELECT * FROM units WHERE id = ?", [result.insertId])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update a unit
export async function PUT(req: NextRequest) {
  try {
    const { id, name, short_name, base_unit, operator, operation_value } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const conn = await getConnection()
    await conn.execute(
      "UPDATE units SET name=?, short_name=?, base_unit=?, operator=?, operation_value=? WHERE id=?",
      [name, short_name, base_unit || "-", operator, operation_value, id]
    )
    const [rows]: any = await conn.query("SELECT * FROM units WHERE id = ?", [id])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete a unit
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const conn = await getConnection()
    await conn.execute("DELETE FROM units WHERE id = ?", [id])
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}