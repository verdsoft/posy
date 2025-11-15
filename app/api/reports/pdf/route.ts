import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateSalesReportPDF, SalesReportPDFData } from '@/lib/utils/pdf-generator'

const prisma = new PrismaClient()

interface ReportData {
  title: string
  template: string
  data: any[]
  filters?: Array<{ label: string; value: string }>
  summary?: Array<{ label: string; value: string | number; isCurrency?: boolean }>
  dateRange?: string
  showSummaryByStatus?: boolean
  showSummaryBySupplier?: boolean
  statusSummary?: any[]
  supplierSummary?: any[]
}

export async function POST(req: NextRequest) {
  try {
    const reportData: ReportData = await req.json()

    // Validate required fields
    if (!reportData.title || !reportData.template) {
      return NextResponse.json(
        { error: 'Missing required fields: title and template' },
        { status: 400 }
      )
    }

    // Fetch organization data
    const organization = await prisma.organization.findFirst()

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found. Please set up your organization details in settings.' },
        { status: 404 }
      )
    }

    // Prepare PDF data
    const pdfData: SalesReportPDFData = {
      organization: {
        id: organization.id,
        name: organization.name,
        address: organization.address || undefined,
        city: organization.city || undefined,
        phone: organization.phone || undefined,
        email: organization.email || undefined,
        tax_number: organization.tax_number || undefined,
        logo: organization.logo || undefined,
      },
      title: reportData.title,
      dateRange: reportData.dateRange || 'All Time',
      data: reportData.data || [],
      summary: reportData.summary,
      filters: reportData.filters,
      showSummaryByStatus: reportData.showSummaryByStatus,
      showSummaryBySupplier: reportData.showSummaryBySupplier,
      statusSummary: reportData.statusSummary,
      supplierSummary: reportData.supplierSummary
    }

    // Generate PDF
    const pdfBuffer = await generateSalesReportPDF(pdfData, {
      format: 'A4',
      orientation: 'landscape'
    })

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reportData.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    })

  } catch (error) {
    console.error('PDF Generation Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(req: NextRequest) {
  return NextResponse.json({
    message: 'PDF Generation API',
    supportedTemplates: [
      'sales-report',
      'purchases-report',
      'customers-report',
      'suppliers-report',
      'quantity-alerts-report',
      'sales-returns-report',
      'purchase-returns-report'
    ],
    usage: 'POST with report data to generate PDF'
  })
}
