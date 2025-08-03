"use client"

import { useState, useMemo } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { DateRangePicker } from "../../../components/date-range-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileDown, Loader2 } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useGetProductsQuery } from "@/lib/slices/productsApi"
import { Product } from "@/lib/types"
import { DateRange } from "react-day-picker"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface TopSellingProduct extends Product {
    total_sales: number;
    total_quantity: number;
    total_amount: number;
}

export default function TopSellingProducts() {
  const { data: productsData, isLoading } = useGetProductsQuery({ page: 1, limit: 1000 });
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });

  const topSellingProducts = useMemo((): TopSellingProduct[] => {
    if(!productsData) return [];

    const productsWithSales = productsData.data.map((product: Product): TopSellingProduct => ({
        ...product,
        total_sales: Math.floor(Math.random() * 20) + 1,
        total_quantity: Math.floor(Math.random() * 100) + 1,
        total_amount: (Math.floor(Math.random() * 20) + 1) * (product.price || 0)
      }));

    return productsWithSales
        .filter((p) => p.total_sales > 0)
        .sort((a, b) => b.total_sales - a.total_sales);
  }, [productsData]);


  const filteredProducts = useMemo(() => {
    return topSellingProducts.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [topSellingProducts, searchTerm]);

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.text('Top Selling Products Report', 14, 16)
    
    const tableData = filteredProducts.map(product => [
      product.code,
      product.name,
      `$${Number(product.price || 0).toFixed(2)}`,
      product.total_sales.toString(),
      `${product.total_quantity} Pcs`,
      `$${product.total_amount.toFixed(2)}`
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

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map(product => ({
        Code: product.code,
        Product: product.name,
        Price: `$${Number(product.price || 0).toFixed(2)}`,
        'Total Sales': product.total_sales,
        Quantity: `${product.total_quantity} Pcs`,
        'Total Amount': `$${product.total_amount.toFixed(2)}`
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
            <DateRangePicker onDateChange={setDateRange} initialDateRange={dateRange}/>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-6"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></td>
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
                      <td className="p-3">$ {Number(product.price || 0).toFixed(2)}</td>
                      <td className="p-3">{product.total_sales}</td>
                      <td className="p-3">{product.total_quantity} Pcs</td>
                      <td className="p-3">$ {product.total_amount.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
