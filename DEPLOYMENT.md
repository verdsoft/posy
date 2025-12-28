# Deployment Guide for POSy

This guide explains how to deploy POSy on various hosting platforms.

## PDF Generation

POSy uses **PDFKit** for PDF generation (invoices, quotations, receipts). PDFKit is a pure Node.js library with no external dependencies, making deployment simple and hassle-free!

**No Chrome/Chromium required!** Unlike Puppeteer, PDFKit doesn't need a browser to generate PDFs.

### Benefits of PDFKit

✅ **No external dependencies** - Works everywhere Node.js runs
✅ **Lightweight** - Smaller bundle size, faster deployments
✅ **Fast** - Generates PDFs instantly without launching a browser
✅ **Low memory** - Uses minimal RAM compared to Puppeteer
✅ **Serverless-friendly** - Works on AWS Lambda, Vercel, Netlify
✅ **No special configuration** - Just `npm install` and deploy

## Platform-Specific Deployment Instructions

### 1. **Railway / Render / Heroku (Platform-as-a-Service)**

No special configuration needed!

**Railway:**
```bash
git push railway main
```

**Render:**
```yaml
# render.yaml
services:
  - type: web
    name: posy
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
```

**Heroku:**
```bash
git push heroku main
```

### 2. **Docker Deployment**

Use this Dockerfile:

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

**That's it!** No need to install Chrome or any system dependencies.

### 3. **VPS (Ubuntu/Debian Server)**

```bash
# Install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Deploy your app
cd /var/www/posy
npm install
npm run build
npm start
```

### 4. **AWS Lambda / Vercel / Netlify (Serverless)**

PDFKit works perfectly on serverless platforms! No special configuration needed.

**Vercel:**
```bash
vercel deploy
```

**Netlify:**
```bash
netlify deploy --prod
```

**AWS Lambda:**
- Deploy using AWS SAM, Serverless Framework, or CDK
- PDFKit's small size fits well within Lambda limits

### 5. **Windows Server (IIS)**

```powershell
# Install Node.js from https://nodejs.org/
npm install
npm run build

# Configure IIS to proxy to Node.js app
```

## Environment Variables

Set these environment variables on your hosting platform:

### Required
```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-super-secret-key-here"
```

### Optional
```bash
API_URL="https://your-domain.com/api/v2"
NODE_ENV="production"
PORT=3000
```

## Deployment Steps

1. **Set environment variables** on your hosting platform
2. **Run `npm install`** to install dependencies
3. **Run `npm run build`** to build the Next.js app
4. **Run `npm start`** to start the production server

That's it! No browser installation, no Chrome configuration, no headaches.

## Troubleshooting

### Build fails with "Cannot find module pdfkit"

Make sure pdfkit is installed:
```bash
npm install pdfkit @types/pdfkit
```

### PDF fonts look wrong

PDFKit uses standard PDF fonts (Helvetica, Times, Courier). To use custom fonts:
1. Add font files to `/public/fonts/`
2. Register fonts in the PDF generator
3. Use `doc.font('/path/to/font.ttf')`

### PDF generation is slow

PDFKit is already fast! If you need even better performance:
1. Cache organization data
2. Optimize image loading
3. Use compression for images

## Performance Comparison

**PDFKit vs Puppeteer:**

| Metric | PDFKit | Puppeteer |
|--------|--------|-----------|
| Bundle Size | ~2MB | ~300MB |
| Memory Usage | ~50MB | ~200MB+ |
| Generation Time | ~100ms | ~2-5s |
| Dependencies | None | Chrome/Chromium |
| Serverless | ✅ Works | ⚠️ Requires config |
| Docker Size | ~200MB | ~1GB+ |

## Testing Deployment

After deploying, test PDF generation:

```bash
curl -X POST https://your-app.com/api/pdf/quotation \
  -H "Content-Type: application/json" \
  -d '{"quotation_id": 1}'
```

Should return a PDF file or download link instantly!

## Migration from Puppeteer

If you're migrating from a Puppeteer-based system:

1. ✅ **No code changes needed** - API interfaces remain the same
2. ✅ **Remove Chrome** - Uninstall Chrome/Chromium from server
3. ✅ **Smaller deployments** - Reduce Docker image size by ~800MB
4. ✅ **Faster cold starts** - Serverless functions start instantly

## Support

- For PDFKit docs: https://pdfkit.org/
- For deployment issues: Check your hosting provider's Node.js documentation
- For custom fonts: See PDFKit font documentation

---

**Enjoy simple, fast PDF generation with no external dependencies!** 🎉
