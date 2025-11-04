import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'

export interface PDFGenerationOptions {
  template: string
  data: any
  filename: string
  format?: 'A4' | 'Letter' | 'Legal'
  orientation?: 'portrait' | 'landscape'
  margins?: {
    top?: number
    right?: number
    bottom?: number
    left?: number
  }
}

export class PDFGenerator {
  private static instance: PDFGenerator

  private constructor() {
    console.log('PDFGenerator initialized with PDFKit')
  }

  public static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator()
    }
    return PDFGenerator.instance
  }

  public async generatePDF(options: PDFGenerationOptions): Promise<Buffer> {
    const {
      data,
      format = 'A4',
      orientation = 'portrait',
      margins = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
      }
    } = options

    return new Promise((resolve, reject) => {
      try {
        // Create PDF document
        const doc = new PDFDocument({
          size: format,
          layout: orientation,
          margins: {
            top: margins.top || 50,
            bottom: margins.bottom || 50,
            left: margins.left || 50,
            right: margins.right || 50
          }
        })

        // Collect PDF data in buffer
        const chunks: Buffer[] = []
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        // Generate content based on template
        this.generateContent(doc, options.template, data)

        // Finalize the PDF
        doc.end()
      } catch (error) {
        console.error('PDF Generation Error:', error)
        reject(new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
  }

  private generateContent(doc: PDFKit.PDFDocument, template: string, data: any): void {
    // Add company logo if available
    if (data.organization?.logo) {
      try {
        const logoPath = path.join(process.cwd(), 'public', data.organization.logo)
        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, 50, 45, { width: 100 })
        }
      } catch (error) {
        console.error('Error loading logo:', error)
      }
    }

    // Header
    doc.fontSize(20).text(data.organization?.name || 'Company Name', 200, 50)
    doc.fontSize(10)
      .text(data.organization?.address || '', 200, 75)
      .text(data.organization?.email || '', 200, 90)
      .text(data.organization?.phone || '', 200, 105)

    doc.moveDown(2)

    // Document title
    const title = template === 'invoice' ? 'INVOICE' :
                  template === 'quotation' ? 'QUOTATION' :
                  template === 'receipt' ? 'RECEIPT' : 'DOCUMENT'

    doc.fontSize(16).text(title, { align: 'center' })
    doc.moveDown()

    // Document details
    doc.fontSize(10)
    const yPos = 180

    if (template === 'invoice' && data.invoiceNumber) {
      doc.text(`Invoice #: ${data.invoiceNumber}`, 50, yPos)
      doc.text(`Date: ${this.formatDate(data.invoiceDate)}`, 50, yPos + 15)
      if (data.dueDate) {
        doc.text(`Due Date: ${this.formatDate(data.dueDate)}`, 50, yPos + 30)
      }
    } else if (template === 'quotation' && data.quotationNumber) {
      doc.text(`Quotation #: ${data.quotationNumber}`, 50, yPos)
      doc.text(`Date: ${this.formatDate(data.quotationDate)}`, 50, yPos + 15)
      if (data.validUntil) {
        doc.text(`Valid Until: ${this.formatDate(data.validUntil)}`, 50, yPos + 30)
      }
    } else if (template === 'receipt' && data.receiptNumber) {
      doc.text(`Receipt #: ${data.receiptNumber}`, 50, yPos)
      doc.text(`Date: ${this.formatDate(data.saleDate)}`, 50, yPos + 15)
    }

    // Customer details
    if (data.customer) {
      doc.text('Bill To:', 350, yPos)
      doc.text(data.customer.name || '', 350, yPos + 15)
      if (data.customer.email) doc.text(data.customer.email, 350, yPos + 30)
      if (data.customer.phone) doc.text(data.customer.phone, 350, yPos + 45)
    }

    // Items table
    doc.moveDown(5)
    const tableTop = 280

    this.generateItemsTable(doc, data.items || [], tableTop)

    // Totals
    const totalsY = doc.y + 20
    const rightX = 400

    doc.fontSize(10)
    doc.text('Subtotal:', rightX, totalsY, { width: 90, align: 'right' })
    doc.text(`$${this.formatCurrency(data.subtotal || 0)}`, rightX + 100, totalsY, { align: 'right' })

    if (data.taxAmount) {
      doc.text('Tax:', rightX, totalsY + 15, { width: 90, align: 'right' })
      doc.text(`$${this.formatCurrency(data.taxAmount)}`, rightX + 100, totalsY + 15, { align: 'right' })
    }

    if (data.discountAmount) {
      doc.text('Discount:', rightX, totalsY + 30, { width: 90, align: 'right' })
      doc.text(`-$${this.formatCurrency(data.discountAmount)}`, rightX + 100, totalsY + 30, { align: 'right' })
    }

    doc.fontSize(12).font('Helvetica-Bold')
    const totalY = totalsY + (data.taxAmount ? 45 : 30)
    doc.text('Total:', rightX, totalY, { width: 90, align: 'right' })
    doc.text(`$${this.formatCurrency(data.totalAmount || 0)}`, rightX + 100, totalY, { align: 'right' })

    // Notes
    if (data.notes) {
      doc.font('Helvetica').fontSize(10)
      doc.moveDown(2)
      doc.text('Notes:', 50)
      doc.text(data.notes, 50, doc.y, { width: 500 })
    }

    // Footer
    doc.fontSize(8).fillColor('gray')
    doc.text('Thank you for your business!', 50, doc.page.height - 50, {
      align: 'center',
      width: doc.page.width - 100
    })
  }

  private generateItemsTable(doc: PDFKit.PDFDocument, items: any[], startY: number): void {
    const headers = ['Item', 'Quantity', 'Price', 'Total']
    const colWidths = [250, 80, 80, 80]
    const startX = 50

    // Draw header
    doc.fontSize(10).font('Helvetica-Bold')
    headers.forEach((header, i) => {
      const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0)
      doc.text(header, x, startY, { width: colWidths[i] })
    })

    // Draw line under header
    doc.moveTo(startX, startY + 15)
       .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), startY + 15)
       .stroke()

    // Draw items
    doc.font('Helvetica').fontSize(9)
    let y = startY + 25

    items.forEach((item) => {
      const itemName = item.product?.name || item.name || 'Item'
      const quantity = item.quantity || 0
      const price = item.price || item.unit_price || 0
      const total = item.total || (quantity * price)

      doc.text(itemName, startX, y, { width: colWidths[0] })
      doc.text(quantity.toString(), startX + colWidths[0], y, { width: colWidths[1], align: 'center' })
      doc.text(`$${this.formatCurrency(price)}`, startX + colWidths[0] + colWidths[1], y, { width: colWidths[2], align: 'right' })
      doc.text(`$${this.formatCurrency(total)}`, startX + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3], align: 'right' })

      y += 20
    })

    // Draw line after items
    doc.moveTo(startX, y)
       .lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y)
       .stroke()

    doc.y = y + 10
  }

  private formatCurrency(amount: number): string {
    return amount.toFixed(2)
  }

  private formatDate(date: Date | string): string {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  public registerHelpers() {
    // Legacy method for compatibility - no longer needed with PDFKit
    console.log('Helpers registered (PDFKit does not use Handlebars helpers)')
  }
}

// Initialize helpers
PDFGenerator.getInstance().registerHelpers()

export default PDFGenerator
