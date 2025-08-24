"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, FileText, Download, Plus, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import DashboardLayout from "@/components/dashboard-layout"
import { useGetTransfersQuery, useDeleteTransferMutation } from "@/lib/slices/transfersApi"

export default function TransferListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  const { data, isLoading } = useGetTransfersQuery({ page: currentPage, limit: rowsPerPage, search: searchTerm })
  const transfers = data?.data || []
  const pagination = data?.pagination
  const [deleteTransfer, { isLoading: isDeleting }] = useDeleteTransferMutation()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const totalPages = pagination?.totalPages || 1

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white p-6 rounded-lg border">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <nav className="text-sm text-gray-600 mb-2">Transfer &gt; Transfer List</nav>
          <h1 className="text-2xl font-bold">Transfer List</h1>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search transfers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const doc = new jsPDF()
                  doc.text('Transfers', 14, 16)
                  const rows = transfers.map((t:any)=> [t.date, t.reference, t.from_warehouse_id || '-', t.to_warehouse_id || '-', t.status || 'pending'])
                  autoTable(doc, { head: [["Date","Reference","From","To","Status"]], body: rows, startY: 20 })
                  doc.save('transfers.pdf')
                }}>
                  <FileText className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const worksheet = XLSX.utils.json_to_sheet(
                    transfers.map((t:any)=> ({ Date: t.date, Reference: t.reference, From: t.from_warehouse_id || '-', To: t.to_warehouse_id || '-', Status: t.status || 'pending' }))
                  )
                  const workbook = XLSX.utils.book_new()
                  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transfers')
                  XLSX.writeFile(workbook, 'transfers.xlsx')
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  EXCEL
                </Button>
                <Link href="/transfer/create">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Reference</th>
                    <th className="text-left p-4">From Warehouse</th>
                    <th className="text-left p-4">To Warehouse</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center p-8 text-gray-500">
                        No transfers found
                      </td>
                    </tr>
                  ) : (
                    transfers.map((transfer: any) => (
                      <tr key={transfer.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <input type="checkbox" className="rounded" />
                        </td>
                        <td className="p-4">{transfer.date}</td>
                        <td className="p-4 font-medium">{transfer.reference}</td>
                        <td className="p-4">{transfer.from_warehouse_id || '-'}</td>
                        <td className="p-4">{transfer.to_warehouse_id || '-'}</td>
                        <td className="p-4">{getStatusBadge(transfer.status || 'pending')}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={async ()=>{ await deleteTransfer(transfer.id).unwrap() }} disabled={isDeleting}>
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

            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rows per page:</span>
                <Select
                  value={rowsPerPage.toString()}
                  onValueChange={(value) => setRowsPerPage(Number.parseInt(value))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p)=>Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p)=>p + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
