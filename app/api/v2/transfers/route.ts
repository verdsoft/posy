import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (id) {
      const transfer = await prisma.transfers.findUnique({
        where: { id: parseInt(id) },
        include: {
          warehouses_transfers_from_warehouse_idTowarehouses: {
            select: { id: true, name: true }
          },
          warehouses_transfers_to_warehouse_idTowarehouses: {
            select: { id: true, name: true }
          },
          transfer_items: {
            include: {
              products: {
                select: { id: true, name: true, code: true, cost: true }
              }
            }
          }
        }
      })
      if (!transfer) {
        return NextResponse.json({ error: "Transfer not found" }, { status: 404 })
      }
      const formattedTransfer = {
        ...transfer,
        from_warehouse: transfer.warehouses_transfers_from_warehouse_idTowarehouses,
        to_warehouse: transfer.warehouses_transfers_to_warehouse_idTowarehouses,
      }
      return NextResponse.json(formattedTransfer)
    }

    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const search = (searchParams.get("search") || "").trim()
    const offset = (page - 1) * limit

    const whereCondition = search ? {
      OR: [
        { reference: { contains: search, mode: 'insensitive' as const } },
        { warehouses_transfers_from_warehouse_idTowarehouses: { name: { contains: search, mode: 'insensitive' as const } } },
        { warehouses_transfers_to_warehouse_idTowarehouses: { name: { contains: search, mode: 'insensitive' as const } } }
      ]
    } : {}

    const [transfers, total] = await Promise.all([
      prisma.transfers.findMany({
        where: whereCondition,
        include: {
          warehouses_transfers_from_warehouse_idTowarehouses: {
            select: { id: true, name: true }
          },
          warehouses_transfers_to_warehouse_idTowarehouses: {
            select: { id: true, name: true }
          },
          transfer_items: {
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
      prisma.transfers.count({
        where: whereCondition
      })
    ])

    const formattedTransfers = transfers.map(t => ({
      ...t,
      from_warehouse: t.warehouses_transfers_from_warehouse_idTowarehouses,
      to_warehouse: t.warehouses_transfers_to_warehouse_idTowarehouses,
    }))

    return NextResponse.json({
      data: formattedTransfers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching transfers:", error)
    return NextResponse.json({
      data: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 0 }
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Ensure we have a valid user ID
    let validUserId = body.user_id ? parseInt(body.user_id.toString()) : null
    if (!validUserId) {
      // Try to find the first admin user
      const adminUser = await prisma.users.findFirst({
        where: { role: 'admin' }
      })
      if (adminUser) {
        validUserId = adminUser.id
      } else {
        // If no admin user exists, try to find any user
        const anyUser = await prisma.users.findFirst()
        if (anyUser) {
          validUserId = anyUser.id
        } else {
          return NextResponse.json(
            { error: 'No valid user found. Please ensure at least one user exists in the system.' },
            { status: 400 }
          )
        }
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      // Create transfer
      const transfer = await tx.transfers.create({
        data: {
          reference: body.reference || `TR-${Date.now()}`,
          warehouses_transfers_from_warehouse_idTowarehouses: {
            connect: { id: parseInt(body.from_warehouse_id) }
          },
          warehouses_transfers_to_warehouse_idTowarehouses: {
            connect: { id: parseInt(body.to_warehouse_id) }
          },
          date: new Date(body.date),
          subtotal: parseFloat(body.subtotal || 0),
          tax_rate: parseFloat(body.tax_rate || 0),
          tax_amount: parseFloat(body.tax_amount || 0),
          discount: parseFloat(body.discount || 0),
          shipping: parseFloat(body.shipping || 0),
          total: parseFloat(body.total || 0),
          status: body.status || 'pending',
          notes: body.notes || null,
          users: {
            connect: { id: validUserId }
          }
        }
      })

      // Create transfer items and update stock
      if (body.items && Array.isArray(body.items)) {
        for (const item of body.items) {
          const quantity = parseFloat(item.quantity)

          await tx.transfer_items.create({
            data: {
              transfer_id: transfer.id,
              product_id: item.product_id,
              quantity: quantity,
              unit_cost: parseFloat(item.net_unit_cost || item.unit_cost || 0),
              discount: parseFloat(item.discount || 0),
              tax: parseFloat(item.tax || 0),
              subtotal: parseFloat(item.subtotal)
            }
          })

          // Handle stock movement if transfer is completed
          if (body.status === 'completed' || body.status === 'sent') {
            // Get source product details
            const sourceProduct = await tx.products.findUnique({
              where: { id: item.product_id }
            })

            if (!sourceProduct) {
              throw new Error(`Product with ID ${item.product_id} not found`)
            }

            // Decrement stock from source warehouse
            await tx.products.update({
              where: { id: item.product_id },
              data: { stock: { decrement: quantity } }
            })

            // Check if product exists in destination warehouse
            const destProduct = await tx.products.findFirst({
              where: {
                code: sourceProduct.code,
                warehouse_id: parseInt(body.to_warehouse_id)
              }
            })

            if (destProduct) {
              // Product exists in destination, increment stock
              await tx.products.update({
                where: { id: destProduct.id },
                data: { stock: { increment: quantity } }
              })
            } else {
              // Product doesn't exist in destination, create it
              await tx.products.create({
                data: {
                  name: sourceProduct.name,
                  code: sourceProduct.code,
                  barcode: sourceProduct.barcode,
                  category_id: sourceProduct.category_id,
                  brand_id: sourceProduct.brand_id,
                  unit_id: sourceProduct.unit_id,
                  warehouse_id: parseInt(body.to_warehouse_id),
                  cost: sourceProduct.cost,
                  price: sourceProduct.price,
                  stock: quantity,
                  alert_quantity: sourceProduct.alert_quantity,
                  description: sourceProduct.description,
                  image: sourceProduct.image,
                  status: sourceProduct.status
                }
              })
            }
          }
        }
      }

      return transfer
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Error creating transfer:", error)
    return NextResponse.json({ error: error.message || "Failed to create transfer" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const result = await prisma.$transaction(async (tx) => {
      const transferId = parseInt(body.id)

      // 1. Fetch existing transfer and items
      const existingTransfer = await tx.transfers.findUnique({
        where: { id: transferId },
        include: {
          transfer_items: {
            include: {
              products: true
            }
          }
        }
      })

      if (!existingTransfer) {
        throw new Error('Transfer not found')
      }

      // 2. Reverse stock movements if transfer was previously completed/sent
      if (existingTransfer.status === 'completed' || existingTransfer.status === 'sent') {
        for (const item of existingTransfer.transfer_items) {
          const quantity = parseFloat(item.quantity.toString())
          const sourceProduct = item.products

          // Restore stock to source warehouse
          await tx.products.update({
            where: { id: item.product_id },
            data: { stock: { increment: quantity } }
          })

          // Remove stock from destination warehouse
          const destProduct = await tx.products.findFirst({
            where: {
              code: sourceProduct.code,
              warehouse_id: existingTransfer.to_warehouse_id
            }
          })

          if (destProduct) {
            await tx.products.update({
              where: { id: destProduct.id },
              data: { stock: { decrement: quantity } }
            })
          }
        }
      }

      // 3. Update transfer
      const transfer = await tx.transfers.update({
        where: { id: transferId },
        data: {
          reference: body.reference,
          from_warehouse_id: body.from_warehouse_id,
          to_warehouse_id: body.to_warehouse_id,
          date: new Date(body.date),
          subtotal: parseFloat(body.subtotal || 0),
          tax_rate: parseFloat(body.tax_rate || 0),
          tax_amount: parseFloat(body.tax_amount || 0),
          discount: parseFloat(body.discount || 0),
          shipping: parseFloat(body.shipping || 0),
          total: parseFloat(body.total || 0),
          status: body.status || 'pending',
          notes: body.notes || null,
          updated_at: new Date()
        }
      })

      // 4. Delete existing items
      await tx.transfer_items.deleteMany({
        where: { transfer_id: transfer.id }
      })

      // 5. Create new items and apply stock movements
      if (body.items && Array.isArray(body.items)) {
        for (const item of body.items) {
          const quantity = parseFloat(item.quantity)

          await tx.transfer_items.create({
            data: {
              transfer_id: transfer.id,
              product_id: item.product_id,
              quantity: quantity,
              unit_cost: parseFloat(item.net_unit_cost || item.unit_cost || 0),
              discount: parseFloat(item.discount || 0),
              tax: parseFloat(item.tax || 0),
              subtotal: parseFloat(item.subtotal)
            }
          })

          // Apply stock movements if new status is completed/sent
          if (body.status === 'completed' || body.status === 'sent') {
            const sourceProduct = await tx.products.findUnique({
              where: { id: item.product_id }
            })

            if (!sourceProduct) {
              throw new Error(`Product with ID ${item.product_id} not found`)
            }

            // Decrement from source
            await tx.products.update({
              where: { id: item.product_id },
              data: { stock: { decrement: quantity } }
            })

            // Check destination
            const destProduct = await tx.products.findFirst({
              where: {
                code: sourceProduct.code,
                warehouse_id: parseInt(body.to_warehouse_id)
              }
            })

            if (destProduct) {
              await tx.products.update({
                where: { id: destProduct.id },
                data: { stock: { increment: quantity } }
              })
            } else {
              await tx.products.create({
                data: {
                  name: sourceProduct.name,
                  code: sourceProduct.code,
                  barcode: sourceProduct.barcode,
                  category_id: sourceProduct.category_id,
                  brand_id: sourceProduct.brand_id,
                  unit_id: sourceProduct.unit_id,
                  warehouse_id: parseInt(body.to_warehouse_id),
                  cost: sourceProduct.cost,
                  price: sourceProduct.price,
                  stock: quantity,
                  alert_quantity: sourceProduct.alert_quantity,
                  description: sourceProduct.description,
                  image: sourceProduct.image,
                  status: sourceProduct.status
                }
              })
            }
          }
        }
      }

      return transfer
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error("Error updating transfer:", error)
    return NextResponse.json({ error: "Failed to update transfer" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    await prisma.$transaction(async (tx) => {
      const transferId = parseInt(id)

      // Fetch transfer and items with product details
      const transfer = await tx.transfers.findUnique({
        where: { id: transferId },
        include: {
          transfer_items: {
            include: {
              products: true
            }
          }
        }
      })

      if (!transfer) {
        throw new Error('Transfer not found')
      }

      // Reverse stock movements if transfer was completed/sent
      if (transfer.status === 'completed' || transfer.status === 'sent') {
        for (const item of transfer.transfer_items) {
          const quantity = parseFloat(item.quantity.toString())
          const sourceProduct = item.products

          // Restore stock to source warehouse
          await tx.products.update({
            where: { id: item.product_id },
            data: { stock: { increment: quantity } }
          })

          // Remove stock from destination warehouse
          const destProduct = await tx.products.findFirst({
            where: {
              code: sourceProduct.code,
              warehouse_id: transfer.to_warehouse_id
            }
          })

          if (destProduct) {
            await tx.products.update({
              where: { id: destProduct.id },
              data: { stock: { decrement: quantity } }
            })
          }
        }
      }

      // Delete transfer items first
      await tx.transfer_items.deleteMany({
        where: { transfer_id: transferId }
      })

      // Delete transfer
      await tx.transfers.delete({
        where: { id: transferId }
      })
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting transfer:", error)
    return NextResponse.json({ error: "Failed to delete transfer" }, { status: 500 })
  }
}