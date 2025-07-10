import { NextRequest, NextResponse } from "next/server"
import mysql from "mysql2/promise"

export async function POST(req: NextRequest) {
  try {
    const { host, port, username, password, database } = await req.json()
    const connection = await mysql.createConnection({
      host,
      port: port || 3306,
      user: username,
      password,
      database,
      connectTimeout: 3000,
    })
    await connection.ping()
    await connection.end()
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 })
  }
}