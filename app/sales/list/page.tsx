"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, FileDown } from "lucide-react"
import { useRouter } from "next/navigation"
import type React from "react"
import { Sale } from "@/lib/types/api"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from "sonner"
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

export default function SaleList() {
  const router = useRouter()
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Add this function to fetch sale details
  const fetchSaleDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/pos/sales/${id}`)
      if (!response.ok) throw new Error("Failed to fetch sale details")
      return await response.json()
    } catch (error) {
      toast.error("Failed to load sale details")
      console.error(error)
      return null
    }
  }

  // Fetch sales from API
  useEffect(() => {
    fetch("/api/pos/sales")
      .then(res => res.json())
      .then(data => {
        setSales(data)
        setLoading(false)
      })
  }, [])

  // Filtered sales
  const filteredSales = sales.filter(sale =>
    sale.reference?.toLowerCase().includes(search.toLowerCase()) ||
    sale.customer_id?.toString().toLowerCase().includes(search.toLowerCase()) ||
    sale.status?.toLowerCase().includes(search.toLowerCase())
  )

  // Delete sale
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return
    try {
      const res = await fetch(`/api/pos/sales?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setSales(sales.filter(sale => sale.id.toString() !== id))
        toast.success("Sale deleted successfully")
      } else {
        throw new Error("Failed to delete sale")
      }
    } catch (error) {
      toast.error("Failed to delete sale")
      console.error("Delete error:", error)
    }
  }



  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.text('Sale List', 14, 16)

    // Prepare data for the table
    const tableData = filteredSales.map(sale => [
      sale.date ?? "",
      sale.reference ?? "",
      sale.customer_name ?? "",
      sale.status ?? "",
      `$${Number(sale.total ?? 0)}`,
      `$${Number(sale.paid ?? 0)}`,
      `$${Number(sale.due ?? 0)}`,
      sale.payment_status ?? ""
    ])

    // Add table
    autoTable(doc, {
      head: [['Date', 'Reference', 'Customer', 'Status', 'Total', 'Paid', 'Due', 'Payment Status']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })

    doc.save('sales.pdf')
  }

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredSales.map(sale => ({
        Date: sale.date,
        Reference: sale.reference,
        Customer: sale.customer_name,
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

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Sales</span>
            <span>|</span>
            <span>Sale List</span>
          </div>
          <h1 className="text-2xl font-bold">Sale List</h1>
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
                onClick={() => router.push('/sales/create')}
              >
                Create Sale
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
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Grand Total</th>
                  <th className="text-left p-3">Paid</th>
                  <th className="text-left p-3">Due</th>
                  <th className="text-left p-3">Payment Status</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} className="text-center p-6">Loading...</td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center p-6">No sales found.</td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input type="checkbox" />
                      </td>
                      <td className="p-3">{sale.date}</td>
                      <td className="p-3">{sale.reference}</td>
                      <td className="p-3">{sale.customer_name}</td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {sale.status}
                        </span>
                      </td>
                      <td className="p-3">${Number(sale.total)}</td>
                      <td className="p-3">${Number(sale.paid)}</td>
                      <td className="p-3">${Number(sale.due)}</td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {sale.payment_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const saleDetails = await fetchSaleDetails(sale.id.toString())
                              if (saleDetails) {
                                setSelectedSale(saleDetails)
                                setIsViewDialogOpen(true)
                              }
                            }}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/sales/edit/${sale.id}`)}
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button> */}
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(sale.id.toString())}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button> */}
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
              1 - {filteredSales.length} of {sales.length} | prev next
            </div>
          </div>
        </div>
      </div>

      {selectedSale && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Sale Details - {selectedSale.reference}</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1 text-sm">{selectedSale.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                  <p className="mt-1 text-sm">{selectedSale.customer_name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {selectedSale.status}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                  <p className="mt-1 text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {selectedSale.payment_status}
                    </span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Total</h3>
                  <p className="mt-1 text-sm">${Number(selectedSale.total)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Paid</h3>
                  <p className="mt-1 text-sm">${Number(selectedSale.paid)}</p>
                </div>
              </div>

              {selectedSale.notes && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                  <p className="mt-1 text-sm p-3 bg-gray-50 rounded">
                    {selectedSale.notes}
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
                        <th className="text-left p-3 text-sm font-medium">Price</th>
                        <th className="text-left p-3 text-sm font-medium">Quantity</th>
                        <th className="text-left p-3 text-sm font-medium">Subtotal</th>
                      </tr>
                    </thead>
                    <TableBody>
                      {selectedSale.items?.map((item:Sale) => (
                        <TableRow key={item.id}>
                          <TableCell className="p-3 text-sm">{item.product_name || item.product_id}</TableCell>
                          <TableCell className="p-3 text-sm">${Number(item.price)}</TableCell>
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