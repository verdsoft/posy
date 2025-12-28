import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET: List all brands
export async function GET() {
  try {
    const brands = await prisma.brands.findMany({
      orderBy: { created_at: 'desc' }
    })
    return NextResponse.json(brands)
  } catch (error: any) {
    console.error("Error fetching brands:", error)
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 })
  }
}

// POST: Create a new brand
export async function POST(req: NextRequest) {
  try {
    const { name, description } = await req.json()
    if (!name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const brand = await prisma.brands.create({
      data: {
        name,
        description: description || null
      }
    })

    return NextResponse.json(brand)
  } catch (error: any) {
    console.error("Error creating brand:", error)
    return NextResponse.json({ error: "Failed to create brand" }, { status: 500 })
  }
}

// PUT: Update a brand
export async function PUT(req: NextRequest) {
  try {
    const { id, name, description } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    const brand = await prisma.brands.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description: description || null,
        updated_at: new Date()
      }
    })

    return NextResponse.json(brand)
  } catch (error: any) {
    console.error("Error updating brand:", error)
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 })
  }
}

// DELETE: Delete a brand
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

    await prisma.brands.delete({
      where: { id: parseInt(id) }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting brand:", error)
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 })
  }
}
