"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthGuard from "@/components/AuthGuard"
import { fetchAdjustments, fetchAdjustmentDetails } from "@/lib/api"
import Link from "next/link"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { useState } from "react"
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, ChevronLeft, ChevronRight,  X, FileDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type React from "react"
import { Edit, Trash2,Eye } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export interface Adjustment {
  id: string;
  reference: string;
  warehouse_name: string;
  date: Date;
  type: 'addition' | 'subtraction';
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  quantity?: number; // Added based on your table usage
}

export default function AdjustmentList() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAdjustment, setSelectedAdjustment] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery<PaginatedResponse<Adjustment>>({
    queryKey: ['adjustments', page, limit, searchQuery],
    queryFn: () => fetchAdjustments({
      page,
      limit,
      search: searchQuery
    }),
    staleTime: 1000 * 60 // 1 minute
  })

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.text('Adjustment List', 14, 16)

    // Prepare data for the table
    const tableData = data?.data.map(adjustment => [
      format(new Date(adjustment.date), 'MMM dd, yyyy'),
      adjustment.reference,
      adjustment.warehouse_name,
      adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1),
      adjustment.quantity?.toString() || '0'
    ]) || []

    // Add table
    autoTable(doc, {
      head: [['Date', 'Reference', 'Warehouse', 'Type', 'Total Products']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })

    doc.save('adjustments.pdf')
  }

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data?.data.map(adjustment => ({
        Date: format(new Date(adjustment.date), 'MMM dd, yyyy'),
        Reference: adjustment.reference,
        Warehouse: adjustment.warehouse_name,
        Type: adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1),
        'Total Products': adjustment.quantity || 0
      })) || []
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Adjustments")
    XLSX.writeFile(workbook, "adjustments.xlsx")
  }

  // Fetch single adjustment details when dialog opens
  const { data: adjustmentDetails, isLoading: isDetailsLoading } = useQuery({
    queryKey: ['adjustment', selectedAdjustment],
    queryFn: () => selectedAdjustment ? fetchAdjustmentDetails(selectedAdjustment) : null,
    enabled: !!selectedAdjustment
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1) // Reset to first page when searching
  }

  const handleViewAdjustment = (id: string) => {
    setSelectedAdjustment(id)
    setIsDialogOpen(true)
  }

  const handleDeleteAdjustment = async (id: string) => {
  if (!confirm("Are you sure you want to delete this adjustment?")) return
  
  try {
    const response = await fetch(`/api/adjustments?id=${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('Failed to delete adjustment')

    // Refresh the data after deletion
    queryClient.invalidateQueries(['adjustments', page, limit, searchQuery])
    toast.success("Adjustment deleted successfully")
  } catch (error) {
    console.error("Error deleting adjustment:", error)
    toast.error("Failed to delete adjustment")
  }
}

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span>Adjustment</span>
              <span>|</span>
              <span>Adjustment List</span>
            </div>
            <h1 className="text-2xl font-bold">Adjustment List</h1>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex items-center justify-between">
              <form onSubmit={handleSearch} className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search adjustments..."
                    className="w-64 pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="outline">
                  Search
                </Button>
              </form>
              <div className="flex items-center gap-2">
                {/* <Button variant="outline" className="text-blue-600 bg-transparent">
                  🔍 Filter
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToPDF}
                >
                  <FileDown className="h-4 w-4 mr-2" /> PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToExcel}
                >
                  <FileDown className="h-4 w-4 mr-2" /> EXCEL
                </Button>
                <Link href="/adjustment/create">
                  <Button className="bg-[#1a237e] hover:bg-purple-700">Create</Button>
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">
                      <input type="checkbox" />
                    </th>
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Reference</th>
                    <th className="text-left p-3">Warehouse</th>
                    <th className="text-left p-3">Type</th>
                    <th className="text-left p-3">Total Products</th>
                    <th className="text-left p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full mb-2" />
                        ))}
                      </td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-red-500">
                        Failed to load adjustments
                      </td>
                    </tr>
                  ) : data?.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500">
                        No adjustments found
                      </td>
                    </tr>
                  ) : (
                    data?.data.map((adjustment) => (
                      <tr key={adjustment.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <input type="checkbox" />
                        </td>
                        <td className="p-3">
                          {format(new Date(adjustment.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="p-3 font-medium">
                          {adjustment.reference}
                        </td>
                        <td className="p-3">
                          {adjustment.warehouse_name}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${adjustment.type === 'addition'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          {adjustment.quantity}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAdjustment(adjustment.id)}
                            >
                             <Eye className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/adjustment/edit/${adjustment.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteAdjustment(adjustment.id)}
                              className="text-red-600 hover:text-red-700"
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
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="border rounded text-sm p-1"
                >
                  {[10, 25, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              {data && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <Button
                        variant="ghost"
                        onClick={() => setPage((old) => Math.max(old - 1, 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                    </PaginationItem>

                    <span className="text-sm text-gray-600 mx-4">
                      {data.pagination.total > 0
                        ? `${(page - 1) * limit + 1}-${Math.min(page * limit, data.pagination.total)} of ${data.pagination.total}`
                        : '0-0 of 0'}
                    </span>

                    <PaginationItem>
                      <Button
                        variant="ghost"
                        onClick={() => setPage((old) => old + 1)}
                        disabled={page >= (data?.pagination.totalPages || 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </div>
        </div>

        {/* View Adjustment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex justify-between items-center">
                <DialogTitle>Adjustment Details</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsDialogOpen(false)}
                >
                  {/* <X className="h-4 w-4" /> */}
                </Button>
              </div>
            </DialogHeader>

            {isDetailsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : adjustmentDetails ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Reference</h3>
                    <p className="mt-1 text-sm">{adjustmentDetails.reference}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date</h3>
                    <p className="mt-1 text-sm">
                      {format(new Date(adjustmentDetails.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Warehouse</h3>
                    <p className="mt-1 text-sm">{adjustmentDetails.warehouse_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Type</h3>
                    <p className="mt-1 text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${adjustmentDetails.type === 'addition'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {adjustmentDetails.type.charAt(0).toUpperCase() + adjustmentDetails.type.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                    <p className="mt-1 text-sm">
                      {format(new Date(adjustmentDetails.created_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <p className="text-sm p-3 bg-gray-50 rounded">
                    {adjustmentDetails.notes || 'No notes provided'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Items</h3>
                  <div className="border rounded overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium">Product</th>
                          <th className="text-left p-3 text-sm font-medium">Code</th>
                          {/* <th className="text-left p-3 text-sm font-medium">Previous Stock</th> */}
                          <th className="text-left p-3 text-sm font-medium">Quantity</th>
                          <th className="text-left p-3 text-sm font-medium">Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adjustmentDetails.items.map((item) => (
                          <tr key={item.id} className="border-t">
                            <td className="p-3 text-sm">{item.product_id}</td>
                            <td className="p-3 text-sm">{item.product_id}</td>
                            {/* <td className="p-3 text-sm">{item.pre_stock}</td> */}
                            <td className="p-3 text-sm">{item.quantity}</td>
                            <td className="p-3 text-sm">
                              <span className={`px-2 py-1 rounded text-xs ${item.type === 'addition'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                                }`}>
                                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">No details available</p>
            )}
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </AuthGuard>
  )
}
