import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: List all warehouses
export async function GET() {
  try {
    const warehouses = await prisma.warehouses.findMany({
      where: { status: 'active' },
      orderBy: { created_at: 'desc' }
    })
    return NextResponse.json(warehouses)
  } catch (error: any) {
    console.error('Error fetching warehouses:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST: Create a new warehouse
export async function POST(req: NextRequest) {
  try {
    const { name, phone, country, city, email, zip_code } = await req.json()
    if (!name || !phone || !country || !city || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const warehouse = await prisma.warehouses.create({
      data: {
        name,
        phone,
        country,
        city,
        email,
        zip_code: zip_code || "",
        status: 'active'
      }
    })
    return NextResponse.json(warehouse)
  } catch (error: any) {
    console.error('Error creating warehouse:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT: Update a warehouse
export async function PUT(req: NextRequest) {
  try {
    const { id, name, phone, country, city, email, zip_code } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    const warehouse = await prisma.warehouses.update({
      where: { id: parseInt(id) },
      data: {
        name,
        phone,
        country,
        city,
        email,
        zip_code: zip_code || "",
        updated_at: new Date()
      }
    })
    return NextResponse.json(warehouse)
  } catch (error: any) {
    console.error('Error updating warehouse:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE: Delete a warehouse
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
    await prisma.warehouses.delete({
      where: { id: parseInt(id) }
    })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting warehouse:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
