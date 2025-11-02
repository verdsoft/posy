import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threshold = parseInt(searchParams.get('threshold') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = (page - 1) * limit;

    const where = {
      stock: {
        lte: threshold
      }
    };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          stock: true,
          price: true,
          cost: true,
          alert_quantity: true,
          categories: {
            select: { name: true }
          },
          brands: {
            select: { name: true }
          },
          units: {
            select: { name: true }
          }
        },
        orderBy: { stock: 'asc' },
        skip: offset,
        take: limit
      }),
      prisma.products.count({ where })
    ]);

    const productsWithDetails = products.map(product => ({
      ...product,
      category_name: product.categories?.name || 'N/A',
      brand_name: product.brands?.name || 'N/A',
      unit_name: product.units?.name || 'N/A'
    }));

    return NextResponse.json({
      data: productsWithDetails,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch quantity alerts report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quantity alerts report data.' },
      { status: 500 }
    );
  }
}
