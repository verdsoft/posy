"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, FileDown, Edit, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type React from "react"
import { Eye } from "lucide-react"
import { ViewQuotationDialog } from "./view-quotation/page"
import { useGetQuotationsQuery, useDeleteQuotationMutation } from "@/lib/slices/quotationsApi"
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

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Quotation {
  id: string
  date: string
  reference: string
  customer_name: string
  warehouse_name: string
  status: string
  total: number
}

export default function QuotationList() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null)

  // RTK Query hooks
  const { data: quotations = [], isLoading, isError } = useGetQuotationsQuery()
  const [deleteQuotation, { isLoading: isDeleting }] = useDeleteQuotationMutation()

  // Filter quotations based on search term
  const filteredQuotations = useMemo(() => {
    if (!searchTerm) return quotations
    
    const lowerCaseSearch = searchTerm.toLowerCase()
    return quotations.filter(quotation => 
      quotation.reference.toLowerCase().includes(lowerCaseSearch) ||
      quotation.customer_name.toLowerCase().includes(lowerCaseSearch) ||
      quotation.warehouse_name.toLowerCase().includes(lowerCaseSearch) ||
      quotation.status.toLowerCase().includes(lowerCaseSearch) ||
      quotation.total.toString().includes(searchTerm)
    )
  }, [quotations, searchTerm])

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

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    
    // Add title
    doc.text('Quotation List', 14, 16)
    
    // Prepare data for the table
    const tableData = filteredQuotations.map(quotation => [
      quotation.date,
      quotation.reference,
      quotation.customer_name,
      quotation.warehouse_name,
      quotation.status,
      `$${Number(quotation.total) }`
    ])
    
    // Add table
    autoTable(doc, {
      head: [['Date', 'Reference', 'Customer', 'Warehouse', 'Status', 'Total']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('quotations.pdf')
  }

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredQuotations.map(quotation => ({
        Date: quotation.date,
        Reference: quotation.reference,
        Customer: quotation.customer_name,
        Warehouse: quotation.warehouse_name,
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
                ) : filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6 text-gray-500">No quotations found</td>
                  </tr>
                ) : (
                  filteredQuotations.map((quotation) => (
                    <tr key={quotation.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{quotation.date}</td>
                      <td className="p-3 font-medium">{quotation.reference}</td>
                      <td className="p-3">{quotation.customer_name}</td>
                      <td className="p-3">{quotation.warehouse_name}</td>
                      <td className="p-3">
                        <Badge 
                          variant={quotation.status === 'sent' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {quotation.status}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">${Number(quotation.total) }</td>
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
        </div>

        {/* View Quotation Dialog */}
        {viewQuotation && (
          <ViewQuotationDialog
            quotation={viewQuotation}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
        )}

        {/* Delete Confirmation Dialog */}
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