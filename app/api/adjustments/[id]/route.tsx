import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"




import type { RowDataPacket } from "mysql2"

export interface AdjustmentRow extends RowDataPacket {
  id: string
  reference: string
  date: string
  type: string
  notes: string
  created_at: string
  updated_at: string
  warehouse_id: string
  warehouse_name: string
}

export interface AdjustmentItemRow extends RowDataPacket {
  id: string
  product_id: string
  quantity: number
  previous_stock: number
  type: string
  adjustment_id: string
  product_code: string
  product_name: string
  unit_name: string
}


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await getConnection()

    const [adjustments] = await connection.execute<AdjustmentRow[]>(
      `SELECT 
        a.*, 
        w.name AS warehouse_name
       FROM adjustments a
       JOIN warehouses w ON a.warehouse_id = w.id
       WHERE a.id = ?`,
      [params.id]
    )

    if (adjustments.length === 0) {
      return NextResponse.json(
        { error: "Adjustment not found" },
        { status: 404 }
      )
    }

    const [items] = await connection.execute<AdjustmentItemRow[]>(
      `SELECT 
        ai.*,
        p.code AS product_code,
        p.name AS product_name,
        u.name AS unit_name
       FROM adjustment_items ai
       JOIN products p ON ai.product_id = p.id
       LEFT JOIN units u ON p.unit_id = u.id
       WHERE ai.adjustment_id = ?`,
      [params.id]
    )

    return NextResponse.json({
      ...adjustments[0],
      item_count: items.length,
      items
    })
  } catch (error) {
    console.error("Error fetching adjustment:", error)
    return NextResponse.json(
      { error: "Failed to fetch adjustment" },
      { status: 500 }
    )
  }
}
