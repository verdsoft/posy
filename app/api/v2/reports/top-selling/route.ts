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

    // Get sale items within date range with product details
    const saleItems = await prisma.sale_items.findMany({
      where: {
        sales: {
          date: {
            gte: fromDate,
            lte: toDate
          }
        }
      },
      select: {
        product_id: true,
        quantity: true,
        subtotal: true,
        products: {
          select: {
            id: true,
            name: true,
            code: true,
            price: true,
            stock: true,
            categories: {
              select: { name: true }
            },
            brands: {
              select: { name: true }
            }
          }
        }
      }
    });

    // Aggregate by product
    const productStats = new Map();

    saleItems.forEach(item => {
      const productId = item.product_id;
      if (!productStats.has(productId)) {
        productStats.set(productId, {
          id: item.products.id,
          name: item.products.name,
          code: item.products.code,
          price: item.products.price,
          stock: item.products.stock,
          category_name: item.products.categories?.name || 'N/A',
          brand_name: item.products.brands?.name || 'N/A',
          total_quantity: 0,
          total_sales: 0
        });
      }

      const stats = productStats.get(productId);
      stats.total_quantity += Number(item.quantity);
      stats.total_sales += Number(item.subtotal);
    });

    // Convert to array and sort by quantity sold
    const topProducts = Array.from(productStats.values())
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, limit);

    return NextResponse.json({
      data: topProducts
    });
  } catch (error) {
    console.error('Failed to fetch top-selling report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch top-selling report data.' },
      { status: 500 }
    );
  }
}
