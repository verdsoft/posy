import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

// GET: List all categories
export async function GET() {
  try {
    const conn = getConnection()
    const [rows]: any = await conn.query("SELECT * FROM categories")
    
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a new category
export async function POST(req: NextRequest) {
  try {
    const { code, name } = await req.json()
    if (!code || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const conn = getConnection()
    const [result]: any = await conn.execute(
      "INSERT INTO categories (code, name) VALUES (?, ?)",
      [code, name]
    )
    const [rows]: any = await conn.query("SELECT * FROM categories WHERE id = ?", [result.insertId])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update a category
export async function PUT(req: NextRequest) {
  try {
    const { id, code, name } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const conn = getConnection()
    await conn.execute(
      "UPDATE categories SET code=?, name=? WHERE id=?",
      [code, name, id]
    )
    const [rows]: any = await conn.query("SELECT * FROM categories WHERE id = ?", [id])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete a category
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const conn = getConnection()
    await conn.execute("DELETE FROM categories WHERE id = ?", [id])
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}