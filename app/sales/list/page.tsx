"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
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
import { TableActions } from "@/components/ui/table-actions"
import { ViewSaleDialog } from "@/components/sales/view-sale-dialog"
import { Badge } from "@/components/ui/badge"

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

  // View Dialog State
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)

  const { data, isLoading, isError } = useGetSalesQuery({ page, limit, search: searchTerm })
  const [deleteSale, { isLoading: isDeleting }] = useDeleteSaleMutation()

  const sales = data?.data || [];
  const pagination = data?.pagination;

  const handleView = (sale: any) => {
    setSelectedSale(sale)
    setViewDialogOpen(true)
  }

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
      sale.status,
      `$${Number(sale.total).toFixed(2)}`,
      `$${Number(sale.paid).toFixed(2)}`,
      `$${Number(sale.due).toFixed(2)}`,
      sale.payment_status
    ])

    autoTable(doc, {
      head: [['Date', 'Reference', 'Customer', 'Status', 'Total', 'Paid', 'Due', 'Payment Status']],
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
        <div className="p-4 md:p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>Sales</span>
              <span>|</span>
              <span>List</span>
            </div>
            {/* <h1 className="text-xl font-semibold">Sales List</h1> */}
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search sales..."
                    className="w-full md:w-64 h-8 text-sm pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs flex-1 md:flex-none"
                  onClick={exportToPDF}
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs flex-1 md:flex-none"
                  onClick={exportToExcel}
                >
                  <FileDown className="h-3 w-3 mr-1" />
                  Excel
                </Button>
                <Button
                  className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none"
                  onClick={handleCreate}
                >
                  Create Sale
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
                    <th className="text-left p-2 font-medium">Date</th>
                    <th className="text-left p-2 font-medium">Reference</th>
                    <th className="text-left p-2 font-medium">Customer</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Total</th>
                    <th className="text-left p-2 font-medium">Paid</th>
                    <th className="text-left p-2 font-medium">Due</th>
                    <th className="text-left p-2 font-medium">Payment Status</th>
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
                      <td colSpan={10} className="text-center p-8 text-red-500">Failed to load sales</td>
                    </tr>
                  ) : sales.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center p-8 text-muted-foreground">No sales found</td>
                    </tr>
                  ) : (
                    sales.map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-2">
                          <input type="checkbox" className="rounded scale-75" />
                        </td>
                        <td className="p-2">{new Date(sale.date).toLocaleDateString()}</td>
                        <td className="p-2 font-medium">{sale.reference}</td>
                        <td className="p-2">{sale.customer_name || 'N/A'}</td>
                        <td className="p-2">
                          <Badge variant={sale.status === 'completed' ? 'default' : 'secondary'} className="text-xs font-normal">
                            {sale.status}
                          </Badge>
                        </td>
                        <td className="p-2 font-medium">${Number(sale.total).toFixed(2)}</td>
                        <td className="p-2 text-green-600">${Number(sale.paid).toFixed(2)}</td>
                        <td className="p-2 text-red-600">${Number(sale.due).toFixed(2)}</td>
                        <td className="p-2">
                          <Badge variant={sale.payment_status === 'paid' ? 'outline' : 'destructive'} className="uppercase text-[10px]">
                            {sale.payment_status}
                          </Badge>
                        </td>
                        <td className="p-2 text-right">
                          <TableActions
                            onView={() => handleView(sale)}
                            onEdit={() => router.push(`/sales/edit/${sale.id}`)}
                            onDelete={() => handleDeleteClick(sale.id.toString())}
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

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage((old) => Math.max(old - 1, 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        // Simple logic to show a few page numbers. Better logic involves current page windowing.
                        // For now, just show first 5 or so.
                        const p = i + 1;
                        return (
                          <Button
                            key={p}
                            variant={page === p ? "default" : "ghost"}
                            size="sm"
                            className={`h-7 w-7 text-xs p-0 ${page === p ? "bg-[#1a237e] hover:bg-purple-700" : ""}`}
                            onClick={() => setPage(p)}
                          >
                            {p}
                          </Button>
                        )
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage((old) => old + 1)}
                      disabled={page >= (pagination.totalPages || 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
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

        <ViewSaleDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          sale={selectedSale}
        />
      </DashboardLayout>
    </AuthGuard>
  )
}
