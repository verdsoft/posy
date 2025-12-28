import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

interface Transaction {
  id: number
  type: "sale" | "purchase" | "expense"
  reference: string
  amount: number
  date: string
  status: string
  description?: string
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const limit = parseInt(searchParams.get("limit") || "10")

    // Fetch recent sales
    const sales = await prisma.sales.findMany({
      orderBy: { created_at: "desc" },
      take: limit,
      select: {
        id: true,
        reference: true,
        total: true,
        created_at: true,
        status: true
      }
    })

    // Fetch recent purchases
    const purchases = await prisma.purchases.findMany({
      orderBy: { created_at: "desc" },
      take: limit,
      select: {
        id: true,
        reference: true,
        total: true,
        created_at: true,
        status: true
      }
    })

    // Fetch recent expenses
    const expenses = await prisma.expenses.findMany({
      orderBy: { created_at: "desc" },
      take: limit,
      select: {
        id: true,
        reference: true,
        amount: true,
        date: true,
        status: true,
        description: true
      }
    })

    // Combine and format transactions
    const transactions: Transaction[] = [
      ...sales.map(s => ({
        id: s.id,
        type: "sale" as const,
        reference: s.reference,
        amount: s.total,
        date: s.created_at.toISOString(),
        status: s.status
      })),
      ...purchases.map(p => ({
        id: p.id,
        type: "purchase" as const,
        reference: p.reference,
        amount: p.total,
        date: p.created_at.toISOString(),
        status: p.status
      })),
      ...expenses.map(e => ({
        id: e.id,
        type: "expense" as const,
        reference: e.reference,
        amount: e.amount,
        date: e.date.toISOString(),
        status: e.status,
        description: e.description || undefined
      }))
    ]

    // Sort by date descending and limit
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const result = transactions.slice(0, limit)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error fetching recent transactions:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
