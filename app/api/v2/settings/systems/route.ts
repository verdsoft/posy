import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.system_settings.findFirst({
      orderBy: { id: 'desc' }
    });

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        company_name: '',
        email: '',
        phone: '',
        address: '',
        tax_rate: 0,
        currency: 'USD',
        currency_symbol: '$',
        date_format: 'YYYY-MM-DD',
        time_format: 'HH:mm',
        timezone: 'UTC',
        language: 'en'
      });
    }

    return NextResponse.json(settings);
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
    const body = await req.json();

    // Check if settings exist
    const existingSettings = await prisma.system_settings.findFirst();

    let settings;
    if (existingSettings) {
      // Update existing settings
      settings = await prisma.system_settings.update({
        where: { id: existingSettings.id },
        data: {
          ...body,
          updated_at: new Date()
        }
      });
    } else {
      // Create new settings
      settings = await prisma.system_settings.create({
        data: body
      });
    }

    return NextResponse.json(settings);
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
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Settings ID is required' },
        { status: 400 }
      );
    }

    const settings = await prisma.system_settings.update({
      where: { id: parseInt(id) },
      data: {
        ...body,
        updated_at: new Date()
      }
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update system settings:', error);
    return NextResponse.json(
      { error: 'Failed to update system settings' },
      { status: 500 }
    );
  }
}
