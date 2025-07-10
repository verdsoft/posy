import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

// GET: List all brands
export async function GET() {
  try {
    const conn = await getConnection()
    const [rows]: any = await conn.query("SELECT * FROM brands")
    
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a new brand
export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json()
    if (!name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const conn = await getConnection()
    const [result]: any = await conn.execute(
      "INSERT INTO brands (name, description) VALUES (?, ?)",
      [name, description || ""]
    )
    const [rows]: any = await conn.query("SELECT * FROM brands WHERE id = ?", [result.insertId])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update a brand
export async function PUT(req: NextRequest) {
  try {
    const { id, name, description } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const conn = await getConnection()
    await conn.execute(
      "UPDATE brands SET name=?, description=? WHERE id=?",
      [name, description || "", id]
    )
    const [rows]: any = await conn.query("SELECT * FROM brands WHERE id = ?", [id])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete a brand
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const conn = await getConnection()
    await conn.execute("DELETE FROM brands WHERE id = ?", [id])
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}