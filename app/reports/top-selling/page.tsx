"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { DateRangePicker } from "../../../components/date-range-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileDown } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface TopSellingProduct {
  id: string
  code: string
  name: string
  price: number
  cost: number
  stock: number
  total_sales: number
  total_quantity: number
  total_amount: number
  category_name: string
  brand_name: string
  warehouse_name: string
}

export default function TopSellingProducts() {
  const [products, setProducts] = useState<TopSellingProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState("1970-01-01 - 2025-07-01")

  // Fetch top selling products
  useEffect(() => {
    const fetchTopSellingProducts = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error("Failed to fetch products")
        const data = await res.json()
        
        // Calculate sales data (in a real app, this would come from sales analytics)
        const productsWithSales = data.map((product: any) => ({
          ...product,
          total_sales: Math.floor(Math.random() * 20) + 1, // Mock data
          total_quantity: Math.floor(Math.random() * 100) + 1, // Mock data
          total_amount: (Math.floor(Math.random() * 20) + 1) * product.price // Mock data
        }))
        
        // Sort by total sales
        const sortedProducts = productsWithSales
          .filter((p: any) => p.total_sales > 0)
          .sort((a: any, b: any) => b.total_sales - a.total_sales)
        
        setProducts(sortedProducts)
      } catch (error) {
        toast.error("Failed to load top selling products")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTopSellingProducts()
  }, [])

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.text('Top Selling Products Report', 14, 16)
    
    const tableData = filteredProducts.map(product => [
      product.code,
      product.name,
      `$${product.price || "0.00"}`,
      product.total_sales.toString(),
      `${product.total_quantity} Pcs`,
      `$${product.total_amount || "0.00"}`
    ])
    
    autoTable(doc, {
      head: [['Code', 'Product', 'Price', 'Total Sales', 'Quantity', 'Total Amount']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('top-selling-products.pdf')
  }

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map(product => ({
        Code: product.code,
        Product: product.name,
        Price: `$${product.price || "0.00"}`,
        'Total Sales': product.total_sales,
        Quantity: `${product.total_quantity} Pcs`,
        'Total Amount': `$${product.total_amount || "0.00"}`
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Top Selling Products")
    XLSX.writeFile(workbook, "top-selling-products.xlsx")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Top Selling Products</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Top Selling Products</h1>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search this table..." 
                  className="w-64 pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
              >
                <FileDown className="h-4 w-4 mr-2" />
                EXCEL
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Code</th>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Total Sales</th>
                  <th className="text-left p-3">Quantity</th>
                  <th className="text-left p-3">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6">Loading...</td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6">No products found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{product.code}</td>
                      <td className="p-3">{product.name}</td>
                      <td className="p-3">$ {product.price || "0.00"}</td>
                      <td className="p-3">{product.total_sales}</td>
                      <td className="p-3">{product.total_quantity} Pcs</td>
                      <td className="p-3">$ {product.total_amount || "0.00"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">
              {filteredProducts.length > 0 
                ? `1 - ${Math.min(filteredProducts.length, 10)} of ${filteredProducts.length}` 
                : '0 - 0 of 0'}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
