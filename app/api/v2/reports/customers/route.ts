import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || '1970-01-01';
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const offset = (page - 1) * limit;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get customers with their sales data in the date range
    const customers = await prisma.customers.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        created_at: true,
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
      },
      skip: offset,
      take: limit,
      orderBy: {
        created_at: 'desc'
      }
    });

    // Transform the data to include aggregated sales info
    const customersWithStats = customers.map(customer => {
      const totalSales = customer.sales.reduce((sum, sale) => sum + Number(sale.total), 0);
      const totalPaid = customer.sales.reduce((sum, sale) => sum + Number(sale.paid), 0);
      const totalDue = totalSales - totalPaid;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        country: customer.country,
        created_at: customer.created_at,
        total_sales: customer.sales.length,
        total_paid: totalPaid,
        total_due: totalDue
      };
    });

    // Sort by total sales count descending
    customersWithStats.sort((a, b) => b.total_sales - a.total_sales);

    const total = await prisma.customers.count();

    return NextResponse.json({
      data: customersWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch customer report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer report data.' },
      { status: 500 }
    );
  }
}
