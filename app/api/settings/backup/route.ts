 import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const backupDir = path.join(process.cwd(), 'public', 'storage', 'backups');

// Ensure backup directory exists
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return NextResponse.json({ error: 'DATABASE_URL is missing in environment variables.' }, { status: 500 });
  }

  let dbConfig: {
    host: string;
    port: string;
    user: string;
    password: string;
    database: string;
  };

  try {
    const url = new URL(databaseUrl);
    dbConfig = {
      host: url.hostname,
      port: url.port || '5432',
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
    };
  } catch (error) {
    return NextResponse.json({ error: 'Invalid DATABASE_URL format.' }, { status: 500 });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-${timestamp}.sql`;
  const backupPath = path.join(backupDir, backupFile);

  try {
    const pgDumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.database} -f "${backupPath}"`;

    const env = { ...process.env };
    if (dbConfig.password) {
      env.PGPASSWORD = dbConfig.password;
    }

    await execAsync(pgDumpCommand, { env });
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