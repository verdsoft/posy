"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Search, ChevronLeft, ChevronRight, FileDown, Plus } from "lucide-react"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from "sonner"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthGuard from "@/components/AuthGuard"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table" // Keep for Dialog internal table
import type { AdjustmentDetails } from "@/lib/types/adjustment"
import { useGetAdjustmentsQuery, useDeleteAdjustmentMutation } from "@/lib/slices/adjustmentsApi"
import { TableActions } from "@/components/ui/table-actions"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function AdjustmentList() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAdjustment, setSelectedAdjustment] = useState<string | null>(null)
  const [selectedAdjustmentDetails, setSelectedAdjustmentDetails] = useState<AdjustmentDetails | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [adjustmentToDelete, setAdjustmentToDelete] = useState<string | null>(null)
  const router = useRouter()

  // RTK Query hooks
  const { data, isLoading, isError } = useGetAdjustmentsQuery({
    page,
    limit,
    search: searchQuery
  })
  const [deleteAdjustment, { isLoading: isDeleting }] = useDeleteAdjustmentMutation()

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Adjustment List', 14, 16)

    const tableData = data?.data.map(adjustment => [
      format(new Date(adjustment.date), 'MMM dd, yyyy'),
      adjustment.reference,
      adjustment.warehouse_name,
      adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1),
      adjustment.item_count?.toString() || '0'
    ]) || []

    autoTable(doc, {
      head: [['Date', 'Reference', 'Warehouse', 'Type', 'Total Products']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })

    doc.save('adjustments.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      data?.data.map(adjustment => ({
        Date: format(new Date(adjustment.date), 'MMM dd, yyyy'),
        Reference: adjustment.reference,
        Warehouse: adjustment.warehouse_name,
        Type: adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1),
        'Total Products': adjustment.item_count || 0
      })) || []
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Adjustments")
    XLSX.writeFile(workbook, "adjustments.xlsx")
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const handleViewAdjustment = async (id: string) => {
    try {
      const response = await fetch(`/api/adjustments/${id}`)
      if (response.ok) {
        const details = await response.json()
        setSelectedAdjustmentDetails(details)
        setSelectedAdjustment(id)
        setIsDialogOpen(true)
      } else {
        toast.error("Failed to load adjustment details")
      }
    } catch (error) {
      console.error("Error fetching adjustment details:", error)
      toast.error("Failed to load adjustment details")
    }
  }

  const handleDeleteClick = (id: string) => {
    setAdjustmentToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteAdjustment = async () => {
    if (!adjustmentToDelete) return

    try {
      await deleteAdjustment(adjustmentToDelete).unwrap()
      toast.success("Adjustment deleted successfully")
    } catch (error) {
      console.error("Error deleting adjustment:", error)
      toast.error("Failed to delete adjustment")
    } finally {
      setDeleteDialogOpen(false)
      setAdjustmentToDelete(null)
    }
  }

  const getStatusBadge = (type: string) => {
    return (
      <Badge
        variant={type === 'addition' ? 'default' : 'destructive'}
        className="text-xs"
      >
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>Inventory</span>
              <span>|</span>
              <span>Adjustments</span>
            </div>
            {/* <h1 className="text-xl font-semibold">Adjustments</h1> */}
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search adjustments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-64 h-8 text-sm pl-8"
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
                  <FileDown className="h-3 w-3 mr-1" /> PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs flex-1 md:flex-none"
                  onClick={exportToExcel}
                >
                  <FileDown className="h-3 w-3 mr-1" /> Excel
                </Button>
                <Link href="/adjustment/create" className="flex-1 md:flex-none">
                  <Button className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs w-full">
                    <Plus className="h-3 w-3 mr-1" />
                    Create Adjustment
                  </Button>
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#f8f9fa]">
                  <tr>
                    <th className="text-left p-3 font-medium">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Reference</th>
                    <th className="text-left p-3 font-medium">Warehouse</th>
                    <th className="text-left p-3 font-medium">Type</th>
                    <th className="text-right p-3 font-medium">Total Products</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-muted-foreground">Loading...</td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-red-500">Failed to load adjustments</td>
                    </tr>
                  ) : data?.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center p-8 text-muted-foreground">No adjustments found</td>
                    </tr>
                  ) : (
                    data?.data.map((adjustment) => (
                      <tr key={adjustment.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <input type="checkbox" className="rounded border-gray-300" />
                        </td>
                        <td className="p-3">
                          {format(new Date(adjustment.date), 'MMM dd, yyyy')}
                        </td>
                        <td className="p-3 font-medium">{adjustment.reference}</td>
                        <td className="p-3">{adjustment.warehouse_name}</td>
                        <td className="p-3">
                          {getStatusBadge(adjustment.type)}
                        </td>
                        <td className="p-3 text-right">
                          {adjustment.item_count}
                        </td>
                        <td className="p-3 text-right">
                          <TableActions
                            onView={() => handleViewAdjustment(adjustment.id)}
                            onEdit={() => router.push(`/adjustment/edit/${adjustment.id}`)}
                            onDelete={() => handleDeleteClick(adjustment.id)}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {data && (
              <div className="p-3 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xs text-muted-foreground">
                  Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of {data.pagination.total} entries
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
                      {/* Simplified pagination for now */}
                      <span className="text-xs">Page {page} of {data.pagination.totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage((old) => old + 1)}
                      disabled={page >= (data.pagination.totalPages || 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* View Adjustment Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adjustment Details</DialogTitle>
            </DialogHeader>
            {selectedAdjustmentDetails && (
              <div className="space-y-6">
                {/* Adjustment Header */}
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Adjustment Information</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Reference</label>
                        <p className="text-sm font-medium">{selectedAdjustmentDetails.reference}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Date</label>
                        <p className="text-sm font-medium">{format(new Date(selectedAdjustmentDetails.date), 'MMM dd, yyyy')}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Warehouse</label>
                        <p className="text-sm font-medium">{selectedAdjustmentDetails.warehouse_name}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Type</label>
                        <Badge variant={selectedAdjustmentDetails.type === 'addition' ? 'default' : 'secondary'}>
                          {selectedAdjustmentDetails.type.charAt(0).toUpperCase() + selectedAdjustmentDetails.type.slice(1)}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Total Items</label>
                        <p className="text-sm font-medium">{selectedAdjustmentDetails.item_count}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Notes</label>
                        <p className="text-sm font-medium">{selectedAdjustmentDetails.notes || 'No notes'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Adjustment Items */}
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base">Adjustment Items</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Type</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedAdjustmentDetails.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.product_name}</TableCell>
                              <TableCell>{item.product_code}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant={selectedAdjustmentDetails.type === 'addition' ? 'default' : 'secondary'}>
                                  {selectedAdjustmentDetails.type.charAt(0).toUpperCase() + selectedAdjustmentDetails.type.slice(1)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the adjustment
                and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAdjustment}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Adjustment"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DashboardLayout>
    </AuthGuard>
  )
}