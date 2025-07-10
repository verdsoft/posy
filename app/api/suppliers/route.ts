import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

export async function GET() {
  const conn = await getConnection()
  try {
    const [rows]: any = await conn.query(
      "SELECT id, name FROM suppliers ORDER BY name ASC"
    )
    
    return NextResponse.json(rows)
  } catch (error: any) {
    
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}