"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Edit, FileDown } from "lucide-react"
import type React from "react"
import { ViewProductDialog } from "@/components/view-product-dialog"
import { Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Product } from "@/lib/types/index"
import AuthGuard from "@/components/AuthGuard"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const router = useRouter()
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()

  // Add delete function
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setProducts(products.filter(p => p.id !== id))
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
      } else {
        throw new Error("Failed to delete")
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
      console.log("Delete error:", err)
    }
  }

  useEffect(() => {
    fetch("/api/products")
      .then(res => res.json())
      .then(data => setProducts(data || []))
      .finally(() => setLoading(false))
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((product) =>
      product.name?.toLowerCase().includes(search.toLowerCase()) ||
      product.code?.toLowerCase().includes(search.toLowerCase())
    )
  }, [products, search])

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.text('Product List', 14, 16)
    
    // Prepare data for the table
    const tableData = filteredProducts.map(product => [
      product.name || '',
      product.code || '',
      product.category_name || '',
      product.brand_name || '',
      Number(product.price).toFixed(2),
      product.unit_name || '',
      Number(product.stock ?? 0).toFixed(2)
    ])
    
    // Add table
    autoTable(doc, {
      head: [['Name', 'Code', 'Category', 'Brand', 'Price', 'Unit', 'Quantity']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('products.pdf')
  }

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map(product => ({
        Name: product.name,
        Code: product.code,
        Category: product.category_name,
        Brand: product.brand_name,
        Price: Number(product.price).toFixed(2),
        Unit: product.unit_name,
        Quantity: Number(product.stock ?? 0).toFixed(2)
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products")
    XLSX.writeFile(workbook, "products.xlsx")
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span>Products</span>
              <span>|</span>
              <span>Product List</span>
            </div>
            <h1 className="text-2xl font-bold">Product List</h1>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Input
                    placeholder="Search this table..."
                    className="w-64"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportToPDF}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={exportToExcel}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  EXCEL
                </Button>
                <Button
                  className="bg-[#1a237e] hover:bg-purple-700"
                  onClick={() => router.push("/products/create")}
                >
                  Create Product
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">
                      <input type="checkbox" />
                    </th>
                    <th className="text-left p-3">Image</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Code</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Brand</th>
                    <th className="text-left p-3">Price</th>
                    <th className="text-left p-3">Unit</th>
                    <th className="text-left p-3">Quantity</th>
                    <th className="text-left p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="p-6 text-center text-gray-500">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <input type="checkbox" />
                        </td>
                        <td className="p-3">
                          {product.image ? (
                            <img
                              src={product.image.startsWith("/uploads") ? product.image : `/uploads/${product.image}`}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">📷</div>
                          )}
                        </td>
                        <td className="p-3 font-medium">{product.name}</td>
                        <td className="p-3">{product.code}</td>
                        <td className="p-3">{product.category_name}</td>
                        <td className="p-3">{product.brand_name}</td>
                        <td className="p-3">{Number(product.price).toFixed(2)}</td>
                        <td className="p-3">{product.unit_name}</td>
                        <td className="p-3">{Number(product.stock ?? 0).toFixed(2)}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600"
                              onClick={() => {
                                setViewProduct(product)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600"
                              onClick={() => router.push(`/products/edit/${product.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
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
                  ? `1 - ${filteredProducts.length} of ${filteredProducts.length}`
                  : "0 - 0 of 0"}{" "}
                | prev next
              </div>
            </div>
          </div>
        </div>
        {viewProduct && (
          <ViewProductDialog
            product={viewProduct}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
        )}
      </DashboardLayout>
    </AuthGuard>
  )
}