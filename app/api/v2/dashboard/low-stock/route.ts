import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10")

    // Find products where stock < alert_quantity using raw SQL
    const lowStockItems = await prisma.$queryRaw<Array<{
      id: number
      name: string
      code: string
      stock: number
      alert_quantity: number
      warehouse_name: string
    }>>`
      SELECT
        p.id,
        p.name,
        p.code,
        p.stock,
        p.alert_quantity,
        w.name as warehouse_name
      FROM products p
      INNER JOIN warehouses w ON p.warehouse_id = w.id
      WHERE p.stock < p.alert_quantity
        AND p.status = 'active'
      ORDER BY p.stock ASC
      LIMIT ${limit}
    `

    const result = lowStockItems.map(item => ({
      id: item.id,
      name: item.name,
      code: item.code,
      current_stock: Number(item.stock),
      min_stock: Number(item.alert_quantity),
      warehouse_name: item.warehouse_name
    }))

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error fetching low stock products:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
