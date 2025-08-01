import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"

export async function GET() {
  const conn = await getConnection()
  try {
    const [rows]: any = await conn.query(
      "SELECT id, name, email, phone, country, city, address FROM suppliers ORDER BY name ASC"
    )
    
    return NextResponse.json(rows)
  } catch (error: any) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } 
}

export async function POST(request: NextRequest) {
  const conn = await getConnection()
  try {
    const body = await request.json()
    const { name, email, phone, country, city, address } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      )
    }

    const [result]: any = await conn.query(
      "INSERT INTO suppliers (name, email, phone, country, city, address) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, phone || null, country || null, city || null, address || null]
    )

    const [newSupplier]: any = await conn.query(
      "SELECT id, name, email, phone, country, city, address FROM suppliers WHERE id = ?",
      [result.insertId]
    )

    return NextResponse.json(newSupplier[0], { status: 201 })
  } catch (error: any) {
    console.error("Error creating supplier:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } 
}

export async function PUT(request: NextRequest) {
  const conn = await getConnection()
  try {
    const body = await request.json()
    const { id, name, email, phone, country, city, address } = body

    if (!id || !name || !email) {
      return NextResponse.json(
        { error: "ID, name and email are required" },
        { status: 400 }
      )
    }

    await conn.query(
      "UPDATE suppliers SET name = ?, email = ?, phone = ?, country = ?, city = ?, address = ? WHERE id = ?",
      [name, email, phone || null, country || null, city || null, address || null, id]
    )

    const [updatedSupplier]: any = await conn.query(
      "SELECT id, name, email, phone, country, city, address FROM suppliers WHERE id = ?",
      [id]
    )

    return NextResponse.json(updatedSupplier[0])
  } catch (error: any) {
    console.error("Error updating supplier:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } 
}

export async function DELETE(request: NextRequest) {
  const conn = await getConnection()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      )
    }

    // Check if supplier exists
    const [existingSupplier]: any = await conn.query(
      "SELECT id FROM suppliers WHERE id = ?",
      [id]
    )

    if (existingSupplier.length === 0) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      )
    }

    await conn.query("DELETE FROM suppliers WHERE id = ?", [id])

    return NextResponse.json({ message: "Supplier deleted successfully" })
  } catch (error: any) {
    console.error("Error deleting supplier:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  } 
}