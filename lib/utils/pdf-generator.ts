/**
 * PDF Generation Service using jsPDF and autoTable
 * Professional document generation with organization branding
 */

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { Organization } from '@/lib/types/prisma'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable?: any
  }
}

/**
 * Template types supported by the PDF generator
 */
export type PDFTemplateType = 'invoice' | 'quotation' | 'receipt' | 'sales-report'

/**
 * Base interface for all PDF document data
 */
export interface BasePDFData {
  organization: Organization
  customer?: {
    name: string
    email?: string
    phone?: string
    address?: string
    city?: string
    country?: string
  }
  items: Array<{
    product: {
      name: string
      description?: string
      sku?: string
    }
    quantity: number
    price: number
    total: number
    discount?: number
    tax?: number
  }>
  subtotal: number
  taxAmount?: number
  taxPercentage?: number
  discountAmount?: number
  totalAmount: number
  notes?: string
  currentDate?: Date
}

/**
 * Invoice-specific data interface
 */
export interface InvoicePDFData extends BasePDFData {
  invoiceNumber: string
  invoiceDate: Date
  dueDate?: Date
  status?: string
  paymentMethod?: string
  shippingCost?: number
  amountPaid?: number
  balanceDue?: number
}

/**
 * Quotation-specific data interface
 */
export interface QuotationPDFData extends BasePDFData {
  quotationNumber: string
  quotationDate: Date
  validUntil?: Date
  status?: string
}

/**
 * Receipt-specific data interface
 */
export interface ReceiptPDFData extends BasePDFData {
  receiptNumber: string
  saleDate: Date
  cashier?: {
    name: string
  }
  paymentMethod?: string
  amountPaid?: number
  changeAmount?: number
  qrCode?: string
}

/**
 * Sales Report data interface
 */
export interface SalesReportPDFData {
  organization: Organization
  title: string
  dateRange: string
  data: any[]
  summary?: Array<{ label: string; value: number | string; isCurrency?: boolean }>
  filters?: Array<{ label: string; value: string }>
  showSummaryByStatus?: boolean
  showSummaryBySupplier?: boolean
  statusSummary?: Array<{ status: string; count: number; amount: number }>
  supplierSummary?: Array<{ supplier_name: string; count: number; amount: number }>
}

/**
 * PDF generation options
 */
export interface PDFGenerationOptions {
  format?: 'A4' | 'A5' | 'Letter'
  orientation?: 'portrait' | 'landscape'
}

/**
 * Colors for professional design
 */
const COLORS = {
  primary: '#1a237e',      // Deep blue
  secondary: '#3949ab',    // Medium blue
  accent: '#5c6bc0',       // Light blue
  success: '#10b981',      // Green
  warning: '#f59e0b',      // Orange
  danger: '#ef4444',       // Red
  text: '#1f2937',         // Dark gray
  textLight: '#6b7280',    // Medium gray
  border: '#e5e7eb',       // Light gray
  background: '#f9fafb'    // Very light gray
}

/**
 * Format currency values
 */
function formatCurrency(amount: number, symbol: string = '$'): string {
  if (typeof amount !== 'number') return `${symbol}0.00`
  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Format date values
 */
function formatDate(date: Date | string, formatStr: string = 'MMM dd, yyyy'): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr)
}

/**
 * Add header with organization branding
 */
function addHeader(doc: jsPDF, organization: Organization, documentTitle: string) {
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Add logo if available (placeholder for now - you can load actual images)
  if (organization.logo) {
    try {
      // If logo is a base64 string or URL, you can add it here
      // doc.addImage(organization.logo, 'PNG', 15, yPos - 5, 30, 30)
      // For now, we'll just add a placeholder box
      doc.setFillColor(COLORS.primary)
      doc.circle(30, yPos + 5, 8, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.text(organization.name.charAt(0).toUpperCase(), 30, yPos + 7, { align: 'center' })
    } catch (error) {
      console.error('Error adding logo:', error)
    }
  }

  // Organization name and details
  doc.setTextColor(COLORS.primary)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(organization.name || 'Business Name', organization.logo ? 50 : 15, yPos)

  yPos += 7
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.textLight)

  if (organization.address) {
    doc.text(organization.address, organization.logo ? 50 : 15, yPos)
    yPos += 4
  }

  const contactInfo = []
  if (organization.phone) contactInfo.push(`Tel: ${organization.phone}`)
  if (organization.email) contactInfo.push(`Email: ${organization.email}`)

  if (contactInfo.length > 0) {
    doc.text(contactInfo.join(' | '), organization.logo ? 50 : 15, yPos)
    yPos += 4
  }

  if (organization.tax_number) {
    doc.text(`Tax No: ${organization.tax_number}`, organization.logo ? 50 : 15, yPos)
  }

  // Document title on the right
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.primary)
  doc.text(documentTitle, pageWidth - 15, 20, { align: 'right' })

  // Horizontal line
  doc.setDrawColor(COLORS.border)
  doc.setLineWidth(0.5)
  doc.line(15, 45, pageWidth - 15, 45)

  return 50 // Return Y position after header
}

/**
 * Add footer with page numbers
 */
function addFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFontSize(8)
  doc.setTextColor(COLORS.textLight)
  doc.setFont('helvetica', 'normal')

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    const text = `Page ${i} of ${pageCount}`
    doc.text(text, pageWidth / 2, pageHeight - 10, { align: 'center' })

    // Add generation date
    const generatedText = `Generated on ${formatDate(new Date(), 'MMM dd, yyyy hh:mm a')}`
    doc.text(generatedText, 15, pageHeight - 10)
  }
}

/**
 * Generate Invoice PDF
 */
export async function generateInvoicePDF(data: InvoicePDFData, options: PDFGenerationOptions = {}): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: options.format || 'A4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = addHeader(doc, data.organization, 'INVOICE')

  // Invoice details
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)

  // Left side - Invoice info
  doc.text('Invoice Number:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.invoiceNumber, 55, yPos)

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Invoice Date:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(data.invoiceDate), 55, yPos)

  if (data.dueDate) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Due Date:', 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(data.dueDate), 55, yPos)
  }

  if (data.status) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Status:', 15, yPos)
    doc.setFont('helvetica', 'normal')

    // Status badge
    const statusColors: Record<string, string> = {
      'paid': COLORS.success,
      'unpaid': COLORS.danger,
      'partial': COLORS.warning,
      'completed': COLORS.success,
      'pending': COLORS.warning,
      'cancelled': COLORS.danger
    }
    const statusColor = statusColors[data.status.toLowerCase()] || COLORS.textLight
    doc.setTextColor(statusColor)
    doc.text(data.status.toUpperCase(), 55, yPos)
    doc.setTextColor(COLORS.text)
  }

  // Right side - Customer info
  if (data.customer) {
    const rightX = pageWidth - 15
    let rightY = yPos - 18

    doc.setFont('helvetica', 'bold')
    doc.setFillColor(COLORS.background)
    doc.rect(pageWidth - 80, rightY - 5, 65, 35, 'F')
    doc.text('Bill To:', pageWidth - 75, rightY, { align: 'left' })

    rightY += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(data.customer.name, pageWidth - 75, rightY, { align: 'left' })

    rightY += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.textLight)

    if (data.customer.address) {
      doc.text(data.customer.address, pageWidth - 75, rightY, { align: 'left', maxWidth: 60 })
      rightY += 4
    }

    const customerContact = []
    if (data.customer.phone) customerContact.push(data.customer.phone)
    if (data.customer.email) customerContact.push(data.customer.email)

    if (customerContact.length > 0) {
      doc.text(customerContact.join(', '), pageWidth - 75, rightY, { align: 'left', maxWidth: 60 })
    }
  }

  // Items table
  yPos += 15
  doc.setTextColor(COLORS.text)

  const tableHeaders = [['#', 'Item', 'Quantity', 'Unit Price', 'Total']]
  const tableData = data.items.map((item, index) => [
    (index + 1).toString(),
    `${item.product.name}${item.product.description ? '\n' + item.product.description : ''}`,
    item.quantity.toString(),
    formatCurrency(item.price),
    formatCurrency(item.total)
  ])

  autoTable(doc, {
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.primary,
      textColor: '#ffffff',
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.text
    },
    alternateRowStyles: {
      fillColor: COLORS.background
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 }
    },
    margin: { left: 15, right: 15 }
  })

  // Calculate totals position
  yPos = doc.lastAutoTable.finalY + 10

  // Totals section
  const totalsX = pageWidth - 70
  doc.setFontSize(10)

  // Subtotal
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', totalsX, yPos, { align: 'right' })
  doc.text(formatCurrency(data.subtotal), pageWidth - 15, yPos, { align: 'right' })

  // Discount
  if (data.discountAmount && data.discountAmount > 0) {
    yPos += 6
    doc.text('Discount:', totalsX, yPos, { align: 'right' })
    doc.setTextColor(COLORS.danger)
    doc.text(`-${formatCurrency(data.discountAmount)}`, pageWidth - 15, yPos, { align: 'right' })
    doc.setTextColor(COLORS.text)
  }

  // Tax
  if (data.taxAmount && data.taxAmount > 0) {
    yPos += 6
    doc.text(`Tax (${data.taxPercentage || 0}%):`, totalsX, yPos, { align: 'right' })
    doc.text(formatCurrency(data.taxAmount), pageWidth - 15, yPos, { align: 'right' })
  }

  // Shipping
  if (data.shippingCost && data.shippingCost > 0) {
    yPos += 6
    doc.text('Shipping:', totalsX, yPos, { align: 'right' })
    doc.text(formatCurrency(data.shippingCost), pageWidth - 15, yPos, { align: 'right' })
  }

  // Total
  yPos += 8
  doc.setDrawColor(COLORS.primary)
  doc.setLineWidth(0.5)
  doc.line(totalsX - 20, yPos - 2, pageWidth - 15, yPos - 2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(COLORS.primary)
  doc.text('Total:', totalsX, yPos, { align: 'right' })
  doc.text(formatCurrency(data.totalAmount), pageWidth - 15, yPos, { align: 'right' })

  // Amount paid and balance due
  if (data.amountPaid !== undefined) {
    yPos += 7
    doc.setFontSize(10)
    doc.setTextColor(COLORS.text)
    doc.setFont('helvetica', 'normal')
    doc.text('Amount Paid:', totalsX, yPos, { align: 'right' })
    doc.setTextColor(COLORS.success)
    doc.text(formatCurrency(data.amountPaid), pageWidth - 15, yPos, { align: 'right' })
  }

  if (data.balanceDue !== undefined && data.balanceDue > 0) {
    yPos += 6
    doc.setTextColor(COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.text('Balance Due:', totalsX, yPos, { align: 'right' })
    doc.setTextColor(COLORS.danger)
    doc.text(formatCurrency(data.balanceDue), pageWidth - 15, yPos, { align: 'right' })
  }

  // Notes
  if (data.notes) {
    yPos += 15
    doc.setTextColor(COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Notes:', 15, yPos)
    yPos += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(COLORS.textLight)
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 30)
    doc.text(splitNotes, 15, yPos)
  }

  // Add footer
  addFooter(doc)

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}

/**
 * Generate Quotation PDF
 */
export async function generateQuotationPDF(data: QuotationPDFData, options: PDFGenerationOptions = {}): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: options.orientation || 'portrait',
    unit: 'mm',
    format: options.format || 'A4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = addHeader(doc, data.organization, 'QUOTATION')

  // Quotation details
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)

  // Left side - Quotation info
  doc.text('Quotation Number:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.quotationNumber, 55, yPos)

  yPos += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Quote Date:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(formatDate(data.quotationDate), 55, yPos)

  if (data.validUntil) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Valid Until:', 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.text(formatDate(data.validUntil), 55, yPos)
  }

  if (data.status) {
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Status:', 15, yPos)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.warning)
    doc.text(data.status.toUpperCase(), 55, yPos)
    doc.setTextColor(COLORS.text)
  }

  // Right side - Customer info
  if (data.customer) {
    const rightX = pageWidth - 15
    let rightY = yPos - 18

    doc.setFont('helvetica', 'bold')
    doc.setFillColor(COLORS.background)
    doc.rect(pageWidth - 80, rightY - 5, 65, 35, 'F')
    doc.text('Quote For:', pageWidth - 75, rightY, { align: 'left' })

    rightY += 6
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(data.customer.name, pageWidth - 75, rightY, { align: 'left' })

    rightY += 5
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(COLORS.textLight)

    if (data.customer.address) {
      doc.text(data.customer.address, pageWidth - 75, rightY, { align: 'left', maxWidth: 60 })
      rightY += 4
    }

    const customerContact = []
    if (data.customer.phone) customerContact.push(data.customer.phone)
    if (data.customer.email) customerContact.push(data.customer.email)

    if (customerContact.length > 0) {
      doc.text(customerContact.join(', '), pageWidth - 75, rightY, { align: 'left', maxWidth: 60 })
    }
  }

  // Items table
  yPos += 15
  doc.setTextColor(COLORS.text)

  const tableHeaders = [['#', 'Item', 'Quantity', 'Unit Price', 'Total']]
  const tableData = data.items.map((item, index) => [
    (index + 1).toString(),
    `${item.product.name}${item.product.description ? '\n' + item.product.description : ''}`,
    item.quantity.toString(),
    formatCurrency(item.price),
    formatCurrency(item.total)
  ])

  autoTable(doc, {
    startY: yPos,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: COLORS.secondary,
      textColor: '#ffffff',
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: COLORS.text
    },
    alternateRowStyles: {
      fillColor: COLORS.background
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 }
    },
    margin: { left: 15, right: 15 }
  })

  // Calculate totals position
  yPos = doc.lastAutoTable.finalY + 10

  // Totals section
  const totalsX = pageWidth - 70
  doc.setFontSize(10)

  // Subtotal
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', totalsX, yPos, { align: 'right' })
  doc.text(formatCurrency(data.subtotal), pageWidth - 15, yPos, { align: 'right' })

  // Discount
  if (data.discountAmount && data.discountAmount > 0) {
    yPos += 6
    doc.text('Discount:', totalsX, yPos, { align: 'right' })
    doc.setTextColor(COLORS.danger)
    doc.text(`-${formatCurrency(data.discountAmount)}`, pageWidth - 15, yPos, { align: 'right' })
    doc.setTextColor(COLORS.text)
  }

  // Tax
  if (data.taxAmount && data.taxAmount > 0) {
    yPos += 6
    doc.text(`Tax (${data.taxPercentage || 0}%):`, totalsX, yPos, { align: 'right' })
    doc.text(formatCurrency(data.taxAmount), pageWidth - 15, yPos, { align: 'right' })
  }

  // Total
  yPos += 8
  doc.setDrawColor(COLORS.secondary)
  doc.setLineWidth(0.5)
  doc.line(totalsX - 20, yPos - 2, pageWidth - 15, yPos - 2)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.setTextColor(COLORS.secondary)
  doc.text('Total:', totalsX, yPos, { align: 'right' })
  doc.text(formatCurrency(data.totalAmount), pageWidth - 15, yPos, { align: 'right' })

  // Notes
  if (data.notes) {
    yPos += 15
    doc.setTextColor(COLORS.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('Notes:', 15, yPos)
    yPos += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(COLORS.textLight)
    const splitNotes = doc.splitTextToSize(data.notes, pageWidth - 30)
    doc.text(splitNotes, 15, yPos)
  }

  // Add footer
  addFooter(doc)

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}

/**
 * Generate Receipt PDF
 */
export async function generateReceiptPDF(data: ReceiptPDFData, options: PDFGenerationOptions = {}): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 200] // Thermal receipt size
  })

  const pageWidth = 80
  let yPos = 10

  // Organization header (centered for receipt)
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)
  doc.text(data.organization.name || 'Business Name', pageWidth / 2, yPos, { align: 'center' })

  yPos += 5
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(COLORS.textLight)

  if (data.organization.address) {
    const addressLines = doc.splitTextToSize(data.organization.address, pageWidth - 10)
    doc.text(addressLines, pageWidth / 2, yPos, { align: 'center' })
    yPos += addressLines.length * 3
  }

  if (data.organization.phone) {
    doc.text(`Tel: ${data.organization.phone}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 3
  }

  if (data.organization.tax_number) {
    doc.text(`Tax No: ${data.organization.tax_number}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 3
  }

  // Divider
  yPos += 2
  doc.setDrawColor(COLORS.border)
  doc.line(5, yPos, pageWidth - 5, yPos)
  yPos += 5

  // Receipt title
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)
  doc.text('RECEIPT', pageWidth / 2, yPos, { align: 'center' })
  yPos += 6

  // Receipt details
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Receipt #: ${data.receiptNumber}`, 5, yPos)
  yPos += 4
  doc.text(`Date: ${formatDate(data.saleDate, 'MMM dd, yyyy hh:mm a')}`, 5, yPos)
  yPos += 4

  if (data.cashier) {
    doc.text(`Cashier: ${data.cashier.name}`, 5, yPos)
    yPos += 4
  }

  if (data.customer && data.customer.name !== 'Walk-in Customer') {
    doc.text(`Customer: ${data.customer.name}`, 5, yPos)
    yPos += 4
  }

  // Divider
  yPos += 2
  doc.line(5, yPos, pageWidth - 5, yPos)
  yPos += 5

  // Items
  doc.setFont('helvetica', 'bold')
  doc.text('Item', 5, yPos)
  doc.text('Qty', 50, yPos, { align: 'right' })
  doc.text('Total', pageWidth - 5, yPos, { align: 'right' })
  yPos += 4

  doc.setFont('helvetica', 'normal')
  data.items.forEach((item) => {
    const itemName = doc.splitTextToSize(item.product.name, 35)
    doc.text(itemName, 5, yPos)
    doc.text(item.quantity.toString(), 50, yPos, { align: 'right' })
    doc.text(formatCurrency(item.total), pageWidth - 5, yPos, { align: 'right' })
    yPos += itemName.length * 4
  })

  // Divider
  yPos += 2
  doc.line(5, yPos, pageWidth - 5, yPos)
  yPos += 5

  // Totals
  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', 5, yPos)
  doc.text(formatCurrency(data.subtotal), pageWidth - 5, yPos, { align: 'right' })
  yPos += 4

  if (data.discountAmount && data.discountAmount > 0) {
    doc.text('Discount:', 5, yPos)
    doc.text(`-${formatCurrency(data.discountAmount)}`, pageWidth - 5, yPos, { align: 'right' })
    yPos += 4
  }

  if (data.taxAmount && data.taxAmount > 0) {
    doc.text(`Tax (${data.taxPercentage || 0}%):`, 5, yPos)
    doc.text(formatCurrency(data.taxAmount), pageWidth - 5, yPos, { align: 'right' })
    yPos += 4
  }

  yPos += 2
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL:', 5, yPos)
  doc.text(formatCurrency(data.totalAmount), pageWidth - 5, yPos, { align: 'right' })
  yPos += 6

  if (data.amountPaid !== undefined) {
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('Paid:', 5, yPos)
    doc.text(formatCurrency(data.amountPaid), pageWidth - 5, yPos, { align: 'right' })
    yPos += 4
  }

  if (data.changeAmount !== undefined && data.changeAmount > 0) {
    doc.text('Change:', 5, yPos)
    doc.text(formatCurrency(data.changeAmount), pageWidth - 5, yPos, { align: 'right' })
    yPos += 4
  }

  if (data.paymentMethod) {
    yPos += 2
    doc.text(`Payment: ${data.paymentMethod}`, pageWidth / 2, yPos, { align: 'center' })
    yPos += 4
  }

  // QR Code placeholder (if ZIMRA integration)
  if (data.qrCode) {
    yPos += 5
    doc.setFontSize(7)
    doc.text('Tax Verification QR Code', pageWidth / 2, yPos, { align: 'center' })
    yPos += 3
    // Add actual QR code image here if available
    doc.text('[QR CODE]', pageWidth / 2, yPos, { align: 'center' })
    yPos += 5
  }

  // Thank you message
  yPos += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' })
  yPos += 4
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.text('Please come again', pageWidth / 2, yPos, { align: 'center' })

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}

/**
 * Generate Sales Report PDF
 */
export async function generateSalesReportPDF(data: SalesReportPDFData, options: PDFGenerationOptions = {}): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: options.orientation || 'landscape',
    unit: 'mm',
    format: options.format || 'A4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = addHeader(doc, data.organization, data.title.toUpperCase())

  // Report metadata
  yPos += 10
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(COLORS.text)
  doc.text('Date Range:', 15, yPos)
  doc.setFont('helvetica', 'normal')
  doc.text(data.dateRange, 45, yPos)

  // Filters if any
  if (data.filters && data.filters.length > 0) {
    yPos += 6
    data.filters.forEach(filter => {
      doc.setFont('helvetica', 'bold')
      doc.text(`${filter.label}:`, 15, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(filter.value, 45, yPos)
      yPos += 6
    })
  }

  // Summary cards
  if (data.summary && data.summary.length > 0) {
    yPos += 5
    const cardWidth = (pageWidth - 40) / data.summary.length
    let cardX = 15

    data.summary.forEach((item, index) => {
      doc.setFillColor(COLORS.background)
      doc.rect(cardX, yPos - 5, cardWidth - 5, 15, 'F')

      doc.setFontSize(8)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(COLORS.textLight)
      doc.text(item.label, cardX + 2, yPos)

      doc.setFontSize(12)
      doc.setTextColor(COLORS.primary)
      const value = item.isCurrency ? formatCurrency(Number(item.value)) : item.value.toString()
      doc.text(value, cardX + 2, yPos + 7)

      cardX += cardWidth
    })

    yPos += 20
  }

  // Data table
  if (data.data && data.data.length > 0) {
    const firstItem = data.data[0]
    const headers = Object.keys(firstItem).map(key =>
      key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    )

    const tableData = data.data.map(item =>
      Object.values(item).map(val => {
        if (typeof val === 'number') return formatCurrency(val)
        if (val instanceof Date) return formatDate(val)
        return String(val || '')
      })
    )

    autoTable(doc, {
      startY: yPos,
      head: [headers],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: '#ffffff',
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: COLORS.text
      },
      alternateRowStyles: {
        fillColor: COLORS.background
      },
      margin: { left: 15, right: 15 }
    })

    yPos = doc.lastAutoTable.finalY + 10
  }

  // Additional summaries
  if (data.showSummaryByStatus && data.statusSummary && data.statusSummary.length > 0) {
    yPos += 5
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(COLORS.text)
    doc.text('Summary by Status', 15, yPos)
    yPos += 5

    const statusHeaders = [['Status', 'Count', 'Total Amount']]
    const statusData = data.statusSummary.map(item => [
      item.status,
      item.count.toString(),
      formatCurrency(item.amount)
    ])

    autoTable(doc, {
      startY: yPos,
      head: statusHeaders,
      body: statusData,
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.secondary,
        textColor: '#ffffff',
        fontSize: 9,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 8
      },
      margin: { left: 15, right: pageWidth / 2 + 5 },
      tableWidth: (pageWidth / 2) - 20
    })
  }

  // Add footer
  addFooter(doc)

  // Convert to buffer
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
  return pdfBuffer
}

// Export all generation functions
export {
  generateInvoicePDF,
  generateQuotationPDF,
  generateReceiptPDF,
  generateSalesReportPDF
}
