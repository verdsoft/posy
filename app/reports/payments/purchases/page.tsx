"use client"

import { useState } from "react"
import DashboardLayout from "../../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "../../../../components/date-range-picker"
import { Search, FileDown, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useGetPurchasePaymentsQuery } from "@/lib/slices/paymentsApi"
import { Payment } from "@/lib/slices/paymentsApi"
import { DateRange } from "react-day-picker"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function PurchasesPayments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data, isLoading, isFetching } = useGetPurchasePaymentsQuery({
    from: dateRange?.from?.toISOString().split('T')[0] || '',
    to: dateRange?.to?.toISOString().split('T')[0] || '',
    page,
    limit,
    searchTerm,
  });

  const payments = data?.data || [];
  const pagination = data?.pagination;
  
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.text('Purchase Payments Report', 14, 16)
    
    const tableData = payments.map(payment => [
      new Date(payment.date).toLocaleDateString(),
      payment.reference,
      payment.purchase_reference,
      payment.supplier_name,
      payment.payment_method,
      `$${payment.amount.toFixed(2)}`
    ])
    
    autoTable(doc, {
      head: [['Date', 'Reference', 'Purchase', 'Supplier', 'Payment Method', 'Amount']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('purchase-payments.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      payments.map(payment => ({
        Date: new Date(payment.date).toLocaleDateString(),
        Reference: payment.reference,
        Purchase: payment.purchase_reference,
        Supplier: payment.supplier_name,
        'Payment Method': payment.payment_method,
        Amount: `$${payment.amount.toFixed(2)}`
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Payments")
    XLSX.writeFile(workbook, "purchase-payments.xlsx")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Purchases payments</span>
          </div>
          <h1 className="text-2xl font-bold">Purchases payments</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <DateRangePicker onDateChange={setDateRange} initialDateRange={dateRange}/>
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
                  <th className="text-left p-3">Purchase</th>
                  <th className="text-left p-3">Supplier</th>
                  <th className="text-left p-3">Paid by</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {(isLoading || isFetching) ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6">No payments found.</td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{new Date(payment.date).toLocaleDateString()}</td>
                        <td className="p-3">{payment.reference}</td>
                        <td className="p-3">{payment.purchase_reference}</td>
                        <td className="p-3">{payment.supplier_name}</td>
                        <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs bg-green-100 text-green-800`}>
                            {payment.payment_method}
                            </span>
                        </td>
                        <td className="p-3">${payment.amount.toFixed(2)}</td>
                        <td className="p-3">
                            <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {setSelectedPayment(payment); setShowViewModal(true);}}
                            >
                                <Eye className="h-4 w-4 text-blue-600" />
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
            <div className="text-sm text-gray-600">Rows per page: {limit}</div>
            <div className="text-sm text-gray-600">
                {pagination ? `Page ${pagination.page} of ${pagination.totalPages}` : 'Page 1 of 1'}
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={!pagination?.prevPage}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={!pagination?.nextPage}>Next</Button>
            </div>
          </div>
        </div>
        
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
                  <label className="text-sm font-medium text-gray-500">Purchase Reference</label>
                  <p className="mt-1 text-sm">{selectedPayment.purchase_reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Supplier</label>
                  <p className="mt-1 text-sm">{selectedPayment.supplier_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="mt-1 text-sm">{selectedPayment.payment_method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className="mt-1 text-sm">${selectedPayment.amount.toFixed(2)}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
