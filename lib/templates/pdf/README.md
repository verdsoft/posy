# PDF Generation with PDFKit

This directory contains documentation for the PDF generation system that uses PDFKit for generating invoices, quotations, and receipts.

## Overview

The system provides:
- **No External Dependencies**: Pure Node.js with PDFKit - no Chrome or browser required
- **Fast Generation**: PDFs are generated in ~100ms
- **Lightweight**: Small bundle size (~2MB vs 300MB+ with Puppeteer)
- **Serverless-Friendly**: Works on AWS Lambda, Vercel, Netlify, and all hosting platforms
- **Professional Output**: Vector-based PDF generation with consistent branding
- **Easy Deployment**: No special configuration needed

## Benefits of PDFKit

✅ **No external dependencies** - Works everywhere Node.js runs
✅ **Lightweight** - Smaller bundle size, faster deployments
✅ **Fast** - Generates PDFs instantly without launching a browser
✅ **Low memory** - Uses minimal RAM compared to browser-based solutions
✅ **Serverless-friendly** - Works on AWS Lambda, Vercel, Netlify
✅ **No special configuration** - Just `npm install` and deploy

## Usage

### Basic Usage

```typescript
import { generateInvoicePDF, InvoicePDFData } from '@/lib/utils/pdf-generator'

const invoiceData: InvoicePDFData = {
  organization: organizationData,
  invoiceNumber: 'INV-001',
  invoiceDate: new Date(),
  customer: { name: 'John Doe', email: 'john@example.com' },
  items: [
    {
      product: { name: 'Product 1', code: 'P001' },
      quantity: 2,
      price: 50.00,
      subtotal: 100.00
    }
  ],
  subtotal: 100.00,
  taxAmount: 10.00,
  totalAmount: 110.00
}

const pdfBuffer = await generateInvoicePDF(invoiceData)
```

### Available PDF Generators

#### Invoice PDF
```typescript
import { generateInvoicePDF, InvoicePDFData } from '@/lib/utils/pdf-generator'

const pdfBuffer = await generateInvoicePDF(invoiceData, {
  format: 'A4',
  landscape: false
})
```

#### Quotation PDF
```typescript
import { generateQuotationPDF, QuotationPDFData } from '@/lib/utils/pdf-generator'

const quotationData: QuotationPDFData = {
  organization: organizationData,
  quotationNumber: 'QUO-001',
  quotationDate: new Date(),
  validUntil: new Date('2025-12-31'),
  customer: { name: 'Jane Smith' },
  items: [ /* quotation items */ ],
  subtotal: 200.00,
  totalAmount: 220.00
}

const pdfBuffer = await generateQuotationPDF(quotationData)
```

#### Receipt PDF
```typescript
import { generateReceiptPDF, ReceiptPDFData } from '@/lib/utils/pdf-generator'

const receiptData: ReceiptPDFData = {
  organization: organizationData,
  receiptNumber: 'REC-001',
  receiptDate: new Date(),
  customer: { name: 'Customer Name' },
  items: [ /* receipt items */ ],
  subtotal: 50.00,
  totalAmount: 55.00,
  paymentMethod: 'Cash'
}

const pdfBuffer = await generateReceiptPDF(receiptData)
```

### Advanced Options

```typescript
const options = {
  format: 'A4' | 'Letter' | 'Legal',
  landscape: false,
  margins: {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  }
}

const pdfBuffer = await generateInvoicePDF(invoiceData, options)
```

## Data Interfaces

### Organization Data
All PDF templates expect organization data with these fields:
- `name` - Company name
- `email` - Contact email
- `phone` - Contact phone
- `address` - Physical address
- `city` - City
- `state` - State/Province (optional)
- `country` - Country
- `postal_code` - Postal code (optional)
- `logo` - Logo file path (optional)
- `currency_symbol` - Currency symbol (e.g., '$', '€')
- `tax_number` - Tax ID number (optional)
- `invoice_footer` - Footer text for invoices (optional)
- `terms_conditions` - Terms and conditions text (optional)

### Customer Data
- `name` - Customer name
- `email` - Customer email (optional)
- `phone` - Customer phone (optional)
- `address` - Customer address (optional)
- `city` - Customer city (optional)
- `country` - Customer country (optional)

### Item Data
- `product.name` - Product name
- `product.code` - Product code/SKU (optional)
- `quantity` - Item quantity
- `price` - Unit price
- `subtotal` - Line total

## API Endpoints

### Generate Invoice PDF
```bash
POST /api/pdf/invoice
Content-Type: application/json

{
  "organization": { /* organization data */ },
  "invoiceNumber": "INV-001",
  "invoiceDate": "2025-01-01",
  "customer": { /* customer data */ },
  "items": [ /* invoice items */ ],
  "subtotal": 100.00,
  "totalAmount": 110.00
}
```

### Generate Quotation PDF
```bash
POST /api/pdf/quotation
Content-Type: application/json

{
  "organization": { /* organization data */ },
  "quotationNumber": "QUO-001",
  "quotationDate": "2025-01-01",
  "validUntil": "2025-12-31",
  "customer": { /* customer data */ },
  "items": [ /* quotation items */ ],
  "subtotal": 200.00,
  "totalAmount": 220.00
}
```

### Generate Receipt PDF
```bash
POST /api/pdf/receipt
Content-Type: application/json

{
  "organization": { /* organization data */ },
  "receiptNumber": "REC-001",
  "receiptDate": "2025-01-01",
  "customer": { /* customer data */ },
  "items": [ /* receipt items */ ],
  "subtotal": 50.00,
  "totalAmount": 55.00,
  "paymentMethod": "Cash"
}
```

## Customization

### Modifying PDF Layout

The PDF generation logic is in:
- `lib/utils/pdf-generator.ts` - Main PDF generator class with all template methods
- `lib/pdf-generator.ts` - Alternative generator with similar functionality

To customize the PDF layout:
1. Edit the generator methods (e.g., `generateInvoiceContent`, `generateQuotationContent`)
2. Modify table layouts in `generateItemsTable`
3. Adjust header/footer in respective methods
4. Change fonts, colors, and spacing as needed

### Custom Fonts

To use custom fonts:
```typescript
// In your generator method
doc.font('/path/to/custom-font.ttf')
doc.fontSize(12)
doc.text('Custom font text', 50, 50)
```

### Adding Logos

Logos are automatically included if the organization has a logo path:
```typescript
if (data.organization?.logo) {
  const logoPath = path.join(process.cwd(), 'public', data.organization.logo)
  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 50, 45, { width: 100 })
  }
}
```

## Performance

**PDFKit vs Puppeteer:**

| Metric | PDFKit | Puppeteer |
|--------|--------|-----------|
| Bundle Size | ~2MB | ~300MB |
| Memory Usage | ~50MB | ~200MB+ |
| Generation Time | ~100ms | ~2-5s |
| Dependencies | None | Chrome/Chromium |
| Serverless | ✅ Works | ⚠️ Requires config |
| Docker Size | ~200MB | ~1GB+ |

## Deployment

PDFKit works out of the box on all platforms:

### Railway / Render / Heroku
```bash
git push origin main
```
No special configuration needed!

### Docker
```dockerfile
FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Serverless (Vercel, Netlify, AWS Lambda)
```bash
vercel deploy
# or
netlify deploy --prod
```

See `DEPLOYMENT.md` in the project root for detailed deployment instructions.

## Troubleshooting

### PDF fonts look wrong
PDFKit uses standard PDF fonts (Helvetica, Times, Courier) by default. To use custom fonts:
1. Add font files to `/public/fonts/`
2. Register fonts in the PDF generator
3. Use `doc.font('/path/to/font.ttf')`

### PDF generation fails
Check the error message:
- **"Organization data required"** - Ensure organization data is provided
- **"Items array is required"** - Ensure items array is not empty
- **Image errors** - Verify logo file path exists

### Build fails
If you see PDFKit-related build errors:
```bash
npm install pdfkit @types/pdfkit --save
```

## Migration from Puppeteer

If migrating from Puppeteer-based PDF generation:

1. ✅ **API interfaces remain the same** - No code changes in API consumers
2. ✅ **Remove Chrome** - Uninstall Chrome/Chromium from server
3. ✅ **Smaller deployments** - Reduce Docker image size by ~800MB
4. ✅ **Faster cold starts** - Serverless functions start instantly

## Dependencies

- `pdfkit` - PDF generation library
- `@types/pdfkit` - TypeScript type definitions
- `date-fns` - Date formatting utilities

## Support

- For PDFKit documentation: https://pdfkit.org/
- For deployment issues: See `DEPLOYMENT.md` in project root
- For custom fonts: See PDFKit font documentation

---

**Enjoy simple, fast PDF generation with no external dependencies!** 🎉
