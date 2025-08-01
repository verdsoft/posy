"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, FileDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function PurchaseReturnList() {
  const router = useRouter()
  const [purchaseReturns, setPurchaseReturns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedReturn, setSelectedReturn] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Fetch purchase returns
  useEffect(() => {
    const fetchPurchaseReturns = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/api/purchases-return?search=${searchTerm}&page=${page}&limit=${limit}`)
        if (!res.ok) throw new Error("Failed to fetch purchase returns")
        const data = await res.json()
        setPurchaseReturns(data.data)
        setTotalPages(Math.ceil(data.pagination.total / limit))
      } catch (error) {
        toast.error("Failed to load purchase returns")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchPurchaseReturns()
  }, [searchTerm, page, limit])

  // Delete purchase return
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this purchase return?")) return
    try {
      const res = await fetch(`/api/purchases-return/${id}`, { method: "DELETE" })
      if (res.ok) {
        setPurchaseReturns(purchaseReturns.filter(ret => ret.id !== id))
        toast.success("Purchase return deleted successfully")
      } else {
        throw new Error("Failed to delete purchase return")
      }
    } catch (error) {
      toast.error("Failed to delete purchase return")
      console.error(error)
    }
  }

  // View purchase return details
  const fetchReturnDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/purchases-return/${id}`)
      if (!response.ok) throw new Error("Failed to fetch purchase return details")
      return await response.json()
    } catch (error) {
      toast.error("Failed to load purchase return details")
      console.error(error)
      return null
    }
  }

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.text('Purchase Returns List', 14, 16)
    
    const tableData = purchaseReturns.map(ret => [
      ret.date,
      ret.reference,
      ret.supplier_name,
      ret.warehouse_name,
      ret.status,
      `$${Number(ret.total)}`
    ])
    
    autoTable(doc, {
      head: [['Date', 'Reference', 'Supplier', 'Warehouse', 'Status', 'Total']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('purchase-returns.pdf')
  }

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      purchaseReturns.map(ret => ({
        Date: ret.date,
        Reference: ret.reference,
        Supplier: ret.supplier_name,
        Warehouse: ret.warehouse_name,
        Status: ret.status,
        Total: Number(ret.total),
        'Purchase Reference': ret.purchase_reference
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Returns")
    XLSX.writeFile(workbook, "purchase-returns.xlsx")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Purchase Return</span>
            <span>|</span>
            <span>Purchase Return List</span>
          </div>
          <h1 className="text-2xl font-bold">Purchase Return List</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  placeholder="Search this table..."
                  className="w-64"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
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
              <Button 
                className="bg-[#1a237e] hover:bg-purple-700"
                onClick={() => router.push('/purchases-return/create')}
              >
                Create
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
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Reference</th>
                  <th className="text-left p-3">Supplier</th>
                  <th className="text-left p-3">Warehouse</th>
                  <th className="text-left p-3">Purchase Reference</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Total</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center p-6">Loading...</td>
                  </tr>
                ) : purchaseReturns.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-6">No purchase returns found.</td>
                  </tr>
                ) : (
                  purchaseReturns.map((ret) => (
                    <tr key={ret.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input type="checkbox" />
                      </td>
                      <td className="p-3">{ret.date}</td>
                      <td className="p-3">{ret.reference}</td>
                      <td className="p-3">{ret.supplier_name}</td>
                      <td className="p-3">{ret.warehouse_name}</td>
                      <td className="p-3">{ret.purchase_reference}</td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {ret.status}
                        </span>
                      </td>
                      <td className="p-3">${Number(ret.total)}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const details = await fetchReturnDetails(ret.id)
                              if (details) {
                                setSelectedReturn(details)
                                setIsViewDialogOpen(true)
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(ret.id)}
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

          <div className="p-4 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Rows per page:</span>
              <select 
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
                className="border rounded text-sm p-1"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {purchaseReturns.length > 0 
                  ? `${(page - 1) * limit + 1}-${Math.min(page * limit, purchaseReturns.length)} of ${purchaseReturns.length}` 
                  : '0-0 of 0'}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* View Dialog */}
      {selectedReturn && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Purchase Return Details - {selectedReturn.reference}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1 text-sm">{selectedReturn.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
                  <p className="mt-1 text-sm">{selectedReturn.supplier_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Warehouse</h3>
                  <p className="mt-1 text-sm">{selectedReturn.warehouse_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Purchase Reference</h3>
                  <p className="mt-1 text-sm">{selectedReturn.purchase_reference}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {selectedReturn.status}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total</h3>
                  <p className="mt-1 text-sm">${Number(selectedReturn.total)}</p>
                </div>
              </div>

              {selectedReturn.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="mt-1 text-sm p-3 bg-gray-50 rounded">
                    {selectedReturn.notes}
                  </p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Items</h3>
                <div className="border rounded overflow-hidden">
                  <Table>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Product</th>
                        <th className="text-left p-3 text-sm font-medium">Cost</th>
                        <th className="text-left p-3 text-sm font-medium">Quantity</th>
                        <th className="text-left p-3 text-sm font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <TableBody>
                      {selectedReturn.items?.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell className="p-3 text-sm">{item.product_name || item.product_id}</TableCell>
                          <TableCell className="p-3 text-sm">${Number(item.unit_cost)}</TableCell>
                          <TableCell className="p-3 text-sm">{item.quantity}</TableCell>
                          <TableCell className="p-3 text-sm">${Number(item.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  )
}
