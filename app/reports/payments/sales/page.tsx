"use client"

import { useState } from "react"
import DashboardLayout from "../../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "../../../../components/date-range-picker"

const payments = [
  {
    id: 1,
    date: "2025-06-30",
    reference: "INV/SL_1169",
    sale: "SL_1169",
    customer: "walk-in-customer",
    paidBy: "Cash",
    amount: 6.0,
  },
  {
    id: 2,
    date: "2025-05-31",
    reference: "INV/SL_1168",
    sale: "SL_1168",
    customer: "walk-in-customer",
    paidBy: "Cash",
    amount: 6.0,
  },
  {
    id: 3,
    date: "2025-05-31",
    reference: "INV/SL_1167",
    sale: "SL_1167",
    customer: "cosmic",
    paidBy: "Cash",
    amount: 12.0,
  },
  {
    id: 4,
    date: "2025-02-25",
    reference: "INV/SL_1166",
    sale: "SL_1166",
    customer: "Kennedy Chari",
    paidBy: "Cash",
    amount: 45.1,
  },
  {
    id: 5,
    date: "2025-02-25",
    reference: "INV/SL_1165",
    sale: "SL_1165",
    customer: "Paul Macharanga",
    paidBy: "Cash",
    amount: 2.0,
  },
]

export default function SalesPayments() {
  const [dateRange, setDateRange] = useState("1970-01-01 - 2025-07-01")

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
                <Input placeholder="Search this table..." className="w-64" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-blue-600 bg-transparent">
                🔍 Filter
              </Button>
              <Button variant="outline" className="text-green-600 bg-transparent">
                📄 PDF
              </Button>
              <Button variant="outline" className="text-red-600 bg-transparent">
                📊 EXCEL
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
                  <th className="text-left p-3">Paid by</th>
                  <th className="text-left p-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{payment.date}</td>
                    <td className="p-3">{payment.reference}</td>
                    <td className="p-3">{payment.sale}</td>
                    <td className="p-3">{payment.customer}</td>
                    <td className="p-3">{payment.paidBy}</td>
                    <td className="p-3">{payment.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - 5 of 5 | prev next</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
