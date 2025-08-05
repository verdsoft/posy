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

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;
    const existingImagePath = formData.get("existingImage") as string | null;

    console.log("Image file received:", imageFile ? imageFile.name : "No image");
    console.log("Existing image path:", existingImagePath);

    // Convert other form data to object
    const data: Record<string, any> = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'image' && key !== 'existingImage') {
        data[key] = value;
      }
    }

    const conn = await getConnection();
    
    // Get current image path from DB
    const [current]: [RowDataPacket[], FieldPacket[]] = await conn.query(
      'SELECT image FROM products WHERE id = ?',
      [id]
    );
    
    if (current.length === 0) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    const currentImage = current[0]?.image;
    let newImagePath = currentImage;

    // Process new image if provided
    if (imageFile && imageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileExtension = path.extname(imageFile.name);
      const fileName = `${Date.now()}${fileExtension}`;
      const filePath = path.join(uploadDir, fileName);

      // Convert File to Buffer and save
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fs.writeFileSync(filePath, buffer);
      
      newImagePath = `/uploads/${fileName}`;
      console.log("New image saved at:", newImagePath);

      // Delete old image if exists
      if (currentImage && currentImage !== newImagePath) {
        const oldImagePath = path.join(process.cwd(), 'public', currentImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    } else if (existingImagePath) {
      // Keep existing image if no new image was uploaded
      newImagePath = existingImagePath;
    } else {
      // No image provided and no existing image - set to null
      newImagePath = null;
    }

    // Update product
    await conn.execute(
      `UPDATE products SET
        name = ?, code = ?, barcode = ?, category_id = ?, brand_id = ?,
        unit_id = ?, warehouse_id = ?, cost = ?, price = ?, stock = ?,
        alert_quantity = ?, description = ?, status = ?, image = ?
      WHERE id = ?`,
      [
        data.name?.toString().trim() || '',
        data.code?.toString().trim() || '',
        data.barcode?.toString().trim() || null,
        data.category_id?.toString().trim() || '',
        data.brand_id?.toString().trim() || null,
        data.unit_id?.toString().trim() || '',
        data.warehouse_id?.toString().trim() || null,
        Number(data.cost) || 0,
        Number(data.price) || 0,
        Number(data.stock) || 0,
        Number(data.alert_quantity) || 0,
        data.description?.toString().trim() || null,
        data.status?.toString() || "active",
        newImagePath,
        id
      ]
    );

    return NextResponse.json({ success: true, imagePath: newImagePath });
  } catch (error: unknown) {
    console.error("Error updating product:", error);
    const message = error instanceof Error ? error.message : "Unknown error occurred while updating product";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}