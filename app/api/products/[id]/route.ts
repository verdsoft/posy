import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import type { RowDataPacket, FieldPacket } from "mysql2"
import fs from "fs"
import path from "path"

// Helper function to get field value from FormData or object
function getField(data: any, key: string) {
  const val = data[key]
  if (Array.isArray(val)) return (val[0] ?? "").toString()
  return (val ?? "").toString()
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const conn = await getConnection()
    
    const [products]: [RowDataPacket[], FieldPacket[]] = await conn.query(
      `SELECT 
        p.*,
        c.name AS category_name,
        b.name AS brand_name,
        u.name AS unit_name,
        w.name AS warehouse_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN units u ON p.unit_id = u.id
      LEFT JOIN warehouses w ON p.warehouse_id = w.id
      WHERE p.id = ?`,
      [id]
    )

    if (products.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(products[0])
  } catch (error: unknown) {
    console.error("Error fetching product:", error)
    const message = error instanceof Error ? error.message : "Unknown error occurred while fetching product"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Check content type
    const contentType = req.headers.get('content-type')
    const isFormData = contentType?.includes('multipart/form-data')

    let data: any = {}

    if (isFormData) {
      // Handle form data with file upload
      const uploadDir = "./public/uploads"
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const formData = await req.formData()
      const imageFile = formData.get("image") as File | null
      
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        if (key !== 'image') {
          data[key] = value
        }
      }
      
      if (imageFile) {
        data.image = `/uploads/${path.basename(imageFile.name)}`
      }
    } else {
      // Handle JSON data
      data = await req.json()
    }

    // Validate required fields
    const requiredFields = ["name", "code", "category_id", "unit_id", "cost", "price"]
    const missingFields = requiredFields.filter(field => !data[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      )
    }

    const conn = await getConnection()
    
    // Get current image path
    const [current]: [RowDataPacket[],FieldPacket[]] = await conn.query(
      'SELECT image FROM products WHERE id = ?',
      [id]
    )
    
    if (current.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }
    
    const currentImage = current[0]?.image
    let imagePath = currentImage
    
    // Process new image if provided
    if (data.image && data.image !== currentImage) {
      // Delete old image if exists
      if (currentImage) {
        const oldImagePath = path.join(process.cwd(), 'public', currentImage)
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath)
        }
      }
      imagePath = data.image
    }

    // Update product
    await conn.execute(
      `UPDATE products SET
        name = ?, code = ?, barcode = ?, category_id = ?, brand_id = ?,
        unit_id = ?, warehouse_id = ?, cost = ?, price = ?, stock = ?,
        alert_quantity = ?, description = ?, status = ?, image = ?
      WHERE id = ?`,
      [
        getField(data, "name").trim(),
        getField(data, "code").trim(),
        getField(data, "barcode").trim() || null,
        getField(data, "category_id").trim(),
        getField(data, "brand_id").trim() || null,
        getField(data, "unit_id").trim(),
        getField(data, "warehouse_id").trim() || null,
        Number(getField(data, "cost")) || 0,
        Number(getField(data, "price")) || 0,
        Number(getField(data, "stock")) || 0,
        Number(getField(data, "alert_quantity")) || 0,
        getField(data, "description").trim() || null,
        getField(data, "status") || "active",
        imagePath,
        id
      ]
    )

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error updating product:", error)
    const message = error instanceof Error ? error.message : "Unknown error occurred while updating product"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
} 