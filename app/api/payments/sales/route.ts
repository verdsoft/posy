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

        // Get total count for pagination
        const [[{ total }]] : any = await conn.query(
            `SELECT COUNT(*) as total FROM sales s
             LEFT JOIN customers c ON s.customer_id = c.id
             WHERE s.paid > 0 AND s.date BETWEEN ? AND ? AND (s.reference LIKE ? OR c.name LIKE ?)`,
            [from, to, searchQuery, searchQuery]
        );

        // Get paginated data
        const [rows]: any = await conn.query(
            `SELECT 
                s.id,
                s.date,
                s.reference as sale_reference,
                s.paid as amount,
                s.payment_status as payment_method,
                c.name as customer_name
             FROM sales s
             LEFT JOIN customers c ON s.customer_id = c.id
             WHERE s.paid > 0 AND s.date BETWEEN ? AND ? AND (s.reference LIKE ? OR c.name LIKE ?)
             ORDER BY s.date DESC
             LIMIT ? OFFSET ?`,
            [from, to, searchQuery, searchQuery, limit, offset]
        );

        // Simulate a payment reference
        const data = rows.map((row: any) => ({
            ...row,
            reference: `PAY-${row.sale_reference}`,
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
        console.error('Failed to fetch sales payments:', error);
        return NextResponse.json({ error: 'Failed to fetch sales payments.' }, { status: 500 });
    }
}
