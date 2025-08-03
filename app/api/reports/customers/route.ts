import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || '1970-01-01';
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

    const conn = await getConnection();
    try {
        const [rows]: any = await conn.query(
            `SELECT 
                c.*,
                COUNT(s.id) as total_sales,
                SUM(s.paid) as total_paid,
                SUM(s.total - s.paid) as total_due
             FROM customers c
             LEFT JOIN sales s ON c.id = s.customer_id AND s.date BETWEEN ? AND ?
             GROUP BY c.id
             ORDER BY total_sales DESC`,
             [from, to]
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Failed to fetch customer report data:', error);
        return NextResponse.json({ error: 'Failed to fetch customer report data.' }, { status: 500 });
    }
}
