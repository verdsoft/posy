import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { generateSalesReportPDF, SalesReportPDFData } from '@/lib/utils/pdf-generator'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const reportData = await request.json()

    // Validate required fields
    if (!reportData.title || !reportData.data) {
      return NextResponse.json(
        { error: 'Missing required fields: title and data' },
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
      title: reportData.title || 'Sales Report',
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

    // Return PDF as response with proper headers for download
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating sales report PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
