import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

export async function GET() {
  const conn = await getConnection()
  try {
    const [rows]: any = await conn.query(
      "SELECT id, name FROM customers ORDER BY name ASC"
    )
    
    return NextResponse.json(rows)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}