import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import formidable from "formidable"
import fs from "fs"
import path from "path"

import type { Fields, Files, File } from "formidable"
import type { RowDataPacket,FieldPacket} from "mysql2"


export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export const config = {
  api: {
    bodyParser: false,
  },
}


import { Readable } from "stream"
import { IncomingMessage } from "http"


export function parseForm(req: NextRequest): Promise<{ fields: Fields; files: Files }> {
  return new Promise((resolve, reject) => {
    const run = async () => {
      const reader = req.body?.getReader()
      const chunks: Uint8Array[] = []

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break
        if (value) chunks.push(value)
      }

      const buffer = Buffer.concat(chunks)

      // Cast to IncomingMessage-like object
      const stream = new Readable() as Readable & IncomingMessage
      stream.push(buffer)
      stream.push(null)
      stream.headers = Object.fromEntries(req.headers.entries())

      const form = formidable({
        multiples: false,
        uploadDir: "./public/uploads",
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024,
        filter: ({ mimetype }) => !!mimetype?.includes("image"),
      })

      form.parse(stream, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    }

    run().catch(reject)
  })
}


function getField(fields: Fields, key: string) {
  const val = fields[key]
  if (Array.isArray(val)) return (val[0] ?? "").toString()
  return (val ?? "").toString()
}

// GET: Get product(s)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    const conn = await getConnection()
    
    if (id) {
      // Single product request
      const [rows]: [RowDataPacket[], FieldPacket[]] = await conn.query(`
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
      `, [id])

     
      
      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        )
      }
      
      return NextResponse.json(rows[0])
    } else {
      // List all products
      const [rows]: [RowDataPacket[], FieldPacket[]] = await conn.query(`
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

// PUT: Update a product
export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    // Check content type
    const contentType = req.headers.get('content-type')
    const isFormData = contentType?.includes('multipart/form-data')

    let data: Fields = {}
    let imageFile: File | null = null

    if (isFormData) {
      // Handle form data with file upload
      const uploadDir = "./public/uploads"
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const { fields, files } = await parseForm(req)
      data = fields
      imageFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null
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
    try {
      // Get current image path
      const [current]: [RowDataPacket[],FieldPacket[]]= await conn.query(
        'SELECT image FROM products WHERE id = ?',
        [id]
      )
      const currentImage = current[0]?.image

      let imagePath = currentImage
      
      // Process new image if uploaded
      if (imageFile) {
        // Delete old image if exists
        if (currentImage) {
          const oldImagePath = path.join(process.cwd(), 'public', currentImage)
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath)
          }
        }
        
        // Set new image path
        imagePath = `/uploads/${path.basename(imageFile.filepath)}`
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
    } finally {
     
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Product update error:", error)
    return NextResponse.json(
      { error: message || "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE: Delete a product
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const conn = await getConnection()
    try {
      // First get the product to check for image
      const [product]: [RowDataPacket[],FieldPacket[]] = await conn.query(
        'SELECT image FROM products WHERE id = ?',
        [id]
      )
      
      // Delete the product
      await conn.execute(
        'DELETE FROM products WHERE id = ?',
        [id]
      )

      // Delete associated image file if exists
      if (product[0]?.image) {
        const imagePath = path.join(process.cwd(), 'public', product[0].image)
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath)
        }
      }

      return NextResponse.json({ success: true })
    } finally {
     
    }
  } catch (error: unknown) {
    console.error("Product deletion error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: message  },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const uploadDir = "./public/uploads"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    const { fields, files } = await parseForm(req)
    const imageFile = files.image ? (Array.isArray(files.image) ? files.image[0] : files.image) : null
    const imagePath = imageFile ? `/uploads/${path.basename(imageFile.filepath)}` : null

    // Validate required fields
    const requiredFields = ["name", "code", "category_id", "unit_id", "cost", "price"]
    const missingFields = requiredFields.filter(field => !fields[field])
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      )
    }

    const conn = await getConnection()
    try {
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
          imagePath
        ]
      )
      return NextResponse.json({ success: true })
    } finally {
     
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}