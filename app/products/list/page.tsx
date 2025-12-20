"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { ViewProductDialog } from "@/components/view-product-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Product } from "@/lib/types/index"
import AuthGuard from "@/components/AuthGuard"
import * as XLSX from 'xlsx'
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination as UIPagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { useGetOrganizationQuery } from "@/lib/slices/hrmV2Api"
import { generatePDF } from "@/lib/utils/pdf-generator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useGetProductsQuery, useDeleteProductMutation } from '@/lib/slices/productsApi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TableActions } from "@/components/ui/table-actions"
import type React from "react"



type ProductWithMeta = Product & {
  category_name?: string;
  brand_name?: string;
  unit_name?: string;
};

export default function ProductList() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const router = useRouter()
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const { data, isLoading, isError } = useGetProductsQuery({ page, limit, search });
  const { data: orgData } = useGetOrganizationQuery()
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation()

  const products = data?.data || [];
  const pagination = data?.pagination;

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!productToDelete) return
    try {
      await deleteProduct(productToDelete).unwrap()
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      })
      console.error("Delete error:", err)
    } finally {
      setDeleteDialogOpen(false)
      setProductToDelete(null)
    }
  }

  const exportToPDF = () => {
    const tableData = products.map(product => [
      product.name || '',
      product.code || '',
      product.categories?.name || product.category_name || '',
      product.brands?.name || product.brand_name || '',
      Number(product.price),
      product.units?.name || product.unit_name || '',
      Number(product.stock ?? 0)
    ])

    generatePDF({
      title: 'Product List',
      columns: ['Name', 'Code', 'Category', 'Brand', 'Price', 'Unit', 'Quantity'],
      rows: tableData,
      organization: orgData,
      filename: 'products.pdf'
    })
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      products.map(product => ({
        Name: product.name,
        Code: product.code,
        Category: product.categories?.name || product.category_name || '',
        Brand: product.brands?.name || product.brand_name || '',
        Price: Number(product.price),
        Unit: product.units?.name || product.unit_name || '',
        Quantity: Number(product.stock ?? 0)
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products")
    XLSX.writeFile(workbook, "products.xlsx")
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>Products</span>
              <span>|</span>
              <span>List</span>
            </div>
            {/* <h1 className="text-xl font-semibold">Product List</h1> */}
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full md:w-64 h-8 text-sm pl-8"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                  className="h-8 px-2 text-xs flex-1 md:flex-none"
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                  className="h-8 px-2 text-xs flex-1 md:flex-none"
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  Excel
                </Button>
                <Button
                  onClick={() => router.push("/products/create")}
                  className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none"
                >
                  Create Product
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 font-medium">
                      <input type="checkbox" className="rounded scale-75" />
                    </th>
                    <th className="text-left p-2 font-medium w-[50px]">Image</th>
                    <th className="text-left p-2 font-medium">Name</th>
                    <th className="text-left p-2 font-medium">Code</th>
                    <th className="text-left p-2 font-medium">Category</th>
                    <th className="text-left p-2 font-medium">Brand</th>
                    <th className="text-left p-2 font-medium">Price</th>
                    <th className="text-left p-2 font-medium">Unit</th>
                    <th className="text-left p-2 font-medium">Stock</th>
                    <th className="text-right p-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="text-center p-8 text-muted-foreground">Loading...</td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={10} className="text-center p-8 text-red-500">Failed to load products</td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center p-8 text-muted-foreground">No products found</td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-2">
                          <input type="checkbox" className="rounded scale-75" />
                        </td>
                        <td className="p-2">
                          {product.image ? (
                            <img
                              src={product.image.startsWith("/uploads") ? product.image : `/uploads/${product.image}`}
                              alt={product.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs">📷</div>
                          )}
                        </td>
                        <td className="p-2 font-medium">{product.name}</td>
                        <td className="p-2">{product.code}</td>
                        <td className="p-2">{product.categories?.name || product.category_name || ''}</td>
                        <td className="p-2">{product.brands?.name || product.brand_name || ''}</td>
                        <td className="p-2 font-medium">${Number(product.price).toFixed(2)}</td>
                        <td className="p-2">{product.units?.name || product.unit_name || ''}</td>
                        <td className="p-2">{Number(product.stock ?? 0)}</td>
                        <td className="p-2 text-right">
                          <TableActions
                            onView={() => {
                              setViewProduct(product)
                              setIsViewDialogOpen(true)
                            }}
                            onEdit={() => router.push(`/products/edit/${product.id}`)}
                            onDelete={() => handleDeleteClick(product.id)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination && (
              <div className="p-3 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </div>

                <div className="flex items-center gap-2">
                  <Select
                    value={limit.toString()}
                    onValueChange={(value) => setLimit(Number(value))}
                  >
                    <SelectTrigger className="h-7 w-[60px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 25, 50, 100].map((size) => (
                        <SelectItem key={size} value={size.toString()} className="text-xs">
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <UIPagination>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setPage((old) => Math.max(old - 1, 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-3 w-3 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1 px-2">
                        <span className="text-xs">Page {page} of {pagination.totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setPage((old) => old + 1)}
                        disabled={page >= (pagination.totalPages || 1)}
                      >
                        Next
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </UIPagination>
                </div>
              </div>
            )}
          </div>

          {viewProduct && (
            <ViewProductDialog
              product={viewProduct}
              open={isViewDialogOpen}
              onOpenChange={setIsViewDialogOpen}
            />
          )}

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product and remove its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Product
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
