"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, FileText, Download, Plus, ChevronLeft, ChevronRight, FileDown } from "lucide-react"
import Link from "next/link"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import DashboardLayout from "@/components/dashboard-layout"
import { useGetTransfersQuery, useDeleteTransferMutation } from "@/lib/slices/transfersApi"
import { TableActions } from "@/components/ui/table-actions"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
import { ViewTransferDialog } from "@/components/transfer/view-transfer-dialog"

export default function TransferListPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [limit, setLimit] = useState(10)
  const [page, setPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [transferToDelete, setTransferToDelete] = useState<string | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null)

  const { data, isLoading, isError } = useGetTransfersQuery({ page, limit, search: searchTerm })
  const transfers = data?.data || []
  const pagination = data?.pagination
  const [deleteTransfer, { isLoading: isDeleting }] = useDeleteTransferMutation()

  const handleDeleteClick = (id: string) => {
    setTransferToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteTransfer = async () => {
    if (!transferToDelete) return
    try {
      await deleteTransfer(transferToDelete).unwrap()
      toast.success("Transfer deleted successfully")
    } catch (error) {
      console.error("Error deleting transfer:", error)
      toast.error("Failed to delete transfer")
    } finally {
      setDeleteDialogOpen(false)
      setTransferToDelete(null)
    }
  }

  const handleViewClick = (transfer: any) => {
    setSelectedTransfer(transfer)
    setViewDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Transfer List', 14, 16)
    const rows = transfers.map((t: any) => [
      new Date(t.date).toLocaleDateString(),
      t.reference,
      t.from_warehouse?.name || '-',
      t.to_warehouse?.name || '-',
      t.status
    ])
    autoTable(doc, {
      head: [["Date", "Reference", "From Warehouse", "To Warehouse", "Status"]],
      body: rows,
      startY: 20,
      headStyles: { fillColor: [26, 35, 126] }
    })
    doc.save('transfers.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      transfers.map((t: any) => ({
        Date: new Date(t.date).toLocaleDateString(),
        Reference: t.reference,
        'From Warehouse': t.from_warehouse?.name || '-',
        'To Warehouse': t.to_warehouse?.name || '-',
        Status: t.status
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transfers')
    XLSX.writeFile(workbook, 'transfers.xlsx')
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Transfer</span>
            <span>|</span>
            <span>Transfer List</span>
          </div>
          {/* <h1 className="text-xl font-semibold">Transfer List</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search transfers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-64 h-8 text-sm pl-8"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* Filter button can be implemented later */}
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
              <Link href="/transfer/create" className="flex-1 md:flex-none">
                <Button className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs w-full">
                  <Plus className="h-3 w-3 mr-1" />
                  Create Transfer
                </Button>
              </Link>
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
                  <th className="text-left p-2 font-medium">From Warehouse</th>
                  <th className="text-left p-2 font-medium">To Warehouse</th>
                  <th className="text-left p-2 font-medium">Items</th>
                  <th className="text-left p-2 font-medium">Total</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-right p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-muted-foreground">Loading...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-red-500">Failed to load transfers</td>
                  </tr>
                ) : transfers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-8 text-muted-foreground">No transfers found</td>
                  </tr>
                ) : (
                  transfers.map((transfer: any) => (
                    <tr key={transfer.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2">
                        <input type="checkbox" className="rounded scale-75" />
                      </td>
                      <td className="p-2">{new Date(transfer.date).toLocaleDateString()}</td>
                      <td className="p-2 font-medium">{transfer.reference}</td>
                      <td className="p-2">{transfer.from_warehouse?.name || '-'}</td>
                      <td className="p-2">{transfer.to_warehouse?.name || '-'}</td>
                      <td className="p-2">{transfer.items_count || 0}</td>
                      <td className="p-2 font-medium">${Number(transfer.grand_total || 0).toFixed(2)}</td>
                      <td className="p-2">{getStatusBadge(transfer.status)}</td>
                      <td className="p-2 text-right">
                        <TableActions
                          onView={() => handleViewClick(transfer)}
                          onEdit={() => router.push(`/transfer/edit/${transfer.id}`)}
                          onDelete={() => handleDeleteClick(transfer.id.toString())}
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
              This action cannot be undone. This will permanently delete the transfer
              and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTransfer}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Transfer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ViewTransferDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        transfer={selectedTransfer}
      />
    </DashboardLayout>
  )
}

