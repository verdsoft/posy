import type { Sale } from "@/lib/types/prisma"

export interface PrintReceiptData {
    reference: string
    date: string
    items: Array<{
        name: string
        quantity: number
        price: number
        subtotal: number
    }>
    subtotal: number
    tax: number
    discount?: number
    shipping?: number
    total: number
    payment_method?: string
    cashier?: string
    customer_name?: string
    notes?: string
    zimra_qr?: string
}

export function getPrinterSettings() {
    if (typeof window === 'undefined') return null

    return {
        printerType: localStorage.getItem("printer_type") || "thermal-80mm",
        autoPrint: localStorage.getItem("auto_print") === "true",
        headerText: localStorage.getItem("receipt_header") || "",
        footerText: localStorage.getItem("receipt_footer") || "Thank you for your business!"
    }
}

export function printReceipt(data: PrintReceiptData) {
    const settings = getPrinterSettings()
    if (!settings) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
        alert("Please allow popups to print receipts")
        return
    }

    const receiptHTML = generateReceiptHTML(data, settings)
    printWindow.document.write(receiptHTML)
    printWindow.document.close()

    setTimeout(() => {
        printWindow.print()
        printWindow.close()
    }, 250)
}

function generateReceiptHTML(data: PrintReceiptData, settings: any) {
    const width = settings.printerType === "thermal-58mm" ? "58mm" : "80mm"
    const fontSize = settings.printerType === "thermal-58mm" ? "10px" : "12px"

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt ${data.reference}</title>
      <style>
        @page {
          size: ${width} auto;
          margin: 0;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
        }
        body {
          font-family: 'Courier New', monospace;
          font-size: ${fontSize};
          line-height: 1.4;
          padding: 10px;
          max-width: ${width};
          margin: 0 auto;
        }
        .center { text-align: center; }
        .bold { font-weight: bold; }
        .large { font-size: 14px; }
        .line { border-top: 1px dashed #000; margin: 5px 0; }
        .double-line { border-top: 2px solid #000; margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; }
        td { padding: 2px 0; }
        .right { text-align: right; }
        .qr-code { margin: 10px auto; display: block; }
      </style>
    </head>
    <body>
      ${settings.headerText ? `
        <div class="center bold large">
          ${settings.headerText}
        </div>
      ` : ''}
      
      <div class="center">SALES RECEIPT</div>
      <div class="line"></div>
      
      <div>Date: ${new Date(data.date).toLocaleString()}</div>
      <div>Receipt: ${data.reference}</div>
      ${data.cashier ? `<div>Cashier: ${data.cashier}</div>` : ''}
      ${data.customer_name ? `<div>Customer: ${data.customer_name}</div>` : ''}
      
      <div class="line"></div>
      
      <table>
        ${data.items.map(item => `
          <tr>
            <td colspan="2" class="bold">${item.name}</td>
          </tr>
          <tr>
            <td>${item.quantity} x $${item.price.toFixed(2)}</td>
            <td class="right">$${item.subtotal.toFixed(2)}</td>
          </tr>
        `).join('')}
      </table>
      
      <div class="line"></div>
      
      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="right">$${data.subtotal.toFixed(2)}</td>
        </tr>
        ${data.discount ? `
          <tr>
            <td>Discount:</td>
            <td class="right">-$${data.discount.toFixed(2)}</td>
          </tr>
        ` : ''}
        ${data.shipping ? `
          <tr>
            <td>Shipping:</td>
            <td class="right">$${data.shipping.toFixed(2)}</td>
          </tr>
        ` : ''}
        <tr>
          <td>Tax:</td>
          <td class="right">$${data.tax.toFixed(2)}</td>
        </tr>
        <tr class="bold large">
          <td>TOTAL:</td>
          <td class="right">$${data.total.toFixed(2)}</td>
        </tr>
      </table>
      
      <div class="line"></div>
      
      ${data.payment_method ? `
        <div>Payment: ${data.payment_method}</div>
        <div class="line"></div>
      ` : ''}
      
      ${data.zimra_qr ? `
        <div class="center">
          <img src="${data.zimra_qr}" alt="ZIMRA QR Code" class="qr-code" width="120" height="120" />
          <div style="font-size: 9px;">Fiscalized Receipt</div>
        </div>
        <div class="line"></div>
      ` : ''}
      
      ${data.notes ? `
        <div class="center" style="font-size: 10px;">
          ${data.notes}
        </div>
        <div class="line"></div>
      ` : ''}
      
      <div class="center">
        ${settings.footerText}
      </div>
      
      <div class="center" style="margin-top: 10px; font-size: 10px;">
        Powered by POSy
      </div>
    </body>
    </html>
  `
}

export function printInvoice(data: PrintReceiptData) {
    // Similar to receipt but with invoice formatting
    const settings = getPrinterSettings()
    if (!settings) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) {
        alert("Please allow popups to print invoices")
        return
    }

    // Use A4 for invoices regardless of thermal printer setting
    const invoiceHTML = generateInvoiceHTML(data, settings)
    printWindow.document.write(invoiceHTML)
    printWindow.document.close()

    setTimeout(() => {
        printWindow.print()
        printWindow.close()
    }, 250)
}

function generateInvoiceHTML(data: PrintReceiptData, settings: any) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Invoice ${data.reference}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 12px;
          line-height: 1.6;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .info-section {
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .right { text-align: right; }
        .totals {
          margin-left: auto;
          width: 300px;
        }
        .totals td {
          border: none;
          padding: 5px;
        }
        .total-row {
          font-weight: bold;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${settings.headerText || 'INVOICE'}</h1>
      </div>
      
      <div class="info-section">
        <div><strong>Invoice #:</strong> ${data.reference}</div>
        <div><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</div>
        ${data.customer_name ? `<div><strong>Customer:</strong> ${data.customer_name}</div>` : ''}
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="right">Qty</th>
            <th class="right">Unit Price</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td class="right">${item.quantity}</td>
              <td class="right">$${item.price.toFixed(2)}</td>
              <td class="right">$${item.subtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <table class="totals">
        <tr>
          <td>Subtotal:</td>
          <td class="right">$${data.subtotal.toFixed(2)}</td>
        </tr>
        ${data.discount ? `
          <tr>
            <td>Discount:</td>
            <td class="right">-$${data.discount.toFixed(2)}</td>
          </tr>
        ` : ''}
        <tr>
          <td>Tax:</td>
          <td class="right">$${data.tax.toFixed(2)}</td>
        </tr>
        <tr class="total-row">
          <td>TOTAL:</td>
          <td class="right">$${data.total.toFixed(2)}</td>
        </tr>
      </table>
      
      ${data.notes ? `
        <div style="margin-top: 30px;">
          <strong>Notes:</strong><br>
          ${data.notes}
        </div>
      ` : ''}
      
      <div style="margin-top: 50px; text-align: center; font-size: 10px;">
        ${settings.footerText}
      </div>
    </body>
    </html>
  `
}
