import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || '1970-01-01';
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = (page - 1) * limit;

    const fromDate = new Date(from);
    const toDate = new Date(to);

    const where = {
      date: {
        gte: fromDate,
        lte: toDate
      }
    };

    const [sales, total] = await Promise.all([
      prisma.sales.findMany({
        where,
        include: {
          customers: {
            select: { name: true }
          },
          warehouses: {
            select: { name: true }
          }
        },
        orderBy: { date: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.sales.count({ where })
    ]);

    return NextResponse.json({
      data: sales,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch sales report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales report data.' },
      { status: 500 }
    );
  }
}
