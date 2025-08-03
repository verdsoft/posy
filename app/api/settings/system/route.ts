import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/mysql';
import { promises as fs } from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    const conn = await getConnection();
    const [rows]: any = await conn.query("SELECT * FROM settings WHERE `key` IN ('system_title', 'system_logo')");
    const settings = rows.reduce((acc: any, row: any) => {
      acc[row.key] = row.value;
      return acc;
    }, {});
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch system settings:', error);
    return NextResponse.json({ error: 'Failed to fetch system settings.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    try {
        await fs.mkdir(uploadDir, { recursive: true });
        const formData = await req.formData();

        const systemTitle = formData.get('system_title') as string;
        const logoFile = formData.get('logo') as File | null;
        
        const conn = await getConnection();

        if (systemTitle) {
            await conn.query("INSERT INTO settings (`key`, `value`) VALUES ('system_title', ?) ON DUPLICATE KEY UPDATE `value` = ?", [systemTitle, systemTitle]);
        }

        if (logoFile) {
            const buffer = Buffer.from(await logoFile.arrayBuffer());
            const fileExtension = path.extname(logoFile.name);
            const fileName = `${Date.now()}${fileExtension}`;
            const filePath = path.join(uploadDir, fileName);

            await fs.writeFile(filePath, buffer);
            const logoPath = `/uploads/${fileName}`;
            
            await conn.query("INSERT INTO settings (`key`, `value`) VALUES ('system_logo', ?) ON DUPLICATE KEY UPDATE `value` = ?", [logoPath, logoPath]);
        }
        
        return NextResponse.json({ success: true, message: "Settings updated successfully" });

    } catch (error) {
        console.error('Error processing form:', error);
        return NextResponse.json({ success: false, error: 'Failed to process form' }, { status: 500 });
    }
}
