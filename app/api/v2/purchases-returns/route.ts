import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { CreatePurchaseReturnInput, UpdatePurchaseReturnInput, PurchaseReturnSearchParams } from "@/lib/types/prisma"

export async function POST(req: NextRequest) {
  try {
    const body: CreatePurchaseReturnInput = await req.json()

    // Validate required fields
    if (!body.purchase_id || !body.supplier_id || !body.warehouse_id) {
      return NextResponse.json(
        { error: 'Purchase ID, supplier ID, and warehouse ID are required' },
        { status: 400 }
      )
    }

    // Validate items
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      )
    }

    // Generate reference if not provided
    const reference = body.reference || `PR-${Date.now()}`

    const purchaseReturn = await prisma.$transaction(async (tx) => {
      // Create the purchase return
      const pr = await tx.purchase_returns.create({
        data: {
          reference,
          purchase_id: parseInt(body.purchase_id.toString()),
          supplier_id: parseInt(body.supplier_id.toString()),
          warehouse_id: parseInt(body.warehouse_id.toString()),
          date: new Date(body.date || new Date()),
          subtotal: body.subtotal ?? 0,
          tax_rate: body.tax_rate ?? 0,
          tax_amount: body.tax_amount ?? 0,
          discount: body.discount ?? 0,
          shipping: body.shipping ?? 0,
          total: body.total,
          status: body.status || "completed",
          notes: body.notes ?? null,
          purchase_return_items: {
            create: body.items.map(item => ({
              product_id: parseInt(item.product_id.toString()),
              purchase_item_id: item.purchase_item_id ? parseInt(item.purchase_item_id.toString()) : null,
              quantity: item.quantity,
              unit_cost: item.unit_cost,
              discount: item.discount || 0,
              tax: item.tax || 0,
              subtotal: (item.unit_cost * item.quantity) - (item.discount || 0) + (item.tax || 0),
            }))
          }
        },
        include: {
          purchase_return_items: {
            include: {
              products: true,
              purchase_items: true
            }
          },
          suppliers: true,
          warehouses: true,
          purchases: true
        }
      })

      // Update product stock if status is completed
      if (pr.status === 'completed') {
        for (const item of body.items) {
          await tx.products.update({
            where: { id: parseInt(item.product_id.toString()) },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        }
      }

      return pr
    })

    return NextResponse.json({
      success: true,
      data: purchaseReturn,
      returnId: purchaseReturn.id,
      reference: purchaseReturn.reference
    })
  } catch (error) {
    console.error('Purchase return creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create purchase return', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const purchase_id = searchParams.get("purchase_id")
    const supplier_id = searchParams.get("supplier_id")
    const warehouse_id = searchParams.get("warehouse_id")
    const status = searchParams.get("status")
    const date_from = searchParams.get("date_from")
    const date_to = searchParams.get("date_to")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    if (id) {
      const purchaseReturn = await prisma.purchase_returns.findUnique({
        where: { id: parseInt(id) },
        include: {
          suppliers: { select: { name: true, email: true, phone: true } },
          warehouses: { select: { name: true } },
          purchases: { select: { reference: true, date: true } },
          purchase_return_items: {
            include: {
              products: { select: { name: true, code: true } },
              purchase_items: true
            }
          },
        },
      })
      if (!purchaseReturn) return NextResponse.json({ error: "Purchase return not found" }, { status: 404 })
      return NextResponse.json({ success: true, data: purchaseReturn })
    }

    const where: any = {}

    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { suppliers: { name: { contains: search } } },
        { purchases: { reference: { contains: search } } },
      ]
    }

    if (purchase_id) where.purchase_id = parseInt(purchase_id)
    if (supplier_id) where.supplier_id = parseInt(supplier_id)
    if (warehouse_id) where.warehouse_id = parseInt(warehouse_id)
    if (status) where.status = status

    if (date_from || date_to) {
      where.date = {}
      if (date_from) where.date.gte = new Date(date_from)
      if (date_to) where.date.lte = new Date(date_to)
    }

    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [purchaseReturns, total] = await Promise.all([
      prisma.purchase_returns.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          suppliers: { select: { name: true, email: true } },
          warehouses: { select: { name: true } },
          purchases: { select: { reference: true } },
          purchase_return_items: {
            include: {
              products: { select: { name: true } }
            }
          }
        },
        orderBy,
      }),
      prisma.purchase_returns.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: purchaseReturns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Purchase returns fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch purchase returns', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing purchase return ID" }, { status: 400 })
    }

    const body: UpdatePurchaseReturnInput = await req.json()

    const purchaseReturn = await prisma.purchase_returns.update({
      where: { id: parseInt(id) },
      data: {
        purchase_id: body.purchase_id ? parseInt(body.purchase_id.toString()) : undefined,
        supplier_id: body.supplier_id ? parseInt(body.supplier_id.toString()) : undefined,
        warehouse_id: body.warehouse_id ? parseInt(body.warehouse_id.toString()) : undefined,
        date: body.date ? new Date(body.date) : undefined,
        subtotal: body.subtotal,
        tax_rate: body.tax_rate,
        tax_amount: body.tax_amount,
        discount: body.discount,
        shipping: body.shipping,
        total: body.total,
        status: body.status,
        notes: body.notes,
      },
      include: {
        purchase_return_items: {
          include: {
            products: true
          }
        },
        suppliers: true,
        warehouses: true
      }
    })

    return NextResponse.json({ success: true, data: purchaseReturn })
  } catch (error) {
    console.error('Purchase return update error:', error)
    return NextResponse.json(
      { error: 'Failed to update purchase return', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing purchase return ID" }, { status: 400 })
    }

    // Delete purchase return items first, then the purchase return
    await prisma.purchase_return_items.deleteMany({
      where: { return_id: parseInt(id) }
    })
    await prisma.purchase_returns.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: "Purchase return deleted successfully"
    })
  } catch (error) {
    console.error('Purchase return deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete purchase return', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}