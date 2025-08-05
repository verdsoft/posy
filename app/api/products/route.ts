import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import fs from "fs"
import path from "path"

import type { RowDataPacket, FieldPacket } from "mysql2"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const config = {
  api: {
    bodyParser: false,
  },
}

// Helper function to get field value from FormData
const getField = (formData: FormData, fieldName: string) => {
  const field = formData.get(fieldName)
  return field ? field.toString() : ""
}


// GET: Get product(s)
export async function GET(req: NextRequest) {
    const pool = getConnection();
    let conn;
    try {
        conn = await pool.getConnection();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const offset = (page - 1) * limit;

        if (id) {
            // Single product request
            const [rows]: [RowDataPacket[], FieldPacket[]] = await conn.query(
                `
                SELECT p.*,
                  c.name as category_name,
                  b.name as brand_name,
                  u.name as unit_name,
                  w.name as warehouse_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN brands b ON p.brand_id = b.id
                LEFT JOIN units u ON p.unit_id = u.id
                LEFT JOIN warehouses w ON p.warehouse_id = w.id
                WHERE p.id = ?
              `,
                [id]
            );

            if (rows.length === 0) {
                return NextResponse.json({ error: "Product not found" }, { status: 404 });
            }

            return NextResponse.json(rows[0]);
        } else {
            // List all products with pagination
            const searchQuery = `WHERE p.name LIKE ? OR p.code LIKE ?`;
            const [rows]: [RowDataPacket[], FieldPacket[]] = await conn.query(
                `
                SELECT p.*,
                  c.name as category_name,
                  b.name as brand_name,
                  u.name as unit_name,
                  w.name as warehouse_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN brands b ON p.brand_id = b.id
                LEFT JOIN units u ON p.unit_id = u.id
                LEFT JOIN warehouses w ON p.warehouse_id = w.id
                ${search ? searchQuery : ''}
                LIMIT ? OFFSET ?
              `,
                search ? [`%${search}%`, `%${search}%`, limit, offset] : [limit, offset]
            );

            const [totalRows]: [RowDataPacket[], FieldPacket[]] = await conn.query(
                `SELECT COUNT(*) as total FROM products p ${search ? searchQuery : ''}`,
                search ? [`%${search}%`, `%${search}%`] : []
            );

            return NextResponse.json({
                data: rows,
                pagination: {
                    total: totalRows[0].total,
                    page,
                    limit,
                    totalPages: Math.ceil(totalRows[0].total / limit),
                },
            });
        }
    } catch (error: unknown) {
        return NextResponse.json({ error: (error instanceof Error && error.message) || "Internal server error" }, { status: 500 });
    } finally {
        if (conn) conn.release();
    }
}

// PUT: Update a product
export async function PUT(req: NextRequest) {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    console.log("PUT request received for product ID:", id)

    if (!id) {
      return NextResponse.json
      ({ error: "Product ID is required" }, { status: 400 })
    }

    const uploadDir = "./public/uploads"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const formData = await req.formData()
    const imageFile = formData.get("image") as File | null
    let imagePath = getField(formData, 'image_path') || null

    console.log("Image file received:", imageFile ? `Size: ${imageFile.size}, Name: ${imageFile.name}` : "No image")

    if (imageFile && imageFile.size > 0) {
      // Generate unique filename
      const fileExtension = path.extname(imageFile.name)
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`
      const filePath = path.join(uploadDir, fileName)
      
      console.log("Saving image to:", filePath)
      
      // Convert File to Buffer and save
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      fs.writeFileSync(filePath, buffer)
      
      imagePath = `/uploads/${fileName}`
      console.log("Image saved successfully:", imagePath)
    }
    
    const requiredFields = ["name", "code", "category_id", "unit_id", "cost", "price"]
    const missingFields = requiredFields.filter((field) => !getField(formData, field))
    if (missingFields.length > 0) {
      console.log("Missing fields:", missingFields)
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }
    
    console.log("Updating product with data:", {
      name: getField(formData, "name"),
      code: getField(formData, "code"),
      imagePath
    })
    
    await conn.execute(
      `UPDATE products SET
          name = ?, code = ?, barcode = ?, category_id = ?, brand_id = ?, unit_id = ?, warehouse_id = ?, 
          cost = ?, price = ?, stock = ?, alert_quantity = ?, description = ?, status = ?, image = ?
         WHERE id = ?`,
      [
        getField(formData, "name").trim(),
        getField(formData, "code").trim(),
        getField(formData, "barcode").trim() || null,
        getField(formData, "category_id").trim(),
        getField(formData, "brand_id").trim() || null,
        getField(formData, "unit_id").trim(),
        getField(formData, "warehouse_id").trim() || null,
        Number(getField(formData, "cost")) || 0,
        Number(getField(formData, "price")) || 0,
        Number(getField(formData, "stock")) || 0,
        Number(getField(formData, "alert_quantity")) || 0,
        getField(formData, "description").trim() || null,
        getField(formData, "status") || "active",
        imagePath,
        id,
      ]
    )

    console.log("Product updated successfully")
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Error updating product:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

export async function DELETE(req: NextRequest) {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Check if product exists before deleting
    const [check]: [RowDataPacket[], FieldPacket[]] = await conn.query("SELECT * FROM products WHERE id = ?", [id])
    if (check.length === 0) {
      return NextResponse.json({ error: `Product with id ${id} not found.` }, { status: 404 })
    }

    const [result]: any = await conn.execute("DELETE FROM products WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: `Product with id ${id} could not be deleted.` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error("Product deletion error:", error)
    const message = error instanceof Error ? error.message : "Unknown error occurred during product deletion"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

export async function POST(req: NextRequest) {
  const pool = getConnection()
  let conn
  try {
    conn = await pool.getConnection()
    const uploadDir = "./public/uploads"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const formData = await req.formData()
    const imageFile = formData.get("image") as File | null
    let imagePath = null

    if (imageFile && imageFile.size > 0) {
      // Generate unique filename
      const fileExtension = path.extname(imageFile.name)
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`
      const filePath = path.join(uploadDir, fileName)
      
      // Convert File to Buffer and save
      const bytes = await imageFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      fs.writeFileSync(filePath, buffer)
      
      imagePath = `/uploads/${fileName}`
    }

    const requiredFields = ["name", "code", "category_id", "unit_id", "cost", "price"]
    const missingFields = requiredFields.filter((field) => !getField(formData, field))
    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    await conn.execute(
      `INSERT INTO products
          (name, code, barcode, category_id, brand_id, unit_id, warehouse_id, cost, price, stock, alert_quantity, description, status, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        getField(formData, "name").trim(),
        getField(formData, "code").trim(),
        getField(formData, "barcode").trim() || null,
        getField(formData, "category_id").trim(),
        getField(formData, "brand_id").trim() || null,
        getField(formData, "unit_id").trim(),
        getField(formData, "warehouse_id").trim() || null,
        Number(getField(formData, "cost")) || 0,
        Number(getField(formData, "price")) || 0,
        Number(getField(formData, "stock")) || 0,
        Number(getField(formData, "alert_quantity")) || 0,
        getField(formData, "description").trim() || null,
        getField(formData, "status") || "active",
        imagePath,
      ]
    )
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}
