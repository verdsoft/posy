import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

// GET - List stock takes or get single stock take
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")
        const page = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "10")
        const warehouse_id = searchParams.get("warehouse_id")
        const status = searchParams.get("status")
        const search = searchParams.get("search")

        // Get single stock take
        if (id) {
            const stockTake = await prisma.stock_takes.findUnique({
                where: { id: parseInt(id) },
                include: {
                    warehouses: true,
                    users: { select: { id: true, name: true, email: true } },
                    stock_take_items: {
                        include: {
                            products: {
                                select: {
                                    id: true,
                                    name: true,
                                    code: true,
                                    barcode: true,
                                    stock: true
                                }
                            }
                        }
                    }
                }
            })

            if (!stockTake) {
                return NextResponse.json({ error: "Stock take not found" }, { status: 404 })
            }

            return NextResponse.json({ data: stockTake })
        }

        // List stock takes with pagination
        const skip = (page - 1) * limit
        const where: any = {}

        if (warehouse_id) where.warehouse_id = parseInt(warehouse_id)
        if (status) where.status = status
        if (search) {
            where.OR = [
                { reference: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } }
            ]
        }

        const [stockTakes, total] = await Promise.all([
            prisma.stock_takes.findMany({
                where,
                include: {
                    warehouses: { select: { id: true, name: true } },
                    users: { select: { id: true, name: true } },
                    stock_take_items: { select: { id: true } }
                },
                orderBy: { created_at: 'desc' },
                skip,
                take: limit
            }),
            prisma.stock_takes.count({ where })
        ])

        const formattedStockTakes = stockTakes.map(st => ({
            ...st,
            warehouse_name: st.warehouses.name,
            created_by_name: st.users.name,
            items_count: st.stock_take_items.length
        }))

        return NextResponse.json({
            data: formattedStockTakes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error: any) {
        console.error("Error fetching stock takes:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST - Create stock take
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const userId = parseInt(request.headers.get("x-user-id") || "1")

        // Generate reference
        const count = await prisma.stock_takes.count()
        const reference = `ST-${String(count + 1).padStart(6, '0')}`

        // Get all products from warehouse if no items provided
        let items = body.items || []

        if (items.length === 0) {
            const products = await prisma.products.findMany({
                where: { warehouse_id: parseInt(body.warehouse_id) },
                select: { id: true, stock: true }
            })

            items = products.map(p => ({
                product_id: p.id,
                expected_qty: p.stock
            }))
        }

        const stockTake = await prisma.stock_takes.create({
            data: {
                reference,
                warehouse_id: parseInt(body.warehouse_id),
                date: new Date(body.date || new Date()),
                status: body.status || 'pending',
                notes: body.notes,
                created_by: userId,
                stock_take_items: {
                    create: items.map((item: any) => ({
                        product_id: parseInt(item.product_id),
                        expected_qty: parseFloat(item.expected_qty || 0),
                        counted_qty: item.counted_qty ? parseFloat(item.counted_qty) : null,
                        variance: item.counted_qty ? parseFloat(item.counted_qty) - parseFloat(item.expected_qty || 0) : null,
                        notes: item.notes
                    }))
                }
            },
            include: {
                warehouses: true,
                stock_take_items: {
                    include: { products: true }
                }
            }
        })

        return NextResponse.json({ data: stockTake }, { status: 201 })
    } catch (error: any) {
        console.error("Error creating stock take:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT - Update stock take
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const stockTakeId = parseInt(body.id)

        const result = await prisma.$transaction(async (tx) => {
            // Delete existing items
            await tx.stock_take_items.deleteMany({
                where: { stock_take_id: stockTakeId }
            })

            // Update stock take
            const stockTake = await tx.stock_takes.update({
                where: { id: stockTakeId },
                data: {
                    warehouse_id: parseInt(body.warehouse_id),
                    date: new Date(body.date),
                    status: body.status,
                    notes: body.notes,
                    updated_at: new Date(),
                    finalized_at: body.status === 'completed' ? new Date() : null,
                    stock_take_items: {
                        create: body.items.map((item: any) => ({
                            product_id: parseInt(item.product_id),
                            expected_qty: parseFloat(item.expected_qty),
                            counted_qty: item.counted_qty ? parseFloat(item.counted_qty) : null,
                            variance: item.counted_qty ? parseFloat(item.counted_qty) - parseFloat(item.expected_qty) : null,
                            notes: item.notes
                        }))
                    }
                },
                include: {
                    warehouses: true,
                    stock_take_items: {
                        include: { products: true }
                    }
                }
            })

            return stockTake
        })

        return NextResponse.json({ data: result })
    } catch (error: any) {
        console.error("Error updating stock take:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE - Delete stock take
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get("id")

        if (!id) {
            return NextResponse.json({ error: "Stock take ID required" }, { status: 400 })
        }

        await prisma.$transaction(async (tx) => {
            await tx.stock_take_items.deleteMany({
                where: { stock_take_id: parseInt(id) }
            })

            await tx.stock_takes.delete({
                where: { id: parseInt(id) }
            })
        })

        return NextResponse.json({ message: "Stock take deleted successfully" })
    } catch (error: any) {
        console.error("Error deleting stock take:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
