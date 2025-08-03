import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import formidable from "formidable"
import fs from "fs"
import path from "path"

import type { Fields, Files, File } from "formidable"
import type { RowDataPacket, FieldPacket } from "mysql2"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const config = {
  api: {
    bodyParser: false,
  },
}

const parseForm = (req: NextRequest): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: "./public/uploads",
      keepExtensions: true,
      maxFileSize: 4 * 1024 * 1024, // 4MB
    })

    form.parse(req as any, (err, fields, files) => {
      if (err) return reject(err)
      resolve({ fields, files })
    })
  })
}

const getField = (fields: Fields, fieldName: string) => {
  const field = fields[fieldName]
  return Array.isArray(field) ? field[0] : field || ""
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

    if (!id) {
      return NextResponse.json
      ({ error: "Product ID is required" }, { status: 400 })
    }

    const { fields, files } = await parseForm(req)
    const imageFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null
    let imagePath = getField(fields, 'image_path') || null

    if (imageFile) {
        imagePath = `/uploads/${path.basename(imageFile.filepath)}`
    }
    
    const requiredFields = ["name", "code", "category_id", "unit_id", "cost", "price"]
    const missingFields = requiredFields.filter((field) => !fields[field])
    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }
    
    await conn.execute(
      `UPDATE products SET
          name = ?, code = ?, barcode = ?, category_id = ?, brand_id = ?, unit_id = ?, warehouse_id = ?, 
          cost = ?, price = ?, stock = ?, alert_quantity = ?, description = ?, status = ?, image = ?
         WHERE id = ?`,
      [
        getField(fields, "name").trim(),
        getField(fields, "code").trim(),
        getField(fields, "barcode").trim() || null,
        getField(fields, "category_id").trim(),
        getField(fields, "brand_id").trim() || null,
        getField(fields, "unit_id").trim(),
        getField(fields, "warehouse_id").trim() || null,
        Number(getField(fields, "cost")) || 0,
        Number(getField(fields, "price")) || 0,
        Number(getField(fields, "stock")) || 0,
        Number(getField(fields, "alert_quantity")) || 0,
        getField(fields, "description").trim() || null,
        getField(fields, "status") || "active",
        imagePath,
        id,
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

    const { fields, files } = await parseForm(req)
    const imageFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null
    const imagePath = imageFile ? `/uploads/${path.basename(imageFile.filepath)}` : null

    const requiredFields = ["name", "code", "category_id", "unit_id", "cost", "price"]
    const missingFields = requiredFields.filter((field) => !fields[field])
    if (missingFields.length > 0) {
      return NextResponse.json({ error: `Missing required fields: ${missingFields.join(", ")}` }, { status: 400 })
    }

    await conn.execute(
      `INSERT INTO products
          (name, code, barcode, category_id, brand_id, unit_id, warehouse_id, cost, price, stock, alert_quantity, description, status, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        getField(fields, "name").trim(),
        getField(fields, "code").trim(),
        getField(fields, "barcode").trim() || null,
        getField(fields, "category_id").trim(),
        getField(fields, "brand_id").trim() || null,
        getField(fields, "unit_id").trim(),
        getField(fields, "warehouse_id").trim() || null,
        Number(getField(fields, "cost")) || 0,
        Number(getField(fields, "price")) || 0,
        Number(getField(fields, "stock")) || 0,
        Number(getField(fields, "alert_quantity")) || 0,
        getField(fields, "description").trim() || null,
        getField(fields, "status") || "active",
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
