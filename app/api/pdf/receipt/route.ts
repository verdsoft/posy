import { NextRequest, NextResponse } from 'next/server'
import { generateReceiptPDF, ReceiptPDFData } from '@/lib/utils/pdf-generator'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const receiptData: ReceiptPDFData = await request.json()

    // Validate required fields
    if (!receiptData.receiptNumber) {
      return NextResponse.json(
        { error: 'Missing required field: receiptNumber' },
        { status: 400 }
      )
    }

    // Fetch organization data from database to ensure we have complete details
    const organization = await prisma.organization.findFirst()

    if (!organization) {
      return NextResponse.json(
        { error: 'No organization found in database. Please configure your organization settings first.' },
        { status: 404 }
      )
    }

    // Merge database organization with any provided data (database takes priority)
    const completeReceiptData: ReceiptPDFData = {
      ...receiptData,
      organization: {
        name: organization.name,
        email: organization.email || undefined,
        phone: organization.phone || undefined,
        address: organization.address || undefined,
        city: organization.city || undefined,
        state: organization.state || undefined,
        country: organization.country || undefined,
        postal_code: organization.postal_code || undefined,
        logo: organization.logo || undefined,
        currency_symbol: organization.currency_symbol || '$',
        tax_number: organization.tax_number || undefined,
        website: organization.website || undefined,
        invoice_footer: organization.invoice_footer || undefined,
        terms_conditions: organization.terms_conditions || undefined
      }
    }

    // Generate PDF
    const pdfBuffer = await generateReceiptPDF(completeReceiptData)

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${receiptData.receiptNumber}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating receipt PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}