import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const period = searchParams.get("period") || "30"
    const limit = parseInt(searchParams.get("limit") || "5")

    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(period))

    // Use raw SQL to get top products
    const topProducts = await prisma.$queryRaw<Array<{
      product_id: number
      product_name: string
      product_code: string
      units_sold: number
      revenue: number
    }>>`
      SELECT
        si.product_id,
        p.name as product_name,
        p.code as product_code,
        CAST(SUM(si.quantity) AS FLOAT) as units_sold,
        CAST(SUM(si.subtotal) AS FLOAT) as revenue
      FROM sale_items si
      INNER JOIN sales s ON si.sale_id = s.id
      INNER JOIN products p ON si.product_id = p.id
      WHERE s.status = 'completed'
        AND s.created_at >= ${daysAgo}
      GROUP BY si.product_id, p.name, p.code
      ORDER BY units_sold DESC
      LIMIT ${limit}
    `

    const result = topProducts.map(tp => ({
      id: tp.product_id,
      name: tp.product_name,
      code: tp.product_code,
      units_sold: tp.units_sold,
      revenue: tp.revenue
    }))

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error fetching top products:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
