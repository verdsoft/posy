"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, FileDown, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type React from "react"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import AuthGuard from "@/components/AuthGuard"
import { useGetSalesQuery, useDeleteSaleMutation } from "@/lib/slices/salesApi"
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
import { Sale } from "@/lib/types/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination as UIPagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function SaleList() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [saleToDelete, setSaleToDelete] = useState<string | null>(null)

  const { data, isLoading, isError } = useGetSalesQuery({ page, limit, search: searchTerm })
  const [deleteSale, { isLoading: isDeleting }] = useDeleteSaleMutation()
  
  const sales = data?.data || [];
  const pagination = data?.pagination;

  const handleDeleteClick = (id: string) => {
    setSaleToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteSale = async () => {
    if (!saleToDelete) return
    
    try {
      await deleteSale(saleToDelete).unwrap()
      toast.success("Sale deleted successfully")
    } catch (error) {
      console.error("Error deleting sale:", error)
      toast.error("Failed to delete sale")
    } finally {
      setDeleteDialogOpen(false)
      setSaleToDelete(null)
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Sales List', 14, 16)
    
    const tableData = sales.map(sale => [
      new Date(sale.date).toLocaleDateString(),
      sale.reference,
      sale.customer_name || 'N/A',
      sale.warehouse_name || 'N/A',
      sale.status,
      `$${Number(sale.total).toFixed(2)}`,
      `$${Number(sale.paid).toFixed(2)}`,
      `$${Number(sale.due).toFixed(2)}`,
      sale.payment_status
    ])
    
    autoTable(doc, {
      head: [['Date', 'Reference', 'Customer', 'Warehouse', 'Status', 'Total', 'Paid', 'Due', 'Payment Status']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('sales.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      sales.map(sale => ({
        Date: new Date(sale.date).toLocaleDateString(),
        Reference: sale.reference,
        Customer: sale.customer_name || 'N/A',
        Warehouse: sale.warehouse_name || 'N/A',
        Status: sale.status,
        Total: Number(sale.total),
        Paid: Number(sale.paid),
        Due: Number(sale.due),
        'Payment Status': sale.payment_status
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales")
    XLSX.writeFile(workbook, "sales.xlsx")
  }

  const handleCreate = () => {
    router.push('/sales/create')
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span>Sales</span>
              <span>|</span>
              <span>Sales List</span>
            </div>
            <h1 className="text-2xl font-bold">Sales List</h1>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Input
                    placeholder="Search sales..."
                    className="w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  Excel
                </Button>
                <Button
                  className="bg-[#1a237e] hover:bg-purple-700"
                  onClick={handleCreate}
                >
                  Create Sale
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Reference</th>
                    <th className="text-left p-3">Customer</th>
                    <th className="text-left p-3">Warehouse</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Total</th>
                    <th className="text-left p-3">Paid</th>
                    <th className="text-left p-3">Due</th>
                    <th className="text-left p-3">Payment Status</th>
                    <th className="text-left p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={10} className="text-center p-6">Loading...</td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={10} className="text-center p-6 text-red-600">Failed to load sales</td>
                    </tr>
                  ) : sales.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center p-6 text-gray-500">No sales found</td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{new Date(sale.date).toLocaleDateString()}</td>
                        <td className="p-3 font-medium">{sale.reference}</td>
                        <td className="p-3">{sale.customer_name}</td>
                        <td className="p-3">{sale.warehouse_name}</td>
                        <td className="p-3">{sale.status}</td>
                        <td className="p-3 font-medium">${Number(sale.total).toFixed(2)}</td>
                        <td className="p-3">${Number(sale.paid).toFixed(2)}</td>
                        <td className="p-3">${Number(sale.due).toFixed(2)}</td>
                        <td className="p-3">{sale.payment_status}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/sales/edit/${sale.id}`)}
                            >
                              <Edit className="h-4 w-4 text-green-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(sale.id)}
                              disabled={isDeleting}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination && (
                <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">Rows per page</p>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => setLimit(Number(value))}
                    >
                      <SelectTrigger className="h-8 w-[70px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 25, 50, 100].map((size) => (
                          <SelectItem key={size} value={size.toString()}>
                            {size}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <UIPagination>
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPage((old) => Math.max(old - 1, 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="h-4 w-4 mr-2" />
                          Previous
                        </Button>
                      </PaginationItem>
                      
                      <span className="text-sm text-muted-foreground mx-4">
                        Page {page} of {pagination.totalPages}
                      </span>

                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPage((old) => old + 1)}
                          disabled={page >= (pagination.totalPages || 1)}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </UIPagination>
                </div>
              )}
          </div>
        </div>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the sale
                and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteSale}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Sale"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </AuthGuard>
  )
}
