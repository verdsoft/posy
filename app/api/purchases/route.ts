import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { v4 as uuidv4 } from "uuid"
import type { Fields } from "formidable"
import type { RowDataPacket, FieldPacket } from "mysql2"
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper function to parse form data
export async function parseForm(req: NextRequest): Promise<{ fields: Fields }> {
  const formData = await req.formData()
  const fields: Fields = {}
  
  formData.forEach((value, key) => {
    fields[key] = value.toString()
  })

  return { fields }
}

// Helper function to get field value
function getField(fields: Fields, key: string) {
  const val = fields[key]
  if (Array.isArray(val)) return (val[0] ?? "").toString()
  return (val ?? "").toString()
}

// GET: Get purchase(s)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    const conn = await getConnection()
    
    if (id) {
      // Single purchase request with items
      const [purchase]: [RowDataPacket[], FieldPacket[]] = await conn.query(`
        SELECT p.*, 
          s.name as supplier_name,
          w.name as warehouse_name,
          u.name as created_by_name
        FROM purchases p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        LEFT JOIN warehouses w ON p.warehouse_id = w.id
        LEFT JOIN users u ON p.created_by = u.id
        WHERE p.id = ?
      `, [id])

      if (purchase.length === 0) {
        return NextResponse.json(
          { error: "Purchase not found" },
          { status: 404 }
        )
      }

      // Get purchase items
      const [items]: [RowDataPacket[], FieldPacket[]] = await conn.query(`
        SELECT pi.*, 
          pr.name as product_name,
          pr.code as product_code
        FROM purchase_items pi
        LEFT JOIN products pr ON pi.product_id = pr.id
        WHERE pi.purchase_id = ?
      `, [id])

      return NextResponse.json({
        ...purchase[0],
        items: items || []
      })
    } else {
      // List all purchases with basic info
      const [rows]: [RowDataPacket[], FieldPacket[]] = await conn.query(`
        SELECT p.*, 
          s.name as supplier_name,
          w.name as warehouse_name
        FROM purchases p
        LEFT JOIN suppliers s ON p.supplier_id = s.id
        LEFT JOIN warehouses w ON p.warehouse_id = w.id
        ORDER BY p.date DESC
      `)
     
      return NextResponse.json(rows || [])
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error instanceof Error && error.message) || "Internal server error" },
      { status: 500 }
    )
  }
}

// POST: Create new purchase
export async function POST(req: NextRequest) {
  const conn = await getConnection()
  try {
    

    // Check content type and parse accordingly
    const contentType = req.headers.get('content-type')
    let data: any

    if (contentType?.includes('application/json')) {
      data = await req.json()
    } else {
      // Fallback to form data parsing
      const { fields } = await parseForm(req)
      data = {
        reference: getField(fields, 'reference'),
        supplier_id: getField(fields, 'supplier_id'),
        warehouse_id: getField(fields, 'warehouse_id'),
        date: getField(fields, 'date'),
        subtotal: parseFloat(getField(fields, 'subtotal')) || 0,
        tax_rate: parseFloat(getField(fields, 'tax_rate')) || 0,
        tax_amount: parseFloat(getField(fields, 'tax_amount')) || 0,
        discount: parseFloat(getField(fields, 'discount')) || 0,
        shipping: parseFloat(getField(fields, 'shipping')) || 0,
        total: parseFloat(getField(fields, 'total')) || 0,
        paid: parseFloat(getField(fields, 'paid')) || 0,
        due: parseFloat(getField(fields, 'due')) || 0,
        status: getField(fields, 'status') || 'pending',
        payment_status: getField(fields, 'payment_status') || 'unpaid',
        notes: getField(fields, 'notes'),
        created_by: getField(fields, 'created_by'),
        items: JSON.parse(getField(fields, 'items') || '[]')
      }
    }

    // Parse purchase data
    const purchaseData = {
      id: uuidv4(),
      reference: data.reference || `PUR-${Date.now()}`,
      supplier_id: data.supplier_id,
      warehouse_id: data.warehouse_id,
      date: data.date,
      subtotal: data.subtotal || 0,
      tax_rate: data.tax_rate || 0,
      tax_amount: data.tax_amount || 0,
      discount: data.discount || 0,
      shipping: data.shipping || 0,
      total: data.total || 0,
      paid: data.paid || 0,
      due: data.due || 0,
      status: data.status || 'pending',
      payment_status: data.payment_status || 'unpaid',
      notes: data.notes,
      created_by: data.created_by
    }

    // Validate required fields
    if (!purchaseData.supplier_id || !purchaseData.warehouse_id || !purchaseData.date) {
      throw new Error('Missing required fields')
    }

    // Insert purchase
    await conn.query(
      `INSERT INTO purchases SET ?`,
      [purchaseData]
    )

    // Insert purchase items
    const items = Array.isArray(data.items) ? data.items : []
    for (const item of items) {
      if (!item.product_id || !item.quantity || !item.unit_cost) {
        throw new Error('Invalid item data')
      }

      const itemData = {
        id: uuidv4(),
        purchase_id: purchaseData.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_cost: item.unit_cost,
        discount: item.discount || 0,
        tax: item.tax || 0,
        subtotal: item.subtotal || (item.quantity * item.unit_cost)
      }

      await conn.query(
        `INSERT INTO purchase_items SET ?`,
        [itemData]
      )

      // Update product stock if purchase is received
      if (purchaseData.status === 'received') {
        await conn.query(
          `UPDATE products 
           SET stock = stock + ? 
           WHERE id = ?`,
          [item.quantity, item.product_id]
        )
      }
    }

   
    return NextResponse.json({ 
      success: true, 
      id: purchaseData.id,
      reference: purchaseData.reference
    })
  } catch (error: unknown) {
  
    console.error('Purchase creation error:', error)
    return NextResponse.json(
      { 
        error: (error instanceof Error) ? error.message : "Internal server error",
        details: (error instanceof Error) ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// PUT: Update purchase
export async function PUT(req: NextRequest) {
  const conn = await getConnection()
  try {
    await conn.beginTransaction()

    const { fields } = await parseForm(req)
    const purchaseId = getField(fields, 'id')
    
    if (!purchaseId) {
      return NextResponse.json(
        { error: "Purchase ID is required" },
        { status: 400 }
      )
    }

    // Get current purchase status
    const [current]: [RowDataPacket[], FieldPacket[]] = await conn.query(
      `SELECT status FROM purchases WHERE id = ?`,
      [purchaseId]
    )

    if (current.length === 0) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      )
    }

    const currentStatus = current[0].status

    // Parse purchase data
    const purchaseData = {
      supplier_id: getField(fields, 'supplier_id'),
      warehouse_id: getField(fields, 'warehouse_id'),
      date: getField(fields, 'date'),
      subtotal: parseFloat(getField(fields, 'subtotal')) || 0,
      tax_rate: parseFloat(getField(fields, 'tax_rate')) || 0,
      tax_amount: parseFloat(getField(fields, 'tax_amount')) || 0,
      discount: parseFloat(getField(fields, 'discount')) || 0,
      shipping: parseFloat(getField(fields, 'shipping')) || 0,
      total: parseFloat(getField(fields, 'total')) || 0,
      paid: parseFloat(getField(fields, 'paid')) || 0,
      due: parseFloat(getField(fields, 'due')) || 0,
      status: getField(fields, 'status') || 'pending',
      payment_status: getField(fields, 'payment_status') || 'unpaid',
      notes: getField(fields, 'notes'),
      updated_at: new Date()
    }

    // Update purchase
    await conn.query(
      `UPDATE purchases SET ? WHERE id = ?`,
      [purchaseData, purchaseId]
    )

    // Handle status change from pending to received
    if (currentStatus === 'pending' && purchaseData.status === 'received') {
      // Get current items to update stock
      const [currentItems]: [RowDataPacket[], FieldPacket[]] = await conn.query(
        `SELECT product_id, quantity FROM purchase_items WHERE purchase_id = ?`,
        [purchaseId]
      )

      for (const item of currentItems) {
        await conn.query(
          `UPDATE products 
           SET quantity = quantity + ? 
           WHERE id = ?`,
          [item.quantity, item.product_id]
        )
      }
    }

    // Handle status change from received to pending/cancelled
    if (currentStatus === 'received' && 
        (purchaseData.status === 'pending' || purchaseData.status === 'cancelled')) {
      // Get current items to reverse stock
      const [currentItems]: [RowDataPacket[], FieldPacket[]] = await conn.query(
        `SELECT product_id, quantity FROM purchase_items WHERE purchase_id = ?`,
        [purchaseId]
      )

      for (const item of currentItems) {
        await conn.query(
          `UPDATE products 
           SET quantity = quantity - ? 
           WHERE id = ?`,
          [item.quantity, item.product_id]
        )
      }
    }

    // Parse and update purchase items
    const items = JSON.parse(getField(fields, 'items') || [])
    
    // First delete all existing items
    await conn.query(
      `DELETE FROM purchase_items WHERE purchase_id = ?`,
      [purchaseId]
    )

    // Then insert the new items
    for (const item of items) {
      await conn.query(
        `INSERT INTO purchase_items SET ?`,
        [{
          id: uuidv4(),
          purchase_id: purchaseId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          discount: item.discount || 0,
          tax: item.tax || 0,
          subtotal: item.subtotal
        }]
      )
    }

    // If status is received after update, update stock
    if (purchaseData.status === 'received') {
      for (const item of items) {
        await conn.query(
          `UPDATE products 
           SET quantity = quantity + ? 
           WHERE id = ?`,
          [item.quantity, item.product_id]
        )
      }
    }

    await conn.commit()
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
  
    return NextResponse.json(
      { error: (error instanceof Error && error.message) || "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE: Delete purchase
export async function DELETE(req: NextRequest) {
  const conn = await getConnection()
  try {
    await conn.beginTransaction()

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "Purchase ID is required" },
        { status: 400 }
      )
    }

    // Get current purchase status
    const [current]: [RowDataPacket[], FieldPacket[]] = await conn.query(
      `SELECT status FROM purchases WHERE id = ?`,
      [id]
    )

    if (current.length === 0) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      )
    }

    const currentStatus = current[0].status

    // If purchase was received, we need to reverse the stock
    if (currentStatus === 'received') {
      const [items]: [RowDataPacket[], FieldPacket[]] = await conn.query(
        `SELECT product_id, quantity FROM purchase_items WHERE purchase_id = ?`,
        [id]
      )

      for (const item of items) {
        await conn.query(
          `UPDATE products 
           SET quantity = quantity - ? 
           WHERE id = ?`,
          [item.quantity, item.product_id]
        )
      }
    }

    // Delete purchase items (cascade would handle this, but being explicit)
    await conn.query(
      `DELETE FROM purchase_items WHERE purchase_id = ?`,
      [id]
    )

    // Delete purchase
    await conn.query(
      `DELETE FROM purchases WHERE id = ?`,
      [id]
    )

    await conn.commit()
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
   
    return NextResponse.json(
      { error: (error instanceof Error && error.message) || "Internal server error" },
      { status: 500 }
    )
  }
}