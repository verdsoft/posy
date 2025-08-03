import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || '1970-01-01';
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const searchTerm = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const conn = await getConnection();
    try {
        const searchQuery = `%${searchTerm}%`;

        const [[{ total }]] : any = await conn.query(
            `SELECT COUNT(*) as total FROM sales_returns sr
             LEFT JOIN customers c ON sr.customer_id = c.id
             WHERE sr.paid > 0 AND sr.date BETWEEN ? AND ? AND (sr.reference LIKE ? OR c.name LIKE ?)`,
            [from, to, searchQuery, searchQuery]
        );

        const [rows]: any = await conn.query(
            `SELECT 
                sr.id,
                sr.date,
                sr.reference as sale_return_reference,
                sr.paid as amount,
                sr.payment_status as payment_method,
                c.name as customer_name
             FROM sales_returns sr
             LEFT JOIN customers c ON sr.customer_id = c.id
             WHERE sr.paid > 0 AND sr.date BETWEEN ? AND ? AND (sr.reference LIKE ? OR c.name LIKE ?)
             ORDER BY sr.date DESC
             LIMIT ? OFFSET ?`,
            [from, to, searchQuery, searchQuery, limit, offset]
        );

        const data = rows.map((row: any) => ({
            ...row,
            reference: `PAY-${row.sale_return_reference}`,
        }));

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages,
                nextPage: page < totalPages ? page + 1 : null,
                prevPage: page > 1 ? page - 1 : null,
            }
        });
    } catch (error) {
        console.error('Failed to fetch sales return payments:', error);
        return NextResponse.json({ error: 'Failed to fetch sales return payments.' }, { status: 500 });
    }
}
