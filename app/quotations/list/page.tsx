"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, FileDown, Edit, Trash2 } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import type React from "react"
import { Eye } from "lucide-react"
import { ViewQuotationDialog } from "./view-quotation/page"

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
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null)
const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const res = await fetch("/api/quotations")
        if (!res.ok) throw new Error("Failed to fetch quotations")
        const data = await res.json()
        setQuotations(data)
      } catch (err) {
        console.error("Error fetching quotations:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuotations()
  }, [])

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

const handleDelete = async (id: string) => {
  if (!confirm("Are you sure you want to delete this quotation?")) return
  
  try {
    const response = await fetch(`/api/quotations?id=${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) throw new Error('Failed to delete quotation')

    // Refresh the list after deletion
    setQuotations(prev => prev.filter(q => q.id !== id))
  } catch (error) {
    console.error("Error deleting quotation:", error)
    alert("Failed to delete quotation")
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
      `$${quotation.total}`
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
        Total: quotation.total
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
            <span>Quotation List</span>
          </div>
          <h1 className="text-2xl font-bold">Quotation List</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search this table" 
                  className="pl-10" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
               
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
                  onClick={() => router.push("/quotations/create")}
                >
                  Create
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Reference</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Warehouse</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Grand Total</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4">
                      Loading...
                    </td>
                  </tr>
                ) : filteredQuotations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4 text-gray-500">
                      {quotations.length === 0 ? "No quotations found." : "No matching quotations found."}
                    </td>
                  </tr>
                ) : (
                  filteredQuotations.map((quotation) => (
                    <tr key={quotation.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="p-4">{quotation.date}</td>
                      <td className="p-4 text-blue-600">{quotation.reference}</td>
                      <td className="p-4">{quotation.customer_name}</td>
                      <td className="p-4">{quotation.warehouse_name}</td>
                      <td className="p-4">
                        <Badge
                          variant={quotation.status === "approved" ? "default" : "secondary"}
                          className={
                            quotation.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4">${quotation.total}</td>
                          <td className="p-4">
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
      onClick={() => handleDelete(quotation.id)}
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

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Rows per page:
              <Select defaultValue="10">
                <SelectTrigger className="w-16 ml-2 inline-flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredQuotations.length > 0 ? `1 - ${filteredQuotations.length}` : '0'} of {filteredQuotations.length}
              </span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>
                  prev
                </Button>
                <Button variant="outline" size="sm" disabled>
                  next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {viewQuotation && (
  <ViewQuotationDialog
    quotation={viewQuotation}
    open={isViewDialogOpen}
    onOpenChange={setIsViewDialogOpen}
  />
)}
    </DashboardLayout>
  )
}