import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10")

    // Use raw SQL to find products where quantity < alert_quantity
    const lowStockItems = await prisma.$queryRaw<Array<{
      product_id: number
      warehouse_id: number
      quantity: number
      alert_quantity: number
      product_name: string
      product_code: string
      warehouse_name: string
    }>>`
      SELECT
        pw.product_id,
        pw.warehouse_id,
        pw.quantity,
        pw.alert_quantity,
        p.name as product_name,
        p.code as product_code,
        w.name as warehouse_name
      FROM product_warehouse pw
      INNER JOIN products p ON pw.product_id = p.id
      INNER JOIN warehouses w ON pw.warehouse_id = w.id
      WHERE pw.quantity < pw.alert_quantity
      ORDER BY pw.quantity ASC
      LIMIT ${limit}
    `

    const result = lowStockItems.map(item => ({
      id: item.product_id,
      name: item.product_name,
      code: item.product_code,
      current_stock: item.quantity,
      min_stock: item.alert_quantity,
      warehouse_name: item.warehouse_name
    }))

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error fetching low stock products:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
