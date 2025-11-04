import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const [systemTitle, systemLogo] = await Promise.all([
      prisma.settings.findUnique({ where: { key: 'system_title' } }),
      prisma.settings.findUnique({ where: { key: 'system_logo' } })
    ]);

    return NextResponse.json({
      system_title: systemTitle?.value || '',
      system_logo: systemLogo?.value || ''
    });
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system settings' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check if request has FormData or JSON
    const contentType = req.headers.get('content-type') || '';
    let system_title: string | undefined;
    let system_logo: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData (for file uploads)
      const formData = await req.formData();
      system_title = formData.get('system_title')?.toString();
      system_logo = formData.get('system_logo')?.toString();
    } else {
      // Handle JSON
      const body = await req.json();
      system_title = body.system_title;
      system_logo = body.system_logo;
    }

    // Update or create settings using upsert
    const updates = [];

    if (system_title !== undefined) {
      updates.push(
        prisma.settings.upsert({
          where: { key: 'system_title' },
          update: { value: system_title },
          create: { key: 'system_title', value: system_title }
        })
      );
    }

    if (system_logo !== undefined) {
      updates.push(
        prisma.settings.upsert({
          where: { key: 'system_logo' },
          update: { value: system_logo },
          create: { key: 'system_logo', value: system_logo }
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      system_title: system_title || '',
      system_logo: system_logo || ''
    });
  } catch (error) {
    console.error('Failed to save system settings:', error);
    return NextResponse.json(
      { error: 'Failed to save system settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { system_title, system_logo } = body;

    // Update or create settings using upsert
    const updates = [];

    if (system_title !== undefined) {
      updates.push(
        prisma.settings.upsert({
          where: { key: 'system_title' },
          update: { value: system_title },
          create: { key: 'system_title', value: system_title }
        })
      );
    }

    if (system_logo !== undefined) {
      updates.push(
        prisma.settings.upsert({
          where: { key: 'system_logo' },
          update: { value: system_logo },
          create: { key: 'system_logo', value: system_logo }
        })
      );
    }

    await Promise.all(updates);

    return NextResponse.json({
      system_title: system_title || '',
      system_logo: system_logo || ''
    });
  } catch (error) {
    console.error('Failed to update system settings:', error);
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    );
  }
}
