import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mysqldump from 'mysqldump';

const backupDir = path.join(process.cwd(), 'public', 'storage', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

export async function POST(req: NextRequest) {
  const dbName = process.env.MYSQL_DATABASE;
  const dbUser = process.env.MYSQL_USER;
  const dbPassword = process.env.MYSQL_PASSWORD;
  const dbHost = process.env.MYSQL_HOST;
  const dbPort = process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306;

  if (!dbName || !dbUser || !dbHost) {
    return NextResponse.json({ error: 'Database configuration is missing in environment variables.' }, { status: 500 });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-${timestamp}.sql`;
  const backupPath = path.join(backupDir, backupFile);

  try {
    await mysqldump({
        connection: {
            host: dbHost,
            user: dbUser,
            password: dbPassword,
            database: dbName,
            port: dbPort,
        },
        dumpToFile: backupPath,
    });
    return NextResponse.json({ success: true, message: 'Backup created successfully.', file: backupFile });
  } catch (error) {
    console.error('Backup failed:', error);
    return NextResponse.json({ error: 'Failed to create backup.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const files = fs.readdirSync(backupDir)
      .map(file => {
        const stats = fs.statSync(path.join(backupDir, file));
        return {
          name: file,
          size: stats.size,
          date: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json(files);
  } catch (error) {
    console.error('Failed to list backups:', error);
    return NextResponse.json({ error: 'Failed to retrieve backups.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const fileName = searchParams.get('fileName');
  
    if (!fileName) {
      return NextResponse.json({ error: 'File name is required.' }, { status: 400 });
    }
  
    // Sanitize file name to prevent directory traversal
    const sanitizedFileName = path.basename(fileName);
    if (sanitizedFileName !== fileName) {
      return NextResponse.json({ error: 'Invalid file name.' }, { status: 400 });
    }
  
    const filePath = path.join(backupDir, sanitizedFileName);
  
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return NextResponse.json({ success: true, message: 'Backup deleted successfully.' });
      } else {
        return NextResponse.json({ error: 'File not found.' }, { status: 404 });
      }
    } catch (error) {
      console.error('Failed to delete backup:', error);
      return NextResponse.json({ error: 'Failed to delete backup.' }, { status: 500 });
    }
  }