import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import bcrypt from "bcryptjs"

// CREATE user (POST)
export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const conn = await getConnection()
    // Check if user exists
    const [rows]: any = await conn.query("SELECT id FROM users WHERE email = ?", [email])
    if (rows.length > 0) {
      
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [result]: any = await conn.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    )
    const [userRows]: any = await conn.query("SELECT id, name, email, role FROM users WHERE id = ?", [result.insertId])
    

    return NextResponse.json({
      user: userRows[0],
      token: "mock-jwt-token", // Replace with real JWT in production
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// READ users (GET)
export async function GET() {
  try {
    const conn = await getConnection()
    const [rows]: any = await conn.query("SELECT id, name, email, role, status FROM users")
    
    return NextResponse.json(rows)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// UPDATE user (PUT)
export async function PUT(req: NextRequest) {
  try {
    const { id, name, email, password, role, status } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    const conn = await getConnection()
    let query = "UPDATE users SET "
    const params: any[] = []
    if (name) { query += "name=?, "; params.push(name) }
    if (email) { query += "email=?, "; params.push(email) }
    if (role) { query += "role=?, "; params.push(role) }
    if (status) { query += "status=?, "; params.push(status) }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10)
      query += "password=?, "
      params.push(hashedPassword)
    }
    // Remove trailing comma and space
    query = query.replace(/, $/, " ")
    query += "WHERE id=?"
    params.push(id)

    await conn.execute(query, params)
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE user (DELETE)
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }
    const conn = await getConnection()
    await conn.execute("DELETE FROM users WHERE id = ?", [id])
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}