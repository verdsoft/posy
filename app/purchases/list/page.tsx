"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Edit, Trash2, FileDown } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import type React from "react"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import AuthGuard from "@/components/AuthGuard"
import { ViewPurchaseDialog } from "./view-purchase/page"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface Purchase {
  id: string
  date: string
  reference: string
  supplier_name: string
  warehouse_name: string
  status: string
  total: number
  paid: number
  due: number
  payment_status: string
}

export default function PurchaseList() {
  const router = useRouter()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const rowsPerPage = 10
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()

    // Add title
    doc.text('Purchase List', 14, 16)

    // Prepare data for the table
    const tableData = filteredPurchases.map(purchase => [
      formatDate(purchase.date),
      purchase.reference,
      purchase.supplier_name,
      purchase.warehouse_name,
      purchase.status,
      Number(purchase.total),
      Number(purchase.paid),
      Number(purchase.due),
      purchase.payment_status
    ])

    // Add table
    autoTable(doc, {
      head: [['Date', 'Reference', 'Supplier', 'Warehouse', 'Status', 'Total', 'Paid', 'Due', 'Payment Status']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })

    doc.save('purchases.pdf')
  }

  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredPurchases.map(purchase => ({
        Date: formatDate(purchase.date),
        Reference: purchase.reference,
        Supplier: purchase.supplier_name,
        Warehouse: purchase.warehouse_name,
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

  // Filter purchases based on search term
  const filteredPurchases = useMemo(() => {
    if (!searchTerm) return purchases;
    return purchases.filter(purchase =>
      purchase.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.warehouse_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.payment_status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchases, searchTerm]);

  // Fetch purchases from API
  useEffect(() => {
    const fetchPurchases = async () => {
      setIsLoading(true);
      try {
        let url = `/api/purchases?page=${currentPage}&limit=${rowsPerPage}`;
        if (searchTerm) {
          url += `&search=${searchTerm}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Debug the raw API response
        console.log("API Response:", data);

        // Ensure we're handling the response structure correctly
        const purchasesData = Array.isArray(data) ? data : data.purchases || data.data || [];
        const calculatedTotalPages = data.totalPages ||
          Math.ceil(data.totalCount / rowsPerPage) ||
          1;

        setPurchases(purchasesData);
        setTotalPages(calculatedTotalPages);

        // Debug the updated state
        console.log("Updated purchases state:", purchasesData);
      } catch (error) {
        console.error("Fetch error:", error);
        toast.error(`Failed to load purchases: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setPurchases([]);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPurchases();
  }, [currentPage, searchTerm, rowsPerPage]);

  // Handle delete purchase
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this purchase?")) return

    try {
      const res = await fetch(`/api/purchases?id=${id}`, {
        method: "DELETE"
      })

      if (res.ok) {
        setPurchases(purchases.filter(p => p.id !== id))
        toast.success("Purchase deleted successfully")
      } else {
        throw new Error("Failed to delete")
      }
    } catch (err) {
      toast.error("Failed to delete purchase")
      console.log("Delete error:", err)
    }
  }

  // Handle row click to view details
  const handleRowClick = (id: string) => {
    router.push(`/purchases/${id}`)
  }

  // Handle create new purchase
  const handleCreate = () => {
    router.push('/purchases/create')
  }

  // Format date to display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Get payment status badge color
  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'partial':
        return 'bg-blue-100 text-blue-800'
      case 'unpaid':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <span>Purchases</span>
              <span>|</span>
              <span>Purchase List</span>
            </div>
            <h1 className="text-2xl font-bold">Purchase List</h1>
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
                      setCurrentPage(1) // Reset to first page when searching
                    }}
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
                  EXCEL
                </Button>
                <Button
                  className="bg-[#1a237e] hover:bg-purple-700"
                  onClick={handleCreate}
                >
                  Create Purchase
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
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Grand Total</th>
                    <th className="text-left p-3">Paid</th>
                    <th className="text-left p-3">Due</th>
                    <th className="text-left p-3">Payment Status</th>
                    <th className="text-left p-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center">
                        Loading purchases...
                      </td>
                    </tr>
                  ) : filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-gray-500">
                        No purchases found
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((purchase) => (
                      <tr
                        key={purchase.id}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(purchase.id)}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" />
                        </td>
                        <td className="p-3">{formatDate(purchase.date)}</td>
                        <td className="p-3">{purchase.reference}</td>
                        <td className="p-3">{purchase.supplier_name}</td>
                        <td className="p-3">{purchase.warehouse_name}</td>
                        <td className="p-3">
                          <span className={`${getStatusBadge(purchase.status)} px-2 py-1 rounded text-xs`}>
                            {purchase.status}
                          </span>
                        </td>
                        <td className="p-3">{Number(purchase.total)}</td>
                        <td className="p-3">{Number(purchase.paid)}</td>
                        <td className="p-3">{Number(purchase.due)}</td>
                        <td className="p-3">
                          <span className={`${getPaymentStatusBadge(purchase.payment_status)} px-2 py-1 rounded text-xs`}>
                            {purchase.payment_status}
                          </span>
                        </td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation()
                                fetch(`/api/purchases?id=${purchase.id}`)
                                  .then(res => res.json())
                                  .then(data => {
                                    setViewPurchase(data)
                                    setIsViewDialogOpen(true)
                                  })
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600"
                              onClick={() => router.push(`/purchases/edit/${purchase.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => handleDelete(purchase.id)}
                            >
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

            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">Rows per page: {rowsPerPage}</div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  Prev
                </Button>
                <span className="text-sm text-gray-600">
                  {((currentPage - 1) * rowsPerPage + 1)} - {Math.min(currentPage * rowsPerPage, filteredPurchases.length)} of {totalPages * rowsPerPage}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>

      {viewPurchase && (
        <ViewPurchaseDialog
          purchase={viewPurchase}
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
        />
      )}
    </AuthGuard>
  )
}