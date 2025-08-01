"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { DateRangePicker } from "../../../components/date-range-picker"
import { ShoppingCart, Package, RotateCcw, ArrowLeftRight, DollarSign, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileDown } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ProfitLossData {
  sales: {
    count: number
    total: number
  }
  purchases: {
    count: number
    total: number
  }
  salesReturns: {
    count: number
    total: number
  }
  purchaseReturns: {
    count: number
    total: number
  }
  expenses: {
    total: number
  }
  payments: {
    received: number
    sent: number
  }
}

export default function ProfitAndLoss() {
  const [dateRange, setDateRange] = useState("1970-01-01 - 2025-07-01")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ProfitLossData>({
    sales: { count: 0, total: 0 },
    purchases: { count: 0, total: 0 },
    salesReturns: { count: 0, total: 0 },
    purchaseReturns: { count: 0, total: 0 },
    expenses: { total: 0 },
    payments: { received: 0, sent: 0 }
  })

  // Fetch profit and loss data
  useEffect(() => {
    const fetchProfitLossData = async () => {
      try {
        setLoading(true)
        
        // Fetch sales data
        const salesRes = await fetch('/api/pos/sales')
        const salesData = await salesRes.json()
        const salesTotal = salesData.reduce((sum: number, sale: any) => sum + (sale.total || 0), 0)
        
        // Fetch purchases data
        const purchasesRes = await fetch('/api/purchases')
        const purchasesData = await purchasesRes.json()
        const purchasesTotal = purchasesData.reduce((sum: number, purchase: any) => sum + (purchase.total || 0), 0)
        
        // Fetch sales returns data
        const salesReturnsRes = await fetch('/api/sales-returns')
        const salesReturnsData = await salesReturnsRes.json()
        const salesReturnsTotal = salesReturnsData.reduce((sum: number, ret: any) => sum + (ret.total || 0), 0)
        
        // Fetch purchase returns data
        const purchaseReturnsRes = await fetch('/api/purchases-return')
        const purchaseReturnsData = await purchaseReturnsRes.json()
        const purchaseReturnsTotal = purchaseReturnsData.reduce((sum: number, ret: any) => sum + (ret.total || 0), 0)
        
        // Fetch expenses data
        const expensesRes = await fetch('/api/expenses')
        const expensesData = await expensesRes.json()
        const expensesTotal = expensesData.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)
        
        // Calculate payments
        const paymentsReceived = salesTotal - salesReturnsTotal
        const paymentsSent = purchasesTotal - purchaseReturnsTotal + expensesTotal
        
        setData({
          sales: { count: salesData.length, total: salesTotal },
          purchases: { count: purchasesData.length, total: purchasesTotal },
          salesReturns: { count: salesReturnsData.length, total: salesReturnsTotal },
          purchaseReturns: { count: purchaseReturnsData.length, total: purchaseReturnsTotal },
          expenses: { total: expensesTotal },
          payments: { received: paymentsReceived, sent: paymentsSent }
        })
      } catch (error) {
        toast.error("Failed to load profit and loss data")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfitLossData()
  }, [])

  // Calculate profit
  const profit = data.sales.total - data.purchases.total - data.expenses.total
  const paymentsNet = data.payments.received - data.payments.sent

  const metrics = [
    {
      title: `${data.sales.count} Sales`,
      amount: `$ ${data.sales.total}`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: `${data.purchases.count} Purchases`,
      amount: `$ ${data.purchases.total}`,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: `${data.salesReturns.count} Sales Return`,
      amount: `$ ${data.salesReturns.total}`,
      icon: RotateCcw,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: `${data.purchaseReturns.count} Purchases Return`,
      amount: `$ ${data.purchaseReturns.total}`,
      icon: ArrowLeftRight,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Expenses",
      amount: `$ ${data.expenses.total}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Profit",
      amount: `$ ${profit}`,
      icon: TrendingUp,
      color: profit >= 0 ? "text-green-600" : "text-red-600",
      bgColor: profit >= 0 ? "bg-green-50" : "bg-red-50",
    },
  ]

  const paymentMetrics = [
    {
      title: "Payments Received",
      amount: `$ ${data.payments.received}`,
      subtitle: `( $ ${data.sales.total} Sales - $ ${data.salesReturns.total} Sales Returns )`,
    },
    {
      title: "Payments Sent",
      amount: `$ ${data.payments.sent}`,
      subtitle: `( $ ${data.purchases.total} Purchases - $ ${data.purchaseReturns.total} Purchase Returns + $ ${data.expenses.total} Expenses )`,
    },
    {
      title: "Payments Net",
      amount: `$ ${paymentsNet}`,
      subtitle: `( $ ${data.payments.received} Received - $ ${data.payments.sent} Sent )`,
    },
  ]

  // Export to PDF
  const handleExportPDF = () => {
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
      startY: doc.lastAutoTable.finalY + 10,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('profit-and-loss.pdf')
  }

  // Export to Excel
  const handleExportExcel = () => {
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
              <DateRangePicker value={dateRange} onChange={setDateRange} />
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
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading profit and loss data...</div>
          </div>
        ) : (
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
                      ( $ {data.sales.total} Sales ) - ( $ {data.purchases.total} Purchases ) - ( $ {data.expenses.total} Expenses )
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
        )}
      </div>
    </DashboardLayout>
  )
}
