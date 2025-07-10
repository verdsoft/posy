"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { DateRangePicker } from "../../../components/date-range-picker"
import { ShoppingCart, Package, RotateCcw, ArrowLeftRight, DollarSign, TrendingUp } from "lucide-react"

export default function ProfitAndLoss() {
  const [dateRange, setDateRange] = useState("1970-01-01 - 2025-07-01")

  const metrics = [
    {
      title: "52 Sales",
      amount: "$ 2282.10",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "204 Purchases",
      amount: "$ 259200.81",
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "0 Sales Return",
      amount: "$ 0.00",
      icon: RotateCcw,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "0 Purchases Return",
      amount: "$ 0.00",
      icon: ArrowLeftRight,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Expenses",
      amount: "$ 2674.00",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Profit",
      amount: "$ -256918.71",
      icon: TrendingUp,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
    },
  ]

  const paymentMetrics = [
    {
      title: "Payments Received",
      amount: "$ 2167.60",
      subtitle: "( $ 2167.60 Payments Sales + $ 0.00 Purchases Return )",
    },
    {
      title: "Payments Sent",
      amount: "$ 5837.80",
      subtitle: "( $ 3163.80 Payments Purchases + $ 0.00 Sales Return + $ 2674.00 Expenses )",
    },
    {
      title: "Payments Net",
      amount: "$ -3670.20",
      subtitle: "( $ 2167.60 Received - $ 5837.80 Sent )",
    },
  ]

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
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

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
                <p className="text-xs text-gray-500 mt-2">( $ 2282.10 Sales ) - ( $ 259200.81 Purchases )</p>
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
      </div>
    </DashboardLayout>
  )
}
