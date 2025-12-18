import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const params = await context.params
    const id = params.id

    const adjustmentId = parseInt(id)
    if (isNaN(adjustmentId)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      )
    }

    const adjustment = await prisma.adjustments.findUnique({
      where: { id: adjustmentId },
      include: {
        warehouses: true,
        adjustment_items: {
          include: {
            products: {
              include: {
                units: true
              }
            }
          }
        }
      }
    })

    if (!adjustment) {
      return NextResponse.json(
        { error: "Adjustment not found" },
        { status: 404 }
      )
    }

    // Map to match the previous raw SQL response structure
    const response = {
      ...adjustment,
      warehouse_name: adjustment.warehouses?.name,
      item_count: adjustment.adjustment_items.length,
      items: adjustment.adjustment_items.map(item => ({
        ...item,
        product_code: item.products?.code,
        product_name: item.products?.name,
        unit_name: item.products?.units?.name
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching adjustment:", error)
    return NextResponse.json(
      { error: "Failed to fetch adjustment" },
      { status: 500 }
    )
  }
}
