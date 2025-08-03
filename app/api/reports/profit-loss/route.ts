import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || '1970-01-01';
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

    const conn = await getConnection();

    try {
        const [salesData]: any = await conn.query(
            `SELECT COUNT(*) as count, SUM(total) as total FROM sales WHERE date BETWEEN ? AND ?`,
            [from, to]
        );
        const [purchasesData]: any = await conn.query(
            `SELECT COUNT(*) as count, SUM(total) as total FROM purchases WHERE date BETWEEN ? AND ?`,
            [from, to]
        );
        const [salesReturnsData]: any = await conn.query(
            `SELECT COUNT(*) as count, SUM(total) as total FROM sales_returns WHERE date BETWEEN ? AND ?`,
            [from, to]
        );
        const [purchaseReturnsData]: any = await conn.query(
            `SELECT COUNT(*) as count, SUM(total) as total FROM purchase_returns WHERE date BETWEEN ? AND ?`,
            [from, to]
        );
        const [expensesData]: any = await conn.query(
            `SELECT SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ?`,
            [from, to]
        );

        const sales = { count: Number(salesData[0].count) || 0, total: Number(salesData[0].total) || 0 };
        const purchases = { count: Number(purchasesData[0].count) || 0, total: Number(purchasesData[0].total) || 0 };
        const salesReturns = { count: Number(salesReturnsData[0].count) || 0, total: Number(salesReturnsData[0].total) || 0 };
        const purchaseReturns = { count: Number(purchaseReturnsData[0].count) || 0, total: Number(purchaseReturnsData[0].total) || 0 };
        const expenses = { total: Number(expensesData[0].total) || 0 };

        const received = sales.total - salesReturns.total;
        const sent = purchases.total - purchaseReturns.total + expenses.total;
        
        const profit = sales.total - purchases.total - expenses.total;
        const paymentsNet = received - sent;


        return NextResponse.json({
            sales,
            purchases,
            salesReturns,
            purchaseReturns,
            expenses,
            payments: { received, sent },
            profit,
            paymentsNet
        });
    } catch (error) {
        console.error('Failed to fetch profit and loss data:', error);
        return NextResponse.json({ error: 'Failed to fetch profit and loss data.' }, { status: 500 });
    }
}
