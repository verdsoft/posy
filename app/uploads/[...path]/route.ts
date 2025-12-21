
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getType } from 'mime'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const pathSegments = params.path
    if (!pathSegments || pathSegments.length === 0) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Construct the file path
    // Maps requests from /uploads/x/y.png -> /app/public/uploads/x/y.png
    const filePath = join(process.cwd(), 'public', 'uploads', ...pathSegments)

    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(filePath)

    // Determine content type (image/png, image/jpeg, etc.)
    const contentType = getType(filePath) || 'application/octet-stream'

    // Return the image data
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        // Cache for performance, but allow revalidation if needed
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
