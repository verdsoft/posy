import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import type { RowDataPacket,FieldPacket} from "mysql2"

// interface Product {
//   id: number;
//   code: string;
//   name: string;
//   price: number;
//   stock: number;
//   unit_id: number;
// }

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  if (!q) return NextResponse.json([], { status: 200 })

  try {
    const conn = await getConnection()
    const [rows]:[RowDataPacket[],FieldPacket[]] = await conn.query(
      `SELECT id, code, name, price, stock, unit_id FROM products WHERE code LIKE ? OR name LIKE ? LIMIT 20`,
      [`%${q}%`, `%${q}%`]
    )
    
    return NextResponse.json(rows)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}