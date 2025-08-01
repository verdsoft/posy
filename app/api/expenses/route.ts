import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/mysql";
import type { FieldPacket } from "mysql2";
import type { Expense } from "@/lib/types/index";

// GET: List all expenses
export async function GET(req: NextRequest) {
  const conn = await getConnection();
  const [expenses]: [any[], FieldPacket[]] = await conn.query(
    `SELECT e.*, ec.name as category_name 
     FROM expenses e 
     LEFT JOIN expense_categories ec ON e.category_id = ec.id`
  );
  return NextResponse.json(expenses);
}

// POST: Create a new expense
export async function POST(req: NextRequest) {
  const body = await req.json();
  const conn = await getConnection();
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
}