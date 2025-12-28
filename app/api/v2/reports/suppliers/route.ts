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

    // Get suppliers with their purchases data in the date range
    const suppliers = await prisma.suppliers.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        country: true,
        created_at: true,
        purchases: {
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

    // Transform the data to include aggregated purchases info
    const suppliersWithStats = suppliers.map(supplier => {
      const totalPurchases = supplier.purchases.reduce((sum, purchase) => sum + Number(purchase.total), 0);
      const totalPaid = supplier.purchases.reduce((sum, purchase) => sum + Number(purchase.paid), 0);
      const totalDue = totalPurchases - totalPaid;

      return {
        id: supplier.id,
        name: supplier.name,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        city: supplier.city,
        country: supplier.country,
        created_at: supplier.created_at,
        total_purchases: supplier.purchases.length,
        total_paid: totalPaid,
        total_due: totalDue
      };
    });

    // Sort by total purchases count descending
    suppliersWithStats.sort((a, b) => b.total_purchases - a.total_purchases);

    const total = await prisma.suppliers.count();

    return NextResponse.json({
      data: suppliersWithStats,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch supplier report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplier report data.' },
      { status: 500 }
    );
  }
}
