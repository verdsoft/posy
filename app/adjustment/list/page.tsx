"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { Search, ChevronLeft, ChevronRight, FileDown, Eye, Edit, Trash2 } from "lucide-react"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { toast } from "sonner"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthGuard from "@/components/AuthGuard"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import { Skeleton } from "@/components/ui/skeleton"
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
import type { Adjustment, AdjustmentItem, AdjustmentDetails, PaginatedAdjustmentResponse } from "@/lib/types/adjustment"
import { useGetAdjustmentsQuery, useDeleteAdjustmentMutation } from "@/lib/slices/adjustmentsApi"

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
            <h1 className="text-xl font-semibold">Adjustments</h1>
          </div>

          <Card>
            <CardHeader className="p-4 pb-0">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <form onSubmit={handleSearch} className="flex items-center gap-2">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search adjustments..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="outline" size="sm">
                    Search
                  </Button>
                </form>
                <div className="flex items-center gap-2">
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
                    <FileDown className="h-4 w-4 mr-2" /> Excel
                  </Button>
                  <Link href="/adjustment/create">
                    <Button size="sm">Create Adjustment</Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[150px]">Reference</TableHead>
                      <TableHead className="w-[180px]">Warehouse</TableHead>
                      <TableHead className="w-[120px]">Type</TableHead>
                      <TableHead className="w-[120px] text-right">Total Products</TableHead>
                      <TableHead className="w-[150px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-4 w-[120px] ml-auto" /></TableCell>
                          <TableCell className="flex gap-2 w-[150px]">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : isError ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Failed to load adjustments
                        </TableCell>
                      </TableRow>
                    ) : data?.data.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No adjustments found
                        </TableCell>
                      </TableRow>
                    ) : (
                      data?.data.map((adjustment) => (
                        <TableRow key={adjustment.id}>
                          <TableCell className="w-[120px]">
                            {format(new Date(adjustment.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className="w-[150px]">{adjustment.reference}</TableCell>
                          <TableCell className="w-[180px]">{adjustment.warehouse_name}</TableCell>
                          <TableCell className="w-[120px]">
                            <Badge 
                              variant={adjustment.type === 'addition' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {adjustment.type.charAt(0).toUpperCase() + adjustment.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-[120px] text-right">
                            {adjustment.item_count}
                          </TableCell>
                          <TableCell className="w-[150px]">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewAdjustment(adjustment.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/adjustment/edit/${adjustment.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(adjustment.id)}
                                className="text-destructive hover:text-destructive/80"
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {data && (
                <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
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

                  <Pagination>
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
                        Page {page} of {data.pagination.totalPages}
                      </span>

                      <PaginationItem>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPage((old) => old + 1)}
                          disabled={page >= (data?.pagination.totalPages || 1)}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </CardContent>
          </Card>
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