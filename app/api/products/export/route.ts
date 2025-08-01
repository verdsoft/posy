import { NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/mysql"
import { PDFDocument, StandardFonts, rgb } from "pdf-lib"
import * as ExcelJS from "exceljs"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const format = searchParams.get("export")
  
  try {
    const conn = await getConnection()
    const [products]: any = await conn.query(`
      SELECT p.*, c.name as category_name, b.name as brand_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
    `)
    

    if (format === "pdf") {
      return generatePDF(products)
    } else if (format === "excel") {
      return generateExcel(products)
    } else {
      return NextResponse.json(
        { error: "Invalid export format" },
        { status: 400 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Export failed" },
      { status: 500 }
    )
  }
}

async function generatePDF(products: any[]) {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([600, 800])
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  
  // Title
  page.drawText("Product List", {
    x: 50,
    y: height - 50,
    size: 20,
    font,
    color: rgb(0, 0, 0),
  })
  
  // Date
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: width - 150,
    y: height - 50,
    size: 10,
    font,
    color: rgb(0, 0, 0),
  })
  
  // Table headers
  const headers = ["Name", "Code", "Category", "Price", "Stock"]
  const columnWidths = [150, 80, 120, 60, 60]
  let y = height - 80
  
  headers.forEach((header, i) => {
    page.drawText(header, {
      x: 50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
      y,
      size: 12,
      font,
      color: rgb(0, 0, 0),
    })
  })
  
  y -= 20
  
  // Product rows
  products.forEach(product => {
    const row = [
      product.name,
      product.code,
      product.category_name || product.category_id,
      `$${Number(product.price)}`,
      Number(product.stock),
    ]
    
    row.forEach((text, i) => {
      page.drawText(text, {
        x: 50 + columnWidths.slice(0, i).reduce((a, b) => a + b, 0),
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      })
    })
    
    y -= 15
    if (y < 50) {
      // Add new page if we're running out of space
      y = height - 50
      const newPage = pdfDoc.addPage([600, 800])
      page.drawText("(continued)", {
        x: 50,
        y: height - 30,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      })
    }
  })
  
  const pdfBytes = await pdfDoc.save()
  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=products.pdf",
    },
  })
}

async function generateExcel(products: any[]) {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet("Products")
  
  // Add headers
  worksheet.columns = [
    { header: "Name", key: "name", width: 30 },
    { header: "Code", key: "code", width: 15 },
    { header: "Category", key: "category", width: 20 },
    { header: "Brand", key: "brand", width: 20 },
    { header: "Price", key: "price", width: 15 },
    { header: "Cost", key: "cost", width: 15 },
    { header: "Stock", key: "stock", width: 15 },
    { header: "Status", key: "status", width: 15 },
  ]
  
  // Style for headers
  worksheet.getRow(1).eachCell(cell => {
    cell.font = { bold: true }
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    }
  })
  
  // Add data
  products.forEach(product => {
    worksheet.addRow({
      name: product.name,
      code: product.code,
      category: product.category_name || product.category_id,
      brand: product.brand_name || product.brand_id,
      price: Number(product.price),
      cost: Number(product.cost),
      stock: Number(product.stock),
      status: product.status,
    })
  })
  
  // Format price columns
  ;["price", "cost"].forEach(key => {
    worksheet.getColumn(key).numFmt = "$#,##0.00"
  })
  
  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer()
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=products.xlsx",
    },
  })
}