"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, FileDown, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type React from "react"
import { Eye } from "lucide-react"
import { ViewQuotationDialog } from "./view-quotation/page"
import { useGetQuotationsQuery, useDeleteQuotationMutation } from "@/lib/slices/quotationsApi"
import { Quotation } from "@/lib/types/quotation"
import { toast } from "sonner"
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
import { Pagination as UIPagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface QuotationListItem {
  id: string
  date: string
  reference: string
  customer_name?: string
  warehouse_name?: string
  status: string
  total: number
  created_by?: string
  valid_until?: string | null
}

export default function QuotationList() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const [viewQuotation, setViewQuotation] = useState<QuotationListItem | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null)

  const { data, isLoading, isError } = useGetQuotationsQuery({ page, limit, search: searchTerm })
  const [deleteQuotation, { isLoading: isDeleting }] = useDeleteQuotationMutation()
  
  const quotations = (data?.data || []) as unknown as QuotationListItem[];
  const pagination = data?.pagination;

  const handleDeleteClick = (id: string) => {
    setQuotationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteQuotation = async () => {
    if (!quotationToDelete) return
    
    try {
      await deleteQuotation(quotationToDelete).unwrap()
      toast.success("Quotation deleted successfully")
    } catch (error) {
      console.error("Error deleting quotation:", error)
      toast.error("Failed to delete quotation")
    } finally {
      setDeleteDialogOpen(false)
      setQuotationToDelete(null)
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Quotation List', 14, 16)
    
    const tableData = quotations.map(quotation => [
      quotation.date,
      quotation.reference,
      quotation.customer_name || 'Unknown',
      quotation.warehouse_name || 'Unknown',
      quotation.status,
      `$${Number(quotation.total).toFixed(2)}`
    ])
    
    autoTable(doc, {
      head: [['Date', 'Reference', 'Customer', 'Warehouse', 'Status', 'Total']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('quotations.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      quotations.map(quotation => ({
        Date: quotation.date,
        Reference: quotation.reference,
        Customer: quotation.customer_name || 'Unknown',
        Warehouse: quotation.warehouse_name || 'Unknown',
        Status: quotation.status,
        Total: Number(quotation.total)
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quotations")
    XLSX.writeFile(workbook, "quotations.xlsx")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Sales</span>
            <span>|</span>
            <span>Quotations</span>
          </div>
          <h1 className="text-2xl font-bold">Quotations</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search quotations..."
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
                onClick={() => router.push('/quotations/create')}
              >
                Create Quotation
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
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6">Loading...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-red-600">Failed to load quotations</td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-gray-500">No quotations found</td>
                  </tr>
                ) : (
                  quotations.map((quotation) => (
                    <tr key={quotation.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{quotation.date}</td>
                      <td className="p-3 font-medium">{quotation.reference}</td>
                      <td className="p-3">{quotation.customer_name || 'Unknown'}</td>
                      <td className="p-3">{quotation.warehouse_name || 'Unknown'}</td>
                      <td className="p-3">
                        <Badge 
                          variant={quotation.status === 'sent' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {quotation.status}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">${Number(quotation.total).toFixed(2)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setViewQuotation(quotation)
                              setIsViewDialogOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/quotations/edit/${quotation.id}`)}
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(quotation.id)}
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

        {viewQuotation && (
          <ViewQuotationDialog
            quotation={viewQuotation}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the quotation
                and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteQuotation}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Quotation"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
