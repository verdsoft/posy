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
            `SELECT COUNT(*) as total FROM purchases p
             LEFT JOIN suppliers s ON p.supplier_id = s.id
             WHERE p.paid > 0 AND p.date BETWEEN ? AND ? AND (p.reference LIKE ? OR s.name LIKE ?)`,
            [from, to, searchQuery, searchQuery]
        );

        // Get paginated data
        const [rows]: any = await conn.query(
            `SELECT 
                p.id,
                p.date,
                p.reference as purchase_reference,
                p.paid as amount,
                p.payment_status as payment_method,
                s.name as supplier_name
             FROM purchases p
             LEFT JOIN suppliers s ON p.supplier_id = s.id
             WHERE p.paid > 0 AND p.date BETWEEN ? AND ? AND (p.reference LIKE ? OR s.name LIKE ?)
             ORDER BY p.date DESC
             LIMIT ? OFFSET ?`,
            [from, to, searchQuery, searchQuery, limit, offset]
        );

        // Simulate a payment reference
        const data = rows.map((row: any) => ({
            ...row,
            reference: `PAY-${row.purchase_reference}`,
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
        console.error('Failed to fetch purchase payments:', error);
        return NextResponse.json({ error: 'Failed to fetch purchase payments.' }, { status: 500 });
    }
}
