import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || '1970-01-01';
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get customers with their sales totals
    const customers = await prisma.customers.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        sales: {
          where: {
            date: {
              gte: fromDate,
              lte: toDate
            }
          },
          select: {
            total: true,
            paid: true
          }
        }
      }
    });

    // Calculate totals and sort by total sales
    const customersWithTotals = customers
      .map(customer => {
        const totalSales = customer.sales.reduce((sum, sale) => sum + Number(sale.total), 0);
        const totalPaid = customer.sales.reduce((sum, sale) => sum + Number(sale.paid), 0);
        const totalDue = totalSales - totalPaid;

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          sales_count: customer.sales.length,
          total_sales: totalSales,
          total_paid: totalPaid,
          total_due: totalDue
        };
      })
      .filter(customer => customer.total_sales > 0)
      .sort((a, b) => b.total_sales - a.total_sales)
      .slice(0, limit);

    return NextResponse.json({
      data: customersWithTotals
    });
  } catch (error) {
    console.error('Failed to fetch best customers report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch best customers report data.' },
      { status: 500 }
    );
  }
}
