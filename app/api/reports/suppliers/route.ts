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
                s.*,
                COUNT(p.id) as total_purchases,
                SUM(p.paid) as total_paid,
                SUM(p.total - p.paid) as total_due
             FROM suppliers s
             LEFT JOIN purchases p ON s.id = p.supplier_id AND p.date BETWEEN ? AND ?
             GROUP BY s.id
             ORDER BY total_purchases DESC`,
             [from, to]
        );
        return NextResponse.json(rows);
    } catch (error) {
        console.error('Failed to fetch supplier report data:', error);
        return NextResponse.json({ error: 'Failed to fetch supplier report data.' }, { status: 500 });
    }
}
