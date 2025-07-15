import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { RowDataPacket } from "mysql2/promise"

interface QuotationItemWithProduct extends RowDataPacket {
  id: string
  product_id: string
  product_name: string
  product_code: string
  quantity: number
  price: number
  discount: number
  tax: number
  subtotal: number
  stock: number
  unit_name: string
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const quotationId = searchParams.get('id')
  const conn = await getConnection()

  if (!quotationId) {
    return NextResponse.json({ error: "Quotation ID is required" }, { status: 400 })
  }

  try {
    const [items] = await conn.execute<QuotationItemWithProduct[]>(
      `SELECT 
        qi.id,
        qi.product_id,
        p.name as product_name,
        p.code as product_code,
        qi.quantity,
        qi.unit_price as price,
        qi.discount,
        qi.tax,
        qi.subtotal,
        p.stock,
        p.unit_name
       FROM quotation_items qi
       LEFT JOIN products p ON qi.product_id = p.id
       WHERE qi.quotation_id = ?
       ORDER BY qi.id`,
      [quotationId]
    )

    return NextResponse.json(items)
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error('Unknown error')
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}