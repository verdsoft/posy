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
  private colors = {
    primary: '#1a237e', // Navy blue
    secondary: '#5c6bc0',
    text: '#333333',
    lightText: '#666666',
    border: '#e0e0e0',
    tableHeader: '#f5f5f5',
    tableRowEven: '#ffffff',
    tableRowOdd: '#fafafa'
  }

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
      margins = { top: 50, right: 50, bottom: 50, left: 50 }
    } = options

    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: format,
          layout: orientation,
          margins,
          bufferPages: true
        })

        const chunks: Buffer[] = []
        doc.on('data', (chunk) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)

        this.generateContent(doc, options.template, data)
        doc.end()
      } catch (error) {
        console.error('PDF Generation Error:', error)
        reject(new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    })
  }

  private generateContent(doc: PDFKit.PDFDocument, template: string, data: any): void {
    // Defines
    const pageWidth = doc.page.width
    const pageHeight = doc.page.height
    const margins = doc.page.margins

    // --- Header Section ---
    let yPos = margins.top

    // 1. Logo (Left)
    if (data.organization?.logo) {
      try {
        // Try to resolve absolute path or from public dir
        let logoPath = data.organization.logo
        if (!path.isAbsolute(logoPath)) {
          logoPath = path.join(process.cwd(), 'public', logoPath)
        }

        if (fs.existsSync(logoPath)) {
          doc.image(logoPath, margins.left, yPos, { width: 80 })
        }
      } catch (error) {
        console.warn('Could not load logo:', error)
      }
    }

    // 2. Company Info (Right)
    doc.font('Helvetica-Bold').fontSize(20).fillColor(this.colors.primary)
      .text(data.organization?.name || 'Company Name', 0, yPos, { align: 'right', width: pageWidth - margins.right })

    doc.moveDown(0.5)
    doc.font('Helvetica').fontSize(9).fillColor(this.colors.lightText)
    const companyInfoY = doc.y
    const infoOptions = { align: 'right' as const, width: pageWidth - margins.right }

    if (data.organization?.address) doc.text(data.organization.address, 0, doc.y, infoOptions)
    if (data.organization?.city) doc.text(`${data.organization.city} ${data.organization.country || ''}`, 0, doc.y, infoOptions)
    if (data.organization?.phone) doc.text(data.organization.phone, 0, doc.y, infoOptions)
    if (data.organization?.email) doc.text(data.organization.email, 0, doc.y, infoOptions)

    // --- Title & Meta Section ---
    doc.moveDown(2)
    yPos = Math.max(doc.y, 130) // Ensure we clear the header area
    doc.y = yPos

    // Draw separator line
    doc.moveTo(margins.left, yPos).lineTo(pageWidth - margins.right, yPos).lineWidth(1).strokeColor(this.colors.border).stroke()
    doc.moveDown(1.5)

    const title = template === 'invoice' ? 'INVOICE' :
      template === 'quotation' ? 'QUOTATION' :
        template === 'receipt' ? 'RECEIPT' :
          template === 'return' ? 'RETURN' : 'DOCUMENT'

    doc.font('Helvetica-Bold').fontSize(24).fillColor(this.colors.primary).text(title, margins.left, doc.y)

    // Document Details (Right aligned under title line effectively)
    const metaY = doc.y - 25 // Align roughly with title
    doc.font('Helvetica').fontSize(10).fillColor(this.colors.text)

    const metaX = pageWidth - margins.right - 150
    const metaWidth = 150

    if (template === 'invoice' && data.invoiceNumber) {
      this.drawMetaRow(doc, 'Invoice #:', data.invoiceNumber, metaX, metaY, metaWidth)
      this.drawMetaRow(doc, 'Date:', this.formatDate(data.invoiceDate), metaX, doc.y, metaWidth)
      if (data.dueDate) this.drawMetaRow(doc, 'Due Date:', this.formatDate(data.dueDate), metaX, doc.y, metaWidth)
    } else if (template === 'quotation' && data.quotationNumber) {
      this.drawMetaRow(doc, 'Quotation #:', data.quotationNumber, metaX, metaY, metaWidth)
      this.drawMetaRow(doc, 'Date:', this.formatDate(data.quotationDate), metaX, doc.y, metaWidth)
      if (data.validUntil) this.drawMetaRow(doc, 'Valid Until:', this.formatDate(data.validUntil), metaX, doc.y, metaWidth)
    } else if (data.reference) {
      this.drawMetaRow(doc, 'Reference:', data.reference, metaX, metaY, metaWidth)
      this.drawMetaRow(doc, 'Date:', this.formatDate(data.date), metaX, doc.y, metaWidth)
    }

    doc.moveDown(2)

    // --- Bill To Section ---
    if (data.customer || data.supplier) {
      const party = data.customer || data.supplier
      const label = data.supplier ? 'From:' : 'Bill To:'

      doc.font('Helvetica-Bold').fontSize(12).fillColor(this.colors.primary).text(label, margins.left, doc.y)
      doc.moveDown(0.5)
      doc.font('Helvetica-Bold').fontSize(10).fillColor(this.colors.text).text(party.name || '', margins.left, doc.y)
      doc.font('Helvetica').fontSize(10).fillColor(this.colors.lightText)
      if (party.address) doc.text(party.address)
      if (party.city) doc.text(`${party.city} ${party.country || ''}`)
      if (party.phone) doc.text(party.phone)
      if (party.email) doc.text(party.email)
    }

    // --- Items Table ---
    doc.moveDown(2)
    const tableTop = doc.y + 10
    this.generateItemsTable(doc, data.items || [], tableTop, pageWidth, margins)

    // --- Totals ---
    const totalsY = doc.y + 20
    const rightX = pageWidth - margins.right - 200
    const valueX = pageWidth - margins.right

    doc.font('Helvetica').fontSize(10)

    this.drawTotalRow(doc, 'Subtotal:', data.subtotal || 0, rightX, totalsY, valueX)

    let currentY = doc.y
    if (data.taxAmount) {
      this.drawTotalRow(doc, 'Tax:', data.taxAmount, rightX, currentY + 5, valueX)
      currentY = doc.y
    }

    if (data.discountAmount) {
      this.drawTotalRow(doc, 'Discount:', -data.discountAmount, rightX, currentY + 5, valueX)
      currentY = doc.y
    }

    if (data.shipping) {
      this.drawTotalRow(doc, 'Shipping:', data.shipping, rightX, currentY + 5, valueX)
      currentY = doc.y
    }

    // Grand Total
    const totalAmount = data.totalAmount || data.total || 0
    doc.moveDown(0.5)
    doc.rect(rightX, doc.y, 200, 25).fill(this.colors.primary) // Background bar
    doc.fillColor('white').font('Helvetica-Bold').fontSize(12)
    doc.text('Total:', rightX + 10, doc.y - 18, { width: 80, align: 'left' })
    doc.text(`$${this.formatCurrency(totalAmount)}`, rightX + 90, doc.y - 18, { width: 100, align: 'right' })

    // --- Notes ---
    if (data.notes) {
      doc.moveDown(3)
      doc.fillColor(this.colors.text).font('Helvetica-Bold').fontSize(10).text('Notes:', margins.left)
      doc.font('Helvetica').fontSize(9).fillColor(this.colors.lightText).text(data.notes, margins.left, doc.y + 5, { width: 400 })
    }

    // --- Footer ---
    const footerText = data.organization?.footer || 'Thank you for your business!'
    doc.fillColor(this.colors.lightText).font('Helvetica').fontSize(8)
      .text(footerText, margins.left, pageHeight - margins.bottom, { align: 'center', width: pageWidth - (margins.left * 2) })
  }

  private drawMetaRow(doc: PDFKit.PDFDocument, label: string, value: string, x: number, y: number, width: number) {
    doc.font('Helvetica-Bold').text(label, x, y, { width: 60, align: 'left' })
    doc.font('Helvetica').text(value, x + 65, y, { width: width - 65, align: 'right' })
  }

  private drawTotalRow(doc: PDFKit.PDFDocument, label: string, amount: number, x: number, y: number, endX: number) {
    doc.fillColor(this.colors.text).text(label, x, y, { width: 100, align: 'right' })
    doc.text(`$${this.formatCurrency(amount)}`, x + 110, y, { width: 90, align: 'right' })
  }

  private generateItemsTable(doc: PDFKit.PDFDocument, items: any[], startY: number, pageWidth: number, margins: any): void {
    const headers = ['Item', 'Quantity', 'Price', 'Total']
    const availableWidth = pageWidth - margins.left - margins.right
    // Columns: Item (40%), Qty (15%), Price (20%), Total (25%)
    const colWidths = [
      availableWidth * 0.4,
      availableWidth * 0.15,
      availableWidth * 0.20,
      availableWidth * 0.25
    ]
    const startX = margins.left

    // Draw header background
    doc.rect(startX, startY, availableWidth, 20).fill(this.colors.tableHeader)

    // Draw headers
    doc.fillColor(this.colors.text).font('Helvetica-Bold').fontSize(9)
    let currentX = startX
    headers.forEach((header, i) => {
      const align = i === 0 ? 'left' : (i === 1 ? 'center' : 'right')
      doc.text(header, currentX + 5, startY + 5, { width: colWidths[i] - 10, align: align as any })
      currentX += colWidths[i]
    })

    // Draw items
    let y = startY + 25
    doc.font('Helvetica').fontSize(9)

    items.forEach((item, index) => {
      // Alternating row background
      if (index % 2 === 1) {
        doc.rect(startX, y - 5, availableWidth, 20).fill(this.colors.tableRowOdd)
      }

      doc.fillColor(this.colors.text)

      const itemName = item.product?.name || item.name || 'Item'
      const quantity = item.quantity || 0
      const price = item.price || item.unit_price || 0
      const total = item.total || (quantity * price) // Pre-calculated or calc

      currentX = startX

      // Item Name
      doc.text(itemName, currentX + 5, y, { width: colWidths[0] - 10, align: 'left' })
      currentX += colWidths[0]

      // Qty
      doc.text(quantity.toString(), currentX + 5, y, { width: colWidths[1] - 10, align: 'center' })
      currentX += colWidths[1]

      // Price
      doc.text(this.formatCurrency(price), currentX + 5, y, { width: colWidths[2] - 10, align: 'right' })
      currentX += colWidths[2]

      // Total
      doc.text(this.formatCurrency(total), currentX + 5, y, { width: colWidths[3] - 10, align: 'right' })

      y += 20

      // Check for page break
      if (y > doc.page.height - margins.bottom - 50) {
        doc.addPage()
        y = margins.top
        // Re-draw header? Optional, simplified for now
      }
    })

    doc.y = y + 10
  }

  private formatCurrency(amount: number): string {
    return (Number(amount) || 0).toFixed(2) // Ensure number
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
    // Legacy support
  }
}

// Initialize helpers
PDFGenerator.getInstance().registerHelpers()

export default PDFGenerator
