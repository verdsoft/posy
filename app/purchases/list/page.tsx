"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileDown, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import type React from "react"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import AuthGuard from "@/components/AuthGuard"
import { ViewPurchaseDialog } from "./view-purchase/page"
import { useGetPurchasesQuery, useDeletePurchaseMutation } from "@/lib/slices/purchasesApi"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination as UIPagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { TableActions } from "@/components/ui/table-actions"
import { Badge } from "@/components/ui/badge"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Purchase {
  id: string
  date: string
  reference: string
  suppliers: { name: string }
  warehouses: { name: string }
  status: string
  total: number
  paid: number
  due: number
  payment_status: string
  purchase_items?: Array<{
    id: number
    quantity: number
    unit_cost: number
    subtotal: number
    products: { name: string, code: string }
  }>
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  discount?: number
  shipping?: number
  notes?: string
}

export default function PurchaseList() {
  const router = useRouter()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [purchaseToDelete, setPurchaseToDelete] = useState<string | null>(null)

  const { data, isLoading, isError } = useGetPurchasesQuery({ page, limit, search: searchTerm })
  const [deletePurchase, { isLoading: isDeleting }] = useDeletePurchaseMutation()

  const purchases = data?.data || [];
  const pagination = data?.pagination;

  const handleDeleteClick = (id: string) => {
    setPurchaseToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeletePurchase = async () => {
    if (!purchaseToDelete) return

    try {
      await deletePurchase(purchaseToDelete).unwrap()
      toast.success("Purchase deleted successfully")
    } catch (error) {
      console.error("Error deleting purchase:", error)
      toast.error("Failed to delete purchase")
    } finally {
      setDeleteDialogOpen(false)
      setPurchaseToDelete(null)
    }
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.text('Purchase List', 14, 16)

    const tableData = purchases.map(purchase => [
      formatDate(purchase.date),
      purchase.reference,
      purchase.suppliers?.name || 'N/A',
      purchase.warehouses?.name || 'N/A',
      (purchase as any).products?.map((p: any) => `${p.name} (${p.quantity})`).join(', ') || 'N/A',
      purchase.status,
      Number(purchase.total),
      Number(purchase.paid),
      Number(purchase.due),
      purchase.payment_status
    ])

    autoTable(doc, {
      head: [['Date', 'Reference', 'Supplier', 'Warehouse', 'Products', 'Status', 'Total', 'Paid', 'Due', 'Payment Status']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [26, 35, 126] }
    })

    doc.save('purchases.pdf')
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      purchases.map(purchase => ({
        Date: formatDate(purchase.date),
        Reference: purchase.reference,
        Supplier: purchase.suppliers?.name || 'N/A',
        Warehouse: purchase.warehouses?.name || 'N/A',
        Products: (purchase as any).products?.map((p: any) => `${p.name} (${p.quantity})`).join(', ') || 'N/A',
        Status: purchase.status,
        Total: Number(purchase.total),
        Paid: Number(purchase.paid),
        Due: Number(purchase.due),
        'Payment Status': purchase.payment_status
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases")
    XLSX.writeFile(workbook, "purchases.xlsx")
  }

  const handleRowClick = (id: string) => {
    // router.push(`/purchases/edit/${id}`)
  }

  const handleCreate = () => {
    router.push('/purchases/create')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    let variant: "default" | "secondary" | "destructive" | "outline" | null | undefined = "secondary";
    if (s === 'received') variant = "default"; // green-ish usually default or success if configured
    if (s === 'ordered') variant = "default"; // or standard
    if (s === 'pending') variant = "secondary";

    // Since badge variants are limited in shadcn default, we can use className to mock specific colors if needed,
    // or just use generic variants. Let's try to match the previous colors with className overrides if standard variants don't fit.

    let className = "text-xs font-normal";
    if (s === 'received') className += " bg-green-100 text-green-800 hover:bg-green-200 border-transparent";
    if (s === 'pending') className += " bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-transparent";
    if (s === 'ordered') className += " bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent";

    return <Badge variant="outline" className={className}>{status}</Badge>
  }

  const getPaymentStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    let className = "text-xs font-normal uppercase";
    if (s === 'paid') className += " bg-green-100 text-green-800 hover:bg-green-200 border-transparent";
    if (s === 'pending') className += " bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-transparent";
    if (s === 'partial') className += " bg-blue-100 text-blue-800 hover:bg-blue-200 border-transparent";

    return <Badge variant="outline" className={className}>{status}</Badge>
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>Business</span>
              <span>|</span>
              <span>Purchases</span>
            </div>
            {/* <h1 className="text-xl font-semibold">Purchases</h1> */}
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="Search purchases..."
                    className="w-full md:w-64 h-8 text-sm pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                <Button
                  className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none"
                  onClick={handleCreate}
                >
                  Create Purchase
                </Button>
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
                    <th className="text-left p-2 font-medium">Supplier</th>
                    <th className="text-left p-2 font-medium">Warehouse</th>
                    <th className="text-left p-2 font-medium">Status</th>
                    <th className="text-left p-2 font-medium">Total</th>
                    <th className="text-left p-2 font-medium">Paid</th>
                    <th className="text-left p-2 font-medium">Due</th>
                    <th className="text-left p-2 font-medium">Payment Status</th>
                    <th className="text-right p-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={11} className="text-center p-8 text-muted-foreground">Loading...</td>
                    </tr>
                  ) : isError ? (
                    <tr>
                      <td colSpan={11} className="text-center p-8 text-red-500">Failed to load purchases</td>
                    </tr>
                  ) : purchases.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center p-8 text-muted-foreground">No purchases found.</td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr key={purchase.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-2">
                          <input type="checkbox" className="rounded scale-75" />
                        </td>
                        <td className="p-2">{formatDate(purchase.date)}</td>
                        <td className="p-2 font-medium text-blue-600 hover:underline cursor-pointer" onClick={() => {
                          setViewPurchase(purchase)
                          setIsViewDialogOpen(true)
                        }}>
                          {purchase.reference}
                        </td>
                        <td className="p-2">{purchase.suppliers?.name || 'N/A'}</td>
                        <td className="p-2">{purchase.warehouses?.name || 'N/A'}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${purchase.status === 'Received' ? 'bg-green-100 text-green-800' :
                              purchase.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                purchase.status === 'Ordered' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                            }`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td className="p-2">${Number(purchase.total).toFixed(2)}</td>
                        <td className="p-2">${Number(purchase.paid).toFixed(2)}</td>
                        <td className="p-2">${Number(purchase.due).toFixed(2)}</td>
                        <td className="p-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${purchase.payment_status === 'Paid' ? 'bg-green-100 text-green-800' :
                              purchase.payment_status === 'Partial' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                            {purchase.payment_status}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          <TableActions
                            onView={() => {
                              setViewPurchase(purchase)
                              setIsViewDialogOpen(true)
                            }}
                            onEdit={() => router.push(`/purchases/edit/${purchase.id}`)}
                            onDelete={() => handleDeleteClick(purchase.id)}
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

                  <UIPagination>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setPage((old) => Math.max(old - 1, 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft className="h-3 w-3 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1 px-2">
                        <span className="text-xs">Page {page} of {pagination.totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => setPage((old) => old + 1)}
                        disabled={page >= (pagination.totalPages || 1)}
                      >
                        Next
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </UIPagination>
                </div>
              </div>
            )}
          </div>

          {viewPurchase && (
            <ViewPurchaseDialog
              purchase={viewPurchase}
              open={isViewDialogOpen}
              onOpenChange={setIsViewDialogOpen}
            />
          )}

          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the purchase
                  and remove its data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePurchase}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Purchase"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
