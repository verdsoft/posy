import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from') || '1970-01-01';
    const to = searchParams.get('to') || new Date().toISOString().split('T')[0];

    const fromDate = new Date(from);
    const toDate = new Date(to);

    // Get all warehouses with their related data
    const warehouses = await prisma.warehouses.findMany({
      select: {
        id: true,
        name: true,
        location: true,
        created_at: true,
        products: {
          select: {
            stock: true,
            cost: true
          }
        },
        sales: {
          where: {
            date: {
              gte: fromDate,
              lte: toDate
            }
          },
          select: {
            total: true
          }
        },
        purchases: {
          where: {
            date: {
              gte: fromDate,
              lte: toDate
            }
          },
          select: {
            total: true
          }
        }
      }
    });

    // Transform the data to include warehouse statistics
    const warehouseStats = warehouses.map(warehouse => {
      const totalStock = warehouse.products.reduce((sum, product) => sum + Number(product.stock), 0);
      const stockValue = warehouse.products.reduce((sum, product) => sum + (Number(product.stock) * Number(product.cost)), 0);
      const totalSales = warehouse.sales.reduce((sum, sale) => sum + Number(sale.total), 0);
      const totalPurchases = warehouse.purchases.reduce((sum, purchase) => sum + Number(purchase.total), 0);

      return {
        id: warehouse.id,
        name: warehouse.name,
        location: warehouse.location,
        created_at: warehouse.created_at,
        total_products: warehouse.products.length,
        total_stock: totalStock,
        stock_value: stockValue,
        total_sales: totalSales,
        total_purchases: totalPurchases,
        sales_count: warehouse.sales.length,
        purchases_count: warehouse.purchases.length
      };
    });

    return NextResponse.json({
      data: warehouseStats
    });
  } catch (error) {
    console.error('Failed to fetch warehouse report data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warehouse report data.' },
      { status: 500 }
    );
  }
}
