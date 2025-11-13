import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface DailyData {
  date: string
  sales: number
  purchases: number
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const days = parseInt(searchParams.get("days") || "7")

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Fetch sales data
    const salesData = await prisma.sales.findMany({
      where: {
        created_at: { gte: startDate },
        status: "completed"
      },
      select: {
        created_at: true,
        total: true
      }
    })

    // Fetch purchases data
    const purchasesData = await prisma.purchases.findMany({
      where: {
        created_at: { gte: startDate },
        status: "received"
      },
      select: {
        created_at: true,
        total: true
      }
    })

    // Create a map for all dates in the range
    const dateMap: Record<string, DailyData> = {}
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      dateMap[dateStr] = {
        date: dateStr,
        sales: 0,
        purchases: 0
      }
    }

    // Aggregate sales by date
    salesData.forEach(sale => {
      const dateStr = sale.created_at.toISOString().split("T")[0]
      if (dateMap[dateStr]) {
        dateMap[dateStr].sales += Number(sale.total)
      }
    })

    // Aggregate purchases by date
    purchasesData.forEach(purchase => {
      const dateStr = purchase.created_at.toISOString().split("T")[0]
      if (dateMap[dateStr]) {
        dateMap[dateStr].purchases += Number(purchase.total)
      }
    })

    // Convert to array and sort by date ascending
    const result = Object.values(dateMap).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error fetching sales chart data:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
