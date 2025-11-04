/**
 * PDF Generation Service using PDFKit
 * Lightweight alternative to Puppeteer - no external browser dependencies
 */

import PDFDocument from 'pdfkit'
import * as fs from 'fs'
import * as path from 'path'
import { format } from 'date-fns'
import { Organization } from '@/lib/types/prisma'

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
 * PDF generation options
 */
export interface PDFGenerationOptions {
  format?: 'A4' | 'A5' | 'Letter'
  margin?: {
    top?: string
    right?: string
    bottom?: string
    left?: string
  }
  printBackground?: boolean
  landscape?: boolean
  preferCSSPageSize?: boolean
}

/**
 * Main PDF Generator class
 */
export class PDFGenerator {
  private templatesPath: string

  constructor() {
    this.templatesPath = path.join(process.cwd(), 'lib', 'templates', 'pdf')
    console.log('PDFGenerator initialized with PDFKit')
  }

  /**
   * Helper: Format currency
   */
  private formatCurrency(amount: number, symbol: string = '$'): string {
    if (typeof amount !== 'number') return `${symbol}0.00`
    return `${symbol}${amount.toFixed(2)}`
  }

  /**
   * Helper: Format date
   */
  private formatDate(date: Date | string): string {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'MMM dd, yyyy')
  }

  /**
   * Helper: Format date and time
   */
  private formatDateTime(date: Date | string): string {
    if (!date) return ''
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'MMM dd, yyyy hh:mm a')
  }

  /**
   * Generate PDF buffer from data
   */
  private async generatePDFFromData(
    templateType: PDFTemplateType,
    data: BasePDFData,
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: options.format || 'A4',
          layout: options.landscape ? 'landscape' : 'portrait',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        })

        const chunks: Buffer[] = []
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        // Generate content based on template type
        switch (templateType) {
          case 'invoice':
            this.generateInvoiceContent(doc, data as InvoicePDFData)
            break
          case 'quotation':
            this.generateQuotationContent(doc, data as QuotationPDFData)
            break
          case 'receipt':
            this.generateReceiptContent(doc, data as ReceiptPDFData)
            break
          case 'sales-report':
            this.generateReportContent(doc, data)
            break
          default:
            throw new Error(`Unsupported template type: ${templateType}`)
        }

        doc.end()
      } catch (error) {
        reject(new Error(`Failed to generate PDF: ${error}`))
      }
    })
  }

  /**
   * Generate invoice content
   */
  private generateInvoiceContent(doc: PDFKit.PDFDocument, data: InvoicePDFData): void {
    // Header
    this.generateHeader(doc, data, 'INVOICE')

    // Document info
    doc.fontSize(10)
    doc.text(`Invoice #: ${data.invoiceNumber}`, 50, 180)
    doc.text(`Date: ${this.formatDate(data.invoiceDate)}`, 50, 195)
    if (data.dueDate) {
      doc.text(`Due Date: ${this.formatDate(data.dueDate)}`, 50, 210)
    }
    if (data.status) {
      doc.text(`Status: ${data.status}`, 50, 225)
    }

    // Customer info
    this.generateCustomerInfo(doc, data, 180)

    // Items table
    this.generateItemsTable(doc, data.items, 280)

    // Totals
    this.generateTotals(doc, data)

    // Payment info
    if (data.amountPaid || data.balanceDue) {
      const y = doc.y + 20
      doc.fontSize(10)
      if (data.amountPaid) {
        doc.text(`Amount Paid: ${this.formatCurrency(data.amountPaid)}`, 400, y)
      }
      if (data.balanceDue) {
        doc.text(`Balance Due: ${this.formatCurrency(data.balanceDue)}`, 400, y + 15)
      }
    }

    // Footer
    this.generateFooter(doc, data)
  }

  /**
   * Generate quotation content
   */
  private generateQuotationContent(doc: PDFKit.PDFDocument, data: QuotationPDFData): void {
    const pageWidth = doc.page.width

    // Dark Header Background (matching #1f2937 to #374151 gradient - using dark gray)
    doc.rect(0, 0, pageWidth, 120).fillAndStroke('#1f2937', '#1f2937')

    // Logo placeholder circle (if no logo)
    if (data.organization?.logo) {
      try {
        const logoPath = path.join(process.cwd(), 'public', data.organization.logo)
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 40, { width: 50, height: 50 })
        } else {
          this.drawLogoPlaceholder(doc, 50, 40)
        }
      } catch (error) {
        this.drawLogoPlaceholder(doc, 50, 40)
      }
    } else {
      this.drawLogoPlaceholder(doc, 50, 40)
    }

    // Company Name and Info (White text on dark background)
    doc.fillColor('#ffffff')
    doc.fontSize(20).font('Helvetica-Bold')
    doc.text(data.organization?.name || 'Company Name', 110, 42)

    doc.fontSize(9).font('Helvetica')
    let infoY = 64
    if (data.organization?.email) {
      doc.text(data.organization.email, 110, infoY)
      infoY += 12
    }
    if (data.organization?.phone) {
      doc.text(data.organization.phone, 110, infoY)
      infoY += 12
    }
    if (data.organization?.address) {
      const addressLine = `${data.organization.address}${data.organization.city ? ', ' + data.organization.city : ''}${data.organization.country ? ', ' + data.organization.country : ''}`
      doc.fontSize(8).text(addressLine, 110, infoY)
    }

    // "QUOTATION" Title on the right
    doc.fontSize(24).font('Helvetica-Bold')
    doc.text('QUOTATION', pageWidth - 200, 55, { width: 150, align: 'right' })

    // Reset to black text
    doc.fillColor('#000000')

    // Document Info Section (Two columns layout)
    let contentY = 150

    // Left Column: Client Info
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#3b82f6')
    doc.text('QUOTATION TO', 50, contentY)

    doc.fontSize(11).font('Helvetica-Bold').fillColor('#1f2937')
    doc.text(data.customer?.name || 'Customer', 50, contentY + 20)

    doc.fontSize(9).font('Helvetica').fillColor('#333333')
    let clientY = contentY + 35
    if (data.customer?.email) {
      doc.text(data.customer.email, 50, clientY)
      clientY += 12
    }
    if (data.customer?.phone) {
      doc.text(data.customer.phone, 50, clientY)
      clientY += 12
    }
    if (data.customer?.address) {
      doc.text(data.customer.address, 50, clientY)
      clientY += 12
    }
    if (data.customer?.city) {
      const location = `${data.customer.city}${data.customer.country ? ', ' + data.customer.country : ''}`
      doc.text(location, 50, clientY)
    }

    // Right Column: Document Details
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#3b82f6')
    const rightColumnX = 320
    const detailsWidth = pageWidth - rightColumnX - 50
    doc.text('DOCUMENT DETAILS', rightColumnX, contentY, { width: detailsWidth, align: 'left' })

    doc.fontSize(9).font('Helvetica').fillColor('#374151')
    let detailsY = contentY + 20

    // Quotation Number
    doc.font('Helvetica-Bold').text('Quotation #:', rightColumnX, detailsY, { width: 80, align: 'left' })
    doc.font('Helvetica').text(data.quotationNumber, rightColumnX + 85, detailsY, { width: detailsWidth - 85, align: 'left' })
    detailsY += 15

    // Date
    doc.font('Helvetica-Bold').text('Date:', rightColumnX, detailsY, { width: 80, align: 'left' })
    doc.font('Helvetica').text(this.formatDate(data.quotationDate), rightColumnX + 85, detailsY, { width: detailsWidth - 85, align: 'left' })
    detailsY += 15

    // Valid Until
    if (data.validUntil) {
      doc.font('Helvetica-Bold').text('Valid Until:', rightColumnX, detailsY, { width: 80, align: 'left' })
      doc.font('Helvetica').text(this.formatDate(data.validUntil), rightColumnX + 85, detailsY, { width: detailsWidth - 85, align: 'left' })
      detailsY += 15
    }

    // Status
    if (data.status) {
      doc.font('Helvetica-Bold').text('Status:', rightColumnX, detailsY, { width: 80, align: 'left' })
      doc.font('Helvetica').fillColor('#3b82f6').text(data.status.toUpperCase(), rightColumnX + 85, detailsY, { width: detailsWidth - 85, align: 'left' })
      doc.fillColor('#333333')
    }

    // Items Table
    const tableY = Math.max(clientY, detailsY) + 40
    this.generateProfessionalTable(doc, data.items, tableY, data.organization?.currency_symbol)

    // Calculate table end position
    const tableEndY = tableY + 40 + (data.items.length * 25) + 10

    // Totals Section (on the right)
    this.generateQuotationTotals(doc, data, tableEndY)

    // Notes Section
    if (data.notes) {
      const notesY = tableEndY + 120
      this.generateNotesSection(doc, data.notes, notesY)
    }

    // Terms & Conditions
    if (data.organization?.terms_conditions) {
      const termsY = doc.y + 30
      this.generateTermsSection(doc, data.organization.terms_conditions, termsY)
    }

    // Footer
    this.generateProfessionalFooter(doc, data.organization)
  }

  /**
   * Generate receipt content
   */
  private generateReceiptContent(doc: PDFKit.PDFDocument, data: ReceiptPDFData): void {
    // Header (smaller for receipt)
    this.generateHeader(doc, data, 'RECEIPT')

    // Document info
    doc.fontSize(10)
    doc.text(`Receipt #: ${data.receiptNumber}`, 50, 180)
    doc.text(`Date: ${this.formatDate(data.saleDate)}`, 50, 195)
    if (data.cashier) {
      doc.text(`Cashier: ${data.cashier.name}`, 50, 210)
    }
    if (data.paymentMethod) {
      doc.text(`Payment: ${data.paymentMethod}`, 50, 225)
    }

    // Customer info (optional for receipts)
    if (data.customer) {
      this.generateCustomerInfo(doc, data, 180)
    }

    // Items table
    this.generateItemsTable(doc, data.items, 280)

    // Totals
    this.generateTotals(doc, data)

    // Payment info
    if (data.amountPaid || data.changeAmount) {
      const y = doc.y + 20
      doc.fontSize(10)
      if (data.amountPaid) {
        doc.text(`Amount Paid: ${this.formatCurrency(data.amountPaid)}`, 400, y)
      }
      if (data.changeAmount) {
        doc.text(`Change: ${this.formatCurrency(data.changeAmount)}`, 400, y + 15)
      }
    }

    // Footer
    this.generateFooter(doc, data)
  }

  /**
   * Generate report content
   */
  private generateReportContent(doc: PDFKit.PDFDocument, data: BasePDFData): void {
    this.generateHeader(doc, data, 'SALES REPORT')
    this.generateItemsTable(doc, data.items, 280)
    this.generateTotals(doc, data)
    this.generateFooter(doc, data)
  }

  /**
   * Generate header with logo and company info
   */
  private generateHeader(doc: PDFKit.PDFDocument, data: BasePDFData, title: string): void {
    // Logo
    if (data.organization?.logo) {
      try {
        const logoPath = path.join(process.cwd(), 'public', data.organization.logo)
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 45, { width: 80 })
        }
      } catch (error) {
        console.error('Error loading logo:', error)
      }
    }

    // Company info
    doc.fontSize(18).text(data.organization?.name || 'Company Name', 180, 50)
    doc.fontSize(9)
      .text(data.organization?.address || '', 180, 72)
      .text(data.organization?.email || '', 180, 84)
      .text(data.organization?.phone || '', 180, 96)

    // Document title
    doc.fontSize(20).font('Helvetica-Bold')
    doc.text(title, 50, 130, { align: 'center' })
    doc.font('Helvetica')

    // Line under header
    doc.moveTo(50, 160).lineTo(550, 160).stroke()
  }

  /**
   * Generate customer information
   */
  private generateCustomerInfo(doc: PDFKit.PDFDocument, data: BasePDFData, y: number): void {
    if (!data.customer) return

    doc.fontSize(10).font('Helvetica-Bold')
    doc.text('Bill To:', 350, y)
    doc.font('Helvetica').fontSize(9)
    doc.text(data.customer.name || '', 350, y + 15)
    if (data.customer.email) doc.text(data.customer.email, 350, y + 27)
    if (data.customer.phone) doc.text(data.customer.phone, 350, y + 39)
    if (data.customer.address) doc.text(data.customer.address, 350, y + 51)
  }

  /**
   * Generate items table
   */
  private generateItemsTable(doc: PDFKit.PDFDocument, items: any[], startY: number): void {
    const headers = ['Description', 'Qty', 'Price', 'Total']
    const colWidths = [260, 70, 80, 80]
    const startX = 50

    // Header
    doc.fontSize(10).font('Helvetica-Bold')
    headers.forEach((header, i) => {
      const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
      doc.text(header, x, startY)
    })

    // Header line
    doc.moveTo(startX, startY + 15).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), startY + 15).stroke()

    // Items
    doc.font('Helvetica').fontSize(9)
    let y = startY + 25

    items.forEach((item) => {
      const name = item.product?.name || item.name || 'Item'
      const quantity = item.quantity || 0
      const price = item.price || item.unit_price || 0
      const total = item.total || (quantity * price)

      doc.text(name, startX, y, { width: colWidths[0] })
      doc.text(quantity.toString(), startX + colWidths[0], y, { width: colWidths[1], align: 'center' })
      doc.text(this.formatCurrency(price), startX + colWidths[0] + colWidths[1], y, { width: colWidths[2], align: 'right' })
      doc.text(this.formatCurrency(total), startX + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], align: 'right' })

      y += 20
    })

    // Bottom line
    doc.moveTo(startX, y + 5).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y + 5).stroke()
    doc.y = y + 15
  }

  /**
   * Generate totals section
   */
  private generateTotals(doc: PDFKit.PDFDocument, data: BasePDFData): void {
    const y = doc.y + 10
    const rightX = 400

    doc.fontSize(10).font('Helvetica')

    // Subtotal
    doc.text('Subtotal:', rightX, y, { width: 90, align: 'right' })
    doc.text(this.formatCurrency(data.subtotal || 0), rightX + 100, y, { align: 'right' })

    // Tax
    if (data.taxAmount) {
      doc.text(`Tax (${data.taxPercentage || 0}%):`, rightX, y + 15, { width: 90, align: 'right' })
      doc.text(this.formatCurrency(data.taxAmount), rightX + 100, y + 15, { align: 'right' })
    }

    // Discount
    if (data.discountAmount) {
      doc.text('Discount:', rightX, y + 30, { width: 90, align: 'right' })
      doc.text(`-${this.formatCurrency(data.discountAmount)}`, rightX + 100, y + 30, { align: 'right' })
    }

    // Total
    const totalY = y + (data.taxAmount && data.discountAmount ? 45 : data.taxAmount || data.discountAmount ? 30 : 15)
    doc.fontSize(12).font('Helvetica-Bold')
    doc.text('Total:', rightX, totalY, { width: 90, align: 'right' })
    doc.text(this.formatCurrency(data.totalAmount || 0), rightX + 100, totalY, { align: 'right' })

    doc.y = totalY + 25
  }

  /**
   * Generate footer
   */
  private generateFooter(doc: PDFKit.PDFDocument, data: BasePDFData): void {
    // Notes
    if (data.notes) {
      doc.font('Helvetica').fontSize(9)
      doc.moveDown(2)
      doc.text('Notes:', 50)
      doc.text(data.notes, 50, doc.y, { width: 500 })
    }

    // Thank you message
    doc.fontSize(10).fillColor('gray')
    doc.text('Thank you for your business!', 50, doc.page.height - 50, {
      align: 'center',
      width: doc.page.width - 100
    })
  }

  /**
   * Generate invoice PDF
   */
  async generateInvoicePDF(
    data: InvoicePDFData,
    options?: PDFGenerationOptions
  ): Promise<Buffer> {
    try {
      return await this.generatePDFFromData('invoice', data, options)
    } catch (error) {
      throw new Error(`Failed to generate invoice PDF: ${error}`)
    }
  }

  /**
   * Generate quotation PDF
   */
  async generateQuotationPDF(
    data: QuotationPDFData,
    options?: PDFGenerationOptions
  ): Promise<Buffer> {
    try {
      return await this.generatePDFFromData('quotation', data, options)
    } catch (error) {
      throw new Error(`Failed to generate quotation PDF: ${error}`)
    }
  }

  /**
   * Generate receipt PDF
   */
  async generateReceiptPDF(
    data: ReceiptPDFData,
    options?: PDFGenerationOptions
  ): Promise<Buffer> {
    try {
      // Receipts typically use smaller format
      const receiptOptions = {
        ...options,
        format: 'A5' as const,
      }
      return await this.generatePDFFromData('receipt', data, receiptOptions)
    } catch (error) {
      throw new Error(`Failed to generate receipt PDF: ${error}`)
    }
  }

  /**
   * Generate PDF for any template type (convenience method)
   */
  async generatePDF(
    templateType: PDFTemplateType,
    data: BasePDFData,
    options?: PDFGenerationOptions
  ): Promise<Buffer> {
    switch (templateType) {
      case 'invoice':
        return this.generateInvoicePDF(data as InvoicePDFData, options)
      case 'quotation':
        return this.generateQuotationPDF(data as QuotationPDFData, options)
      case 'receipt':
        return this.generateReceiptPDF(data as ReceiptPDFData, options)
      case 'sales-report':
        return await this.generatePDFFromData(templateType, data, options)
      default:
        throw new Error(`Unsupported template type: ${templateType}`)
    }
  }

  /**
   * Generate and save PDF to file
   */
  async generateAndSavePDF(
    templateType: PDFTemplateType,
    data: BasePDFData,
    outputPath: string,
    options?: PDFGenerationOptions
  ): Promise<void> {
    try {
      const pdfBuffer = await this.generatePDF(templateType, data, options)
      await fs.promises.writeFile(outputPath, pdfBuffer)
    } catch (error) {
      throw new Error(`Failed to save PDF: ${error}`)
    }
  }

  /**
   * Draw logo placeholder (white circle with blue inner circle)
   */
  private drawLogoPlaceholder(doc: PDFKit.PDFDocument, x: number, y: number): void {
    // White circle
    doc.circle(x + 25, y + 25, 25).fillAndStroke('#ffffff', '#ffffff')
    // Blue inner circle
    doc.circle(x + 25, y + 25, 14).fillAndStroke('#3b82f6', '#3b82f6')
    // Reset fill color
    doc.fillColor('#000000')
  }

  /**
   * Generate professional table with blue header
   */
  private generateProfessionalTable(
    doc: PDFKit.PDFDocument,
    items: any[],
    startY: number,
    currencySymbol: string = '$'
  ): void {
    const pageWidth = doc.page.width
    const startX = 50
    const tableWidth = pageWidth - 100
    const colWidths = [tableWidth * 0.5, tableWidth * 0.15, tableWidth * 0.175, tableWidth * 0.175]

    // Blue header background
    doc.rect(startX, startY, tableWidth, 30).fillAndStroke('#3b82f6', '#3b82f6')

    // Header text (white)
    doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold')
    doc.text('DESCRIPTION', startX + 10, startY + 10, { width: colWidths[0] - 10 })
    doc.text('QTY', startX + colWidths[0], startY + 10, { width: colWidths[1], align: 'center' })
    doc.text('UNIT PRICE', startX + colWidths[0] + colWidths[1], startY + 10, { width: colWidths[2], align: 'right' })
    doc.text('TOTAL', startX + colWidths[0] + colWidths[1] + colWidths[2], startY + 10, { width: colWidths[3], align: 'right' })

    // Reset to black text
    doc.fillColor('#000000').font('Helvetica')

    // Table rows
    let y = startY + 40
    items.forEach((item, index) => {
      // Alternating row background (light gray for even rows)
      if (index % 2 === 0) {
        doc.rect(startX, y - 5, tableWidth, 25).fillAndStroke('#f8fafc', '#f8fafc')
      }

      // Product name (bold)
      doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold')
      doc.text(item.product?.name || item.name || 'Item', startX + 10, y, { width: colWidths[0] - 10 })

      // Product description or code (if available)
      if (item.product?.code) {
        doc.fontSize(8).font('Helvetica').fillColor('#6b7280')
        doc.text(`SKU: ${item.product.code}`, startX + 10, y + 10, { width: colWidths[0] - 10 })
      }

      // Quantity
      doc.fillColor('#000000').fontSize(9).font('Helvetica')
      const quantity = item.quantity || 0
      doc.text(quantity.toString(), startX + colWidths[0], y, { width: colWidths[1], align: 'center' })

      // Price
      const price = item.price || item.unit_price || 0
      doc.text(this.formatCurrency(price, currencySymbol), startX + colWidths[0] + colWidths[1], y, {
        width: colWidths[2],
        align: 'right'
      })

      // Total (bold)
      const total = item.subtotal || item.total || (quantity * price)
      doc.font('Helvetica-Bold')
      doc.text(this.formatCurrency(total, currencySymbol), startX + colWidths[0] + colWidths[1] + colWidths[2], y, {
        width: colWidths[3] - 10,
        align: 'right'
      })

      y += 25

      // Draw row separator
      doc.moveTo(startX, y - 5).lineTo(startX + tableWidth, y - 5).strokeColor('#e5e7eb').stroke()
      doc.strokeColor('#000000')
    })
  }

  /**
   * Generate quotation totals section (light gray box on the right)
   */
  private generateQuotationTotals(doc: PDFKit.PDFDocument, data: QuotationPDFData, startY: number): void {
    const pageWidth = doc.page.width
    const boxWidth = 250
    const boxX = pageWidth - boxWidth - 50
    const boxPadding = 15

    // Light gray background box
    const boxHeight = 100 + (data.taxAmount ? 15 : 0) + (data.discountAmount ? 15 : 0)
    doc.rect(boxX, startY, boxWidth, boxHeight).fillAndStroke('#f8fafc', '#e5e7eb')

    let y = startY + boxPadding
    doc.fillColor('#374151').fontSize(9)

    // Subtotal
    doc.font('Helvetica').text('Subtotal:', boxX + boxPadding, y, { width: boxWidth - 120, align: 'left' })
    doc.font('Helvetica-Bold').text(
      this.formatCurrency(data.subtotal || 0, data.organization?.currency_symbol),
      boxX + boxWidth - boxPadding - 100,
      y,
      { width: 100, align: 'right' }
    )
    y += 20

    // Tax
    if (data.taxAmount) {
      const taxRate = data.taxPercentage || 0
      doc.font('Helvetica').text(`Tax (${taxRate}%):`, boxX + boxPadding, y, { width: boxWidth - 120, align: 'left' })
      doc.font('Helvetica-Bold').text(
        this.formatCurrency(data.taxAmount, data.organization?.currency_symbol),
        boxX + boxWidth - boxPadding - 100,
        y,
        { width: 100, align: 'right' }
      )
      y += 20
    }

    // Discount
    if (data.discountAmount) {
      doc.fillColor('#ef4444').font('Helvetica').text('Discount:', boxX + boxPadding, y, { width: boxWidth - 120, align: 'left' })
      doc.font('Helvetica-Bold').text(
        `-${this.formatCurrency(data.discountAmount, data.organization?.currency_symbol)}`,
        boxX + boxWidth - boxPadding - 100,
        y,
        { width: 100, align: 'right' }
      )
      y += 20
      doc.fillColor('#374151')
    }

    // Blue line separator
    y += 5
    doc.moveTo(boxX + boxPadding, y).lineTo(boxX + boxWidth - boxPadding, y).strokeColor('#3b82f6').lineWidth(2).stroke()
    doc.strokeColor('#000000').lineWidth(1)
    y += 15

    // Total (larger, blue text)
    doc.fillColor('#3b82f6').fontSize(14).font('Helvetica-Bold')
    doc.text('TOTAL:', boxX + boxPadding, y, { width: boxWidth - 120, align: 'left' })
    doc.text(
      this.formatCurrency(data.totalAmount || 0, data.organization?.currency_symbol),
      boxX + boxWidth - boxPadding - 100,
      y,
      { width: 100, align: 'right' }
    )

    // Reset colors
    doc.fillColor('#000000')
  }

  /**
   * Generate notes section with blue left border
   */
  private generateNotesSection(doc: PDFKit.PDFDocument, notes: string, startY: number): void {
    const pageWidth = doc.page.width

    // Section heading
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#3b82f6')
    doc.text('NOTES', 50, startY)

    // Notes box with light gray background and blue left border
    const boxY = startY + 20
    const boxWidth = pageWidth - 100

    // Light gray background
    doc.rect(50, boxY, boxWidth, 60).fillAndStroke('#f8fafc', '#f8fafc')

    // Blue left border
    doc.rect(50, boxY, 4, 60).fillAndStroke('#3b82f6', '#3b82f6')

    // Notes text
    doc.fillColor('#374151').fontSize(9).font('Helvetica')
    doc.text(notes, 65, boxY + 10, { width: boxWidth - 30, lineGap: 3 })

    // Reset color
    doc.fillColor('#000000')
  }

  /**
   * Generate terms & conditions section
   */
  private generateTermsSection(doc: PDFKit.PDFDocument, terms: string, startY: number): void {
    // Section heading
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#3b82f6')
    doc.text('TERMS & CONDITIONS', 50, startY)

    // Terms text (small gray text)
    doc.fillColor('#6b7280').fontSize(8).font('Helvetica')
    doc.text(terms, 50, startY + 15, { width: doc.page.width - 100, lineGap: 2 })

    // Reset color
    doc.fillColor('#000000')
  }

  /**
   * Generate professional footer at bottom
   */
  private generateProfessionalFooter(doc: PDFKit.PDFDocument, organization: any): void {
    const pageHeight = doc.page.height
    const pageWidth = doc.page.width
    const footerY = pageHeight - 50

    // Top border line
    doc.moveTo(50, footerY).lineTo(pageWidth - 50, footerY).strokeColor('#e5e7eb').stroke()
    doc.strokeColor('#000000')

    // Footer text (small, centered, gray)
    doc.fontSize(8).fillColor('#6b7280').font('Helvetica')

    // Company info line
    const footerLine1 = `${organization?.name || 'Company'}${organization?.email ? ' | ' + organization.email : ''}${organization?.phone ? ' | ' + organization.phone : ''}${organization?.website ? ' | ' + organization.website : ''}`
    doc.text(footerLine1, 50, footerY + 10, { width: pageWidth - 100, align: 'center' })

    // Address line
    if (organization?.address) {
      const footerLine2 = `${organization.address}${organization.city ? ', ' + organization.city : ''}${organization.country ? ', ' + organization.country : ''}`
      doc.text(footerLine2, 50, footerY + 20, { width: pageWidth - 100, align: 'center' })
    }

    // Reset color
    doc.fillColor('#000000')
  }

  /**
   * Clear caches (no-op for PDFKit, kept for compatibility)
   */
  clearCache(): void {
    // PDFKit doesn't use caching
  }
}

/**
 * Default PDF generator instance
 */
export const pdfGenerator = new PDFGenerator()

/**
 * Convenience functions for direct use
 */
export async function generateInvoicePDF(
  data: InvoicePDFData,
  options?: PDFGenerationOptions
): Promise<Buffer> {
  return pdfGenerator.generateInvoicePDF(data, options)
}

export async function generateQuotationPDF(
  data: QuotationPDFData,
  options?: PDFGenerationOptions
): Promise<Buffer> {
  return pdfGenerator.generateQuotationPDF(data, options)
}

export async function generateReceiptPDF(
  data: ReceiptPDFData,
  options?: PDFGenerationOptions
): Promise<Buffer> {
  return pdfGenerator.generateReceiptPDF(data, options)
}

/**
 * Legacy compatibility - returns base64 data URL for download
 */
export function createDownloadableURL(pdfBuffer: Buffer): string {
  const base64 = pdfBuffer.toString('base64')
  return `data:application/pdf;base64,${base64}`
}
