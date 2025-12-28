import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { CreateSalesReturnInput, UpdateSalesReturnInput, SalesReturnSearchParams } from "@/lib/types/prisma"

export async function POST(req: NextRequest) {
  try {
    const body: CreateSalesReturnInput = await req.json()

    // Validate required fields
    if (!body.sale_id || !body.customer_id || !body.warehouse_id) {
      return NextResponse.json(
        { error: 'Sale ID, customer ID, and warehouse ID are required' },
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
    const reference = body.reference || `SR-${Date.now()}`

    const salesReturn = await prisma.$transaction(async (tx) => {
      // Create the sales return
      const sr = await tx.sales_returns.create({
        data: {
          reference,
          sale_id: parseInt(body.sale_id.toString()),
          customer_id: parseInt(body.customer_id.toString()),
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
          sales_return_items: {
            create: body.items.map(item => ({
              product_id: parseInt(item.product_id.toString()),
              sale_item_id: item.sale_item_id ? parseInt(item.sale_item_id.toString()) : null,
              quantity: item.quantity,
              unit_price: item.unit_price,
              discount: item.discount || 0,
              tax: item.tax || 0,
              subtotal: (item.unit_price * item.quantity) - (item.discount || 0) + (item.tax || 0),
            }))
          }
        },
        include: {
          sales_return_items: {
            include: {
              products: true,
              sale_items: true
            }
          },
          customers: true,
          warehouses: true,
          sales: true
        }
      })

      // Update product stock if status is completed
      if (sr.status === 'completed') {
        for (const item of body.items) {
          await tx.products.update({
            where: { id: parseInt(item.product_id.toString()) },
            data: {
              stock: {
                increment: item.quantity
              }
            }
          })
        }
      }

      return sr
    })

    return NextResponse.json({
      success: true,
      data: salesReturn,
      returnId: salesReturn.id,
      reference: salesReturn.reference
    })
  } catch (error) {
    console.error('Sales return creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create sales return', details: error instanceof Error ? error.message : 'Unknown error' },
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
    const sale_id = searchParams.get("sale_id")
    const customer_id = searchParams.get("customer_id")
    const warehouse_id = searchParams.get("warehouse_id")
    const status = searchParams.get("status")
    const date_from = searchParams.get("date_from")
    const date_to = searchParams.get("date_to")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const offset = (page - 1) * limit

    if (id) {
      const salesReturn = await prisma.sales_returns.findUnique({
        where: { id: parseInt(id) },
        include: {
          customers: { select: { name: true, email: true, phone: true } },
          warehouses: { select: { name: true } },
          sales: { select: { reference: true, date: true } },
          sales_return_items: {
            include: {
              products: { select: { name: true, code: true } },
              sale_items: true
            }
          },
        },
      })
      if (!salesReturn) return NextResponse.json({ error: "Sales return not found" }, { status: 404 })
      return NextResponse.json({ success: true, data: salesReturn })
    }

    const where: any = {}

    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { customers: { name: { contains: search } } },
        { sales: { reference: { contains: search } } },
      ]
    }

    if (sale_id) where.sale_id = parseInt(sale_id)
    if (customer_id) where.customer_id = parseInt(customer_id)
    if (warehouse_id) where.warehouse_id = parseInt(warehouse_id)
    if (status) where.status = status

    if (date_from || date_to) {
      where.date = {}
      if (date_from) where.date.gte = new Date(date_from)
      if (date_to) where.date.lte = new Date(date_to)
    }

    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [salesReturns, total] = await Promise.all([
      prisma.sales_returns.findMany({
        where,
        skip: offset,
        take: limit,
        include: {
          customers: { select: { name: true, email: true } },
          warehouses: { select: { name: true } },
          sales: { select: { reference: true } },
          sales_return_items: {
            include: {
              products: { select: { name: true } }
            }
          }
        },
        orderBy,
      }),
      prisma.sales_returns.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: salesReturns,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Sales returns fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sales returns', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing sales return ID" }, { status: 400 })
    }

    const body: UpdateSalesReturnInput = await req.json()

    const salesReturn = await prisma.sales_returns.update({
      where: { id: parseInt(id) },
      data: {
        sale_id: body.sale_id ? parseInt(body.sale_id.toString()) : undefined,
        customer_id: body.customer_id ? parseInt(body.customer_id.toString()) : undefined,
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
        sales_return_items: {
          include: {
            products: true
          }
        },
        customers: true,
        warehouses: true
      }
    })

    return NextResponse.json({ success: true, data: salesReturn })
  } catch (error) {
    console.error('Sales return update error:', error)
    return NextResponse.json(
      { error: 'Failed to update sales return', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing sales return ID" }, { status: 400 })
    }

    // Delete sales return items first, then the sales return
    await prisma.sales_return_items.deleteMany({
      where: { return_id: parseInt(id) }
    })
    await prisma.sales_returns.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({
      success: true,
      message: "Sales return deleted successfully"
    })
  } catch (error) {
    console.error('Sales return deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete sales return', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
