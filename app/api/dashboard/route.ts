import { NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import type { FieldPacket } from "mysql2"

export async function GET() {
  const pool = getConnection()
  let conn

  try {
    conn = await pool.getConnection()
    const [rows]: [any[], FieldPacket[]] = await conn.query(`
      SELECT 
        (SELECT COUNT(*) FROM customers WHERE status = 'active') AS total_customers,
        (SELECT COUNT(*) FROM suppliers WHERE status = 'active') AS total_suppliers,
        (SELECT COUNT(*) FROM employees WHERE status = 'active') AS total_employees,
        (SELECT COUNT(*) FROM products WHERE status = 'active') AS total_products,

        (SELECT IFNULL(SUM(total), 0) FROM sales WHERE status = 'completed') AS total_sales,
        (SELECT IFNULL(SUM(total), 0) FROM purchases WHERE status = 'received') AS total_purchases,
        (SELECT IFNULL(SUM(amount), 0) FROM expenses WHERE status = 'approved') AS total_expenses,

        (SELECT COUNT(*) FROM sales WHERE DATE(created_at) = CURDATE()) AS todays_sales,
        (SELECT COUNT(*) FROM purchases WHERE DATE(created_at) = CURDATE()) AS todays_purchases,
        (SELECT COUNT(*) FROM expenses WHERE DATE(created_at) = CURDATE()) AS todays_expenses
    `)

    return NextResponse.json(rows[0])
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}
