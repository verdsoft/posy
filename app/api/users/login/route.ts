import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import bcrypt from "bcryptjs"
import { RowDataPacket,FieldPacket } from "mysql2"

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const conn = await getConnection()
    const [rows]: [RowDataPacket[],FieldPacket[]] = await conn.query("SELECT id, name, email, password, role FROM users WHERE email = ?", [email])
   
    if (rows.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    // Remove password before sending user object
    delete user.password
    return NextResponse.json({
      user,
      token: "mock-jwt-token", // Replace with real JWT in production
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}