"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { DateRangePicker } from "../../../components/date-range-picker"
import { ShoppingCart, Package, RotateCcw, ArrowLeftRight, DollarSign, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useGetProfitLossQuery } from "@/lib/slices/reportsApi"
import { DateRange } from "react-day-picker"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function ProfitAndLoss() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
    });

    const { data, error, isLoading } = useGetProfitLossQuery({
        from: dateRange?.from?.toISOString().split('T')[0] || '',
        to: dateRange?.to?.toISOString().split('T')[0] || '',
    });

    if (error) {
        toast.error("Failed to load profit and loss data");
        console.error(error);
    }

  const metrics = data ? [
    {
      title: `${data.sales?.count || 0} Sales`,
      amount: `$${Number(data.sales?.total || 0).toFixed(2)}`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: `${data.purchases?.count || 0} Purchases`,
      amount: `$${Number(data.purchases?.total || 0).toFixed(2)}`,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: `${data.salesReturns?.count || 0} Sales Return`,
      amount: `$${Number(data.salesReturns?.total || 0).toFixed(2)}`,
      icon: RotateCcw,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: `${data.purchaseReturns?.count || 0} Purchases Return`,
      amount: `$${Number(data.purchaseReturns?.total || 0).toFixed(2)}`,
      icon: ArrowLeftRight,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Expenses",
      amount: `$${Number(data.expenses?.total || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Profit",
      amount: `$${Number(data.profit || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: (data.profit || 0) >= 0 ? "text-green-600" : "text-red-600",
      bgColor: (data.profit || 0) >= 0 ? "bg-green-50" : "bg-red-50",
    },
  ] : [];

  const paymentMetrics = data ? [
    {
      title: "Payments Received",
      amount: `$${Number(data.payments?.received || 0).toFixed(2)}`,
      subtitle: `( $${Number(data.sales?.total || 0).toFixed(2)} Sales - $${Number(data.salesReturns?.total || 0).toFixed(2)} Sales Returns )`,
    },
    {
      title: "Payments Sent",
      amount: `$${Number(data.purchases?.sent || 0).toFixed(2)}`,
      subtitle: `( $${Number(data.purchases?.total || 0).toFixed(2)} Purchases - $${Number(data.purchaseReturns?.total || 0).toFixed(2)} Purchase Returns + $${Number(data.expenses?.total || 0).toFixed(2)} Expenses )`,
    },
    {
      title: "Payments Net",
      amount: `$${Number(data.paymentsNet || 0).toFixed(2)}`,
      subtitle: `( $${Number(data.payments?.received || 0).toFixed(2)} Received - $${Number(data.payments?.sent || 0).toFixed(2)} Sent )`,
    },
  ] : [];

  // Export to PDF
  const handleExportPDF = () => {
    if (!data) return;
    const doc = new jsPDF()
    
    doc.text('Profit and Loss Report', 14, 16)
    
    // Main metrics table
    const metricsData = metrics.map(metric => [
      metric.title,
      metric.amount
    ])
    
    autoTable(doc, {
      head: [['Metric', 'Amount']],
      body: metricsData,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    // Payment metrics table
    const paymentData = paymentMetrics.map(metric => [
      metric.title,
      metric.amount,
      metric.subtitle
    ])
    
    autoTable(doc, {
      head: [['Payment Type', 'Amount', 'Breakdown']],
      body: paymentData,
      startY: (doc as any).lastAutoTable.finalY + 10,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('profit-and-loss.pdf')
  }

  // Export to Excel
  const handleExportExcel = () => {
    if(!data) return;
    const workbook = XLSX.utils.book_new()
    
    // Main metrics worksheet
    const metricsWorksheet = XLSX.utils.json_to_sheet(
      metrics.map(metric => ({
        Metric: metric.title,
        Amount: metric.amount
      }))
    )
    XLSX.utils.book_append_sheet(workbook, metricsWorksheet, "Main Metrics")
    
    // Payment metrics worksheet
    const paymentWorksheet = XLSX.utils.json_to_sheet(
      paymentMetrics.map(metric => ({
        'Payment Type': metric.title,
        Amount: metric.amount,
        Breakdown: metric.subtitle
      }))
    )
    XLSX.utils.book_append_sheet(workbook, paymentWorksheet, "Payment Metrics")
    
    XLSX.writeFile(workbook, "profit-and-loss.xlsx")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Profit and Loss</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Profit and Loss</h1>
            <div className="flex items-center gap-2">
              <DateRangePicker onDateChange={setDateRange} />
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
                disabled={!data}
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                disabled={!data}
              >
                <FileDown className="h-4 w-4 mr-2" />
                EXCEL
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-10 w-10 animate-spin" />
            <div className="text-lg mt-4">Loading profit and loss data...</div>
          </div>
        ) : data ? (
          <>
            {/* Main Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <div key={index} className={`${metric.bgColor} rounded-lg p-6 text-center`}>
                  <div
                    className={`w-16 h-16 ${metric.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white`}
                  >
                    <metric.icon className={`h-8 w-8 ${metric.color}`} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{metric.title}</p>
                  <p className={`text-2xl font-bold ${metric.color}`}>{metric.amount}</p>
                  {index === 5 && (
                    <p className="text-xs text-gray-500 mt-2">
                      ( $ {data.sales.total } Sales ) - ( $ {data.purchases.total } Purchases ) - ( $ {data.expenses.total } Expenses )
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Payment Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentMetrics.map((metric, index) => (
                <div key={index} className="bg-blue-50 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-white">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{metric.title}</p>
                  <p className="text-2xl font-bold text-blue-600 mb-2">{metric.amount}</p>
                  <p className="text-xs text-gray-500">{metric.subtitle}</p>
                </div>
              ))}
            </div>
          </>
        ) : <div className="text-center py-8">No data available for the selected date range.</div>}
      </div>
    </DashboardLayout>
  )
}
