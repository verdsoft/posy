import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

// GET: List all currencies
export async function GET() {
  try {
    const conn = await getConnection()
    const [rows]: any = await conn.query("SELECT * FROM currencies")
    
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a new currency
export async function POST(req: NextRequest) {
  try {
    const { code, name, symbol } = await req.json()
    if (!code || !name || !symbol) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const conn = await getConnection()
    const [result]: any = await conn.execute(
      "INSERT INTO currencies (code, name, symbol) VALUES (?, ?, ?)",
      [code, name, symbol]
    )
    const [rows]: any = await conn.query("SELECT * FROM currencies WHERE id = ?", [result.insertId])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update a currency
export async function PUT(req: NextRequest) {
  try {
    const { id, code, name, symbol } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const conn = await getConnection()
    await conn.execute(
      "UPDATE currencies SET code=?, name=?, symbol=? WHERE id=?",
      [code, name, symbol, id]
    )
    const [rows]: any = await conn.query("SELECT * FROM currencies WHERE id = ?", [id])
    
    return NextResponse.json(rows[0])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete a currency
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const conn = await getConnection()
    await conn.execute("DELETE FROM currencies WHERE id = ?", [id])
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}