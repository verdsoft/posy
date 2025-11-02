import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'list') {
      // List available backups
      const backupDir = path.join(process.cwd(), 'backups');

      if (!fs.existsSync(backupDir)) {
        return NextResponse.json({ data: [] });
      }

      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.json'))
        .map(file => {
          const stats = fs.statSync(path.join(backupDir, file));
          return {
            name: file,
            size: stats.size,
            created_at: stats.birthtime,
            modified_at: stats.mtime
          };
        })
        .sort((a, b) => b.modified_at.getTime() - a.modified_at.getTime());

      return NextResponse.json({ data: files });
    }

    if (action === 'download') {
      const filename = searchParams.get('filename');
      if (!filename) {
        return NextResponse.json(
          { error: 'Filename is required' },
          { status: 400 }
        );
      }

      const backupPath = path.join(process.cwd(), 'backups', filename);
      if (!fs.existsSync(backupPath)) {
        return NextResponse.json(
          { error: 'Backup file not found' },
          { status: 404 }
        );
      }

      const fileContent = fs.readFileSync(backupPath, 'utf-8');
      return new NextResponse(fileContent, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${filename}"`
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to process backup request:', error);
    return NextResponse.json(
      { error: 'Failed to process backup request' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    if (action === 'create') {
      // Create a new backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `backup-${timestamp}.json`;
      const backupDir = path.join(process.cwd(), 'backups');

      // Create backups directory if it doesn't exist
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Get all data from database
      const [
        products,
        customers,
        suppliers,
        categories,
        brands,
        units,
        warehouses,
        sales,
        purchases,
        invoices,
        quotations,
        expenses
      ] = await Promise.all([
        prisma.products.findMany(),
        prisma.customers.findMany(),
        prisma.suppliers.findMany(),
        prisma.categories.findMany(),
        prisma.brands.findMany(),
        prisma.units.findMany(),
        prisma.warehouses.findMany(),
        prisma.sales.findMany({ include: { sale_items: true } }),
        prisma.purchases.findMany({ include: { purchase_items: true } }),
        prisma.invoices.findMany({ include: { invoice_items: true } }),
        prisma.quotations.findMany({ include: { quotation_items: true } }),
        prisma.expenses.findMany()
      ]);

      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          products,
          customers,
          suppliers,
          categories,
          brands,
          units,
          warehouses,
          sales,
          purchases,
          invoices,
          quotations,
          expenses
        }
      };

      const backupPath = path.join(backupDir, filename);
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));

      return NextResponse.json({
        message: 'Backup created successfully',
        filename,
        size: fs.statSync(backupPath).size
      });
    }

    if (action === 'restore') {
      const body = await req.json();
      const filename = body.filename;

      if (!filename) {
        return NextResponse.json(
          { error: 'Filename is required' },
          { status: 400 }
        );
      }

      const backupPath = path.join(process.cwd(), 'backups', filename);
      if (!fs.existsSync(backupPath)) {
        return NextResponse.json(
          { error: 'Backup file not found' },
          { status: 404 }
        );
      }

      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

      // Note: Restore is complex and should be handled carefully in production
      // This is a simplified version
      return NextResponse.json({
        message: 'Restore functionality requires careful implementation',
        warning: 'This would overwrite existing data'
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Failed to process backup action:', error);
    return NextResponse.json(
      { error: 'Failed to process backup action' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { error: 'Filename is required' },
        { status: 400 }
      );
    }

    const backupPath = path.join(process.cwd(), 'backups', filename);
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json(
        { error: 'Backup file not found' },
        { status: 404 }
      );
    }

    fs.unlinkSync(backupPath);

    return NextResponse.json({
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Failed to delete backup:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}
