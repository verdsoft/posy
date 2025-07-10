import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  if (!q) return NextResponse.json([], { status: 200 })

  try {
    const conn = await getConnection()
    const [rows]: any = await conn.query(
      `SELECT id, code, name, stock, unit_id FROM products WHERE code LIKE ? OR name LIKE ? LIMIT 20`,
      [`%${q}%`, `%${q}%`]
    )
    
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}