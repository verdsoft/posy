import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.trim()
  if (!q) return NextResponse.json([], { status: 200 })

  try {
    const products = await prisma.products.findMany({
      where: {
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } }
        ],
        status: 'active'
      },
      select: {
        id: true,
        code: true,
        name: true,
        cost: true,
        price: true,
        stock: true,
        warehouse_id: true
      },
      take: 20
    })

    return NextResponse.json(products)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error('Error searching products:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}