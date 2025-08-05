import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/mysql";
import type { FieldPacket } from "mysql2";
import type { Expense } from "@/lib/types/index";

// GET: List all expenses
export async function GET(req: NextRequest) {
  const pool = getConnection();
  let conn;
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const offset = (page - 1) * limit;

  try {
    conn = await pool.getConnection();
    const searchQuery = `WHERE e.reference LIKE ? OR ec.name LIKE ?`;

    const [expenses]: [any[], FieldPacket[]] = await conn.query(
      `SELECT e.*, ec.name as category_name 
       FROM expenses e 
       LEFT JOIN expense_categories ec ON e.category_id = ec.id
       ${search ? searchQuery : ''}
       LIMIT ? OFFSET ?`,
      search ? [`%${search}%`, `%${search}%`, limit, offset] : [limit, offset]
    );

    const [totalRows]: [RowDataPacket[], FieldPacket[]] = await conn.query(
      `SELECT COUNT(*) as total FROM expenses e LEFT JOIN expense_categories ec ON e.category_id = ec.id ${search ? searchQuery : ''}`,
      search ? [`%${search}%`, `%${search}%`] : []
    );

    return NextResponse.json({
      data: expenses,
      pagination: {
          total: totalRows[0].total,
          page,
          limit,
          totalPages: Math.ceil(totalRows[0].total / limit),
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}

// POST: Create a new expense
export async function POST(req: NextRequest) {
  const body = await req.json();
  const pool = getConnection();
  let conn;
  
  try {
    conn = await pool.getConnection();
    await conn.execute(
      `INSERT INTO expenses (id, reference, category_id, amount, date, description, attachment, status, created_by, created_at, updated_at)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        body.reference,
        body.category_id,
        body.amount,
        body.date,
        body.description || null,
        body.attachment || null,
        body.status || 'pending',
        body.created_by || null
      ]
    );
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    if (conn) conn.release()
  }
}