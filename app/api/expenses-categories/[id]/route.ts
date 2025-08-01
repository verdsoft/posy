import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/mysql";
import type { FieldPacket } from "mysql2";
import type { ExpenseCategory } from "@/lib/types/index";

// GET: Get a single expense category
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await getConnection();
  const [categories]: [any[], FieldPacket[]] = await conn.query(
    `SELECT * FROM expense_categories WHERE id = ?`,
    [id]
  );
  if (categories.length === 0) {
    return NextResponse.json({ error: "Expense category not found" }, { status: 404 });
  }
  return NextResponse.json(categories[0]);
}

// PUT: Update an expense category
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const conn = await getConnection();
  await conn.execute(
    `UPDATE expense_categories SET name=?, description=?, updated_at=NOW() WHERE id=?`,
    [
      body.name,
      body.description || null,
      id
    ]
  );
  return NextResponse.json({ success: true });
}

// DELETE: Remove an expense category
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await getConnection();
  await conn.execute(`DELETE FROM expense_categories WHERE id = ?`, [id]);
  return NextResponse.json({ success: true });
} 