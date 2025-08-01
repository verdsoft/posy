import { NextRequest, NextResponse } from "next/server";
import { getConnection } from "@/lib/mysql";
import type { FieldPacket } from "mysql2";
import type { Expense } from "@/lib/types/index";

// GET: Get a single expense
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await getConnection();
  const [expenses]: [any[], FieldPacket[]] = await conn.query(
    `SELECT * FROM expenses WHERE id = ?`,
    [id]
  );
  if (expenses.length === 0) {
    return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  }
  return NextResponse.json(expenses[0]);
}

// PUT: Update an expense
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const conn = await getConnection();
  await conn.execute(
    `UPDATE expenses SET category_id=?, amount=?, date=?, description=?, status=?, updated_at=NOW() WHERE id=?`,
    [
      body.category_id,
      body.amount,
      body.date,
      body.description || null,
      body.status || 'pending',
      id
    ]
  );
  return NextResponse.json({ success: true });
}

// DELETE: Remove an expense
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const conn = await getConnection();
  await conn.execute(`DELETE FROM expenses WHERE id = ?`, [id]);
  return NextResponse.json({ success: true });
}