import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const search = (searchParams.get("search") || "").trim()
    const offset = (page - 1) * limit

    const whereCondition = search ? {
      OR: [
        { reference: { contains: search, mode: 'insensitive' as const } },
        { customers: { name: { contains: search, mode: 'insensitive' as const } } },
        { warehouses: { name: { contains: search, mode: 'insensitive' as const } } }
      ]
    } : {}

    const [invoices, total] = await Promise.all([
      prisma.invoices.findMany({
        where: whereCondition,
        include: {
          customers: {
            select: { id: true, name: true, email: true }
          },
          warehouses: {
            select: { id: true, name: true }
          },
          invoice_items: {
            include: {
              products: {
                select: { id: true, name: true, code: true }
              }
            }
          }
        },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.invoices.count({
        where: whereCondition
      })
    ])

    return NextResponse.json({
      data: invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const result = await prisma.$transaction(async (tx) => {
      // Create invoice
      const invoice = await tx.invoices.create({
        data: {
          reference: body.reference,
          customer_id: body.customer_id,
          warehouse_id: body.warehouse_id,
          sale_id: body.sale_id || null,
          quotation_id: body.quotation_id || null,
          date: new Date(body.date),
          due_date: body.due_date ? new Date(body.due_date) : null,
          subtotal: parseFloat(body.subtotal || 0),
          tax_rate: parseFloat(body.tax_rate || 0),
          tax_amount: parseFloat(body.tax_amount || 0),
          discount: parseFloat(body.discount || 0),
          shipping: parseFloat(body.shipping || 0),
          total: parseFloat(body.total || 0),
          status: body.status || 'pending',
          payment_status: body.payment_status || 'pending',
          notes: body.notes || null
        }
      })

      // Create invoice items
      if (body.items && Array.isArray(body.items)) {
        for (const item of body.items) {
          await tx.invoice_items.create({
            data: {
              invoice_id: invoice.id,
              product_id: item.product_id,
              quantity: parseFloat(item.quantity),
              unit_price: parseFloat(item.unit_price),
              discount: parseFloat(item.discount || 0),
              tax: parseFloat(item.tax || 0),
              subtotal: parseFloat(item.subtotal)
            }
          })
        }
      }

      return invoice
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const result = await prisma.$transaction(async (tx) => {
      // Update invoice
      const invoice = await tx.invoices.update({
        where: { id: parseInt(body.id) },
        data: {
          reference: body.reference,
          customer_id: body.customer_id,
          warehouse_id: body.warehouse_id,
          sale_id: body.sale_id || null,
          quotation_id: body.quotation_id || null,
          date: new Date(body.date),
          due_date: body.due_date ? new Date(body.due_date) : null,
          subtotal: parseFloat(body.subtotal || 0),
          tax_rate: parseFloat(body.tax_rate || 0),
          tax_amount: parseFloat(body.tax_amount || 0),
          discount: parseFloat(body.discount || 0),
          shipping: parseFloat(body.shipping || 0),
          total: parseFloat(body.total || 0),
          status: body.status || 'pending',
          payment_status: body.payment_status || 'pending',
          notes: body.notes || null,
          updated_at: new Date()
        }
      })

      // Delete existing items and create new ones
      if (body.items && Array.isArray(body.items)) {
        await tx.invoice_items.deleteMany({
          where: { invoice_id: invoice.id }
        })

        for (const item of body.items) {
          await tx.invoice_items.create({
            data: {
              invoice_id: invoice.id,
              product_id: item.product_id,
              quantity: parseFloat(item.quantity),
              unit_price: parseFloat(item.unit_price),
              discount: parseFloat(item.discount || 0),
              tax: parseFloat(item.tax || 0),
              subtotal: parseFloat(item.subtotal)
            }
          })
        }
      }

      return invoice
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.$transaction(async (tx) => {
      // Delete invoice items first
      await tx.invoice_items.deleteMany({
        where: { invoice_id: parseInt(id) }
      })

      // Delete invoice
      await tx.invoices.delete({
        where: { id: parseInt(id) }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 })
  }
}