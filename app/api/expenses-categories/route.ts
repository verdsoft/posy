import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/mysql";
import type { FieldPacket } from "mysql2";
import type { ExpenseCategory } from "@/lib/types/index";

// GET: List all expense categories
export async function GET() {
  const conn = await getConnection();
  const [categories]: [any[], FieldPacket[]] = await conn.query(
    `SELECT * FROM expense_categories`
  );
  return NextResponse.json(categories);
}

// POST: Create a new expense category
export async function POST(req: NextRequest) {
  const body = await req.json();
  const conn = await getConnection();
  await conn.execute(
    `INSERT INTO expense_categories (id, name, description, status, created_at, updated_at)
     VALUES (UUID(), ?, ?, 'active', NOW(), NOW())`,
    [body.name, body.description || null]
  );
  return NextResponse.json({ success: true });
}