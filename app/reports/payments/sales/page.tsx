"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "../../../../components/date-range-picker"
import { Search, FileDown, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface SalesPayment {
  id: string
  date: string
  reference: string
  sale_reference: string
  customer_name: string
  payment_method: string
  amount: number
  notes: string
  created_at: string
}

export default function SalesPayments() {
  const [payments, setPayments] = useState<SalesPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState("1970-01-01 - 2025-07-01")
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<SalesPayment | null>(null)
  const [formData, setFormData] = useState({
    reference: "",
    sale_reference: "",
    customer_name: "",
    payment_method: "",
    amount: 0,
    notes: ""
  })

  // Fetch sales payments
  useEffect(() => {
    const fetchSalesPayments = async () => {
      try {
        setLoading(true)
        // For now, we'll use sales data and simulate payments
        const res = await fetch('/api/pos/sales')
        if (!res.ok) throw new Error("Failed to fetch sales")
        const salesData = await res.json()
        
        // Convert sales to payment format (in a real app, this would be a separate payments table)
        const paymentsData = salesData.map((sale: any) => ({
          id: sale.id,
          date: sale.date,
          reference: `PAY-${sale.reference}`,
          sale_reference: sale.reference,
          customer_name: sale.customer_name || "Walk-in Customer",
          payment_method: sale.payment_status === "paid" ? "Cash" : "Pending",
          amount: sale.paid || 0,
          notes: "",
          created_at: sale.created_at
        })).filter((payment: any) => payment.amount > 0)
        
        setPayments(paymentsData)
      } catch (error) {
        toast.error("Failed to load sales payments")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSalesPayments()
  }, [])

  // Filter payments based on search
  const filteredPayments = payments.filter(payment =>
    payment.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.sale_reference?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle edit payment
  const handleEdit = async () => {
    if (!selectedPayment) return
    
    try {
      // In a real app, this would update a payments table
      toast.success("Payment updated successfully")
      setShowEditModal(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to update payment")
      console.error(error)
    }
  }

  // Handle delete payment
  const handleDelete = async () => {
    if (!selectedPayment) return
    
    try {
      // In a real app, this would delete from a payments table
      setPayments(payments.filter(p => p.id !== selectedPayment.id))
      setShowDeleteModal(false)
      toast.success("Payment deleted successfully")
    } catch (error) {
      toast.error("Failed to delete payment")
      console.error(error)
    }
  }

  // Open view modal
  const openViewModal = (payment: SalesPayment) => {
    setSelectedPayment(payment)
    setShowViewModal(true)
  }

  // Open edit modal
  const openEditModal = (payment: SalesPayment) => {
    setSelectedPayment(payment)
    setFormData({
      reference: payment.reference || "",
      sale_reference: payment.sale_reference || "",
      customer_name: payment.customer_name || "",
      payment_method: payment.payment_method || "",
      amount: payment.amount || 0,
      notes: payment.notes || ""
    })
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = (payment: SalesPayment) => {
    setSelectedPayment(payment)
    setShowDeleteModal(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      reference: "",
      sale_reference: "",
      customer_name: "",
      payment_method: "",
      amount: 0,
      notes: ""
    })
  }

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.text('Sales Payments Report', 14, 16)
    
    const tableData = filteredPayments.map(payment => [
      new Date(payment.date).toLocaleDateString(),
      payment.reference,
      payment.sale_reference,
      payment.customer_name,
      payment.payment_method,
      `$${payment.amount || "0.00"}`
    ])
    
    autoTable(doc, {
      head: [['Date', 'Reference', 'Sale', 'Customer', 'Payment Method', 'Amount']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('sales-payments.pdf')
  }

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredPayments.map(payment => ({
        Date: new Date(payment.date).toLocaleDateString(),
        Reference: payment.reference,
        Sale: payment.sale_reference,
        Customer: payment.customer_name,
        'Payment Method': payment.payment_method,
        Amount: `$${payment.amount || "0.00"}`
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Payments")
    XLSX.writeFile(workbook, "sales-payments.xlsx")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Sales payments</span>
          </div>
          <h1 className="text-2xl font-bold">Sales payments</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DateRangePicker value={dateRange} onChange={setDateRange} />
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search this table..." 
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Reference</th>
                  <th className="text-left p-3">Sale</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Payment Method</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6">Loading...</td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6">No payments found.</td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{new Date(payment.date).toLocaleDateString()}</td>
                      <td className="p-3">{payment.reference}</td>
                      <td className="p-3">{payment.sale_reference}</td>
                      <td className="p-3">{payment.customer_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          payment.payment_method === "Cash" ? "bg-green-100 text-green-800" : 
                          payment.payment_method === "Card" ? "bg-blue-100 text-blue-800" : 
                          "bg-yellow-100 text-yellow-800"
                        }`}>
                          {payment.payment_method}
                        </span>
                      </td>
                      <td className="p-3">${payment.amount || "0.00"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(payment)}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(payment)}
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(payment)}
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
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">
              {filteredPayments.length > 0 
                ? `1 - ${Math.min(filteredPayments.length, 10)} of ${filteredPayments.length}` 
                : '0 - 0 of 0'}
            </div>
          </div>
        </div>

        {/* View Payment Modal */}
        {selectedPayment && (
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Payment Details</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Reference</label>
                  <p className="mt-1 text-sm">{selectedPayment.reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="mt-1 text-sm">{new Date(selectedPayment.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sale Reference</label>
                  <p className="mt-1 text-sm">{selectedPayment.sale_reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer</label>
                  <p className="mt-1 text-sm">{selectedPayment.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="mt-1 text-sm">{selectedPayment.payment_method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="mt-1 text-sm">${selectedPayment.amount || "0.00"}</p>
                </div>
                {selectedPayment.notes && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Notes</label>
                    <p className="mt-1 text-sm">{selectedPayment.notes}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Payment Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Payment</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label className="text-sm font-medium">Reference *</label>
                <Input
                  placeholder="Payment reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({...formData, reference: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sale Reference</label>
                <Input
                  placeholder="Sale reference"
                  value={formData.sale_reference}
                  onChange={(e) => setFormData({...formData, sale_reference: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Customer</label>
                <Input
                  placeholder="Customer name"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                  className="mt-1 w-full p-2 border rounded"
                >
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Amount</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Notes</label>
                <Input
                  placeholder="Payment notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700" 
                  onClick={handleEdit}
                  disabled={!formData.reference}
                >
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        {selectedPayment && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Payment</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete payment "{selectedPayment.reference}"? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700" 
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
