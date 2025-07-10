"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "../../../components/date-range-picker"

const sales = [
  {
    id: 1,
    date: "2025-06-30",
    reference: "SL_1169",
    customer: "walk-in-customer",
    status: "Completed",
    grandTotal: 6.0,
    paid: 6.0,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: 2,
    date: "2025-05-31",
    reference: "SL_1168",
    customer: "walk-in-customer",
    status: "Completed",
    grandTotal: 6.0,
    paid: 6.0,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: 3,
    date: "2025-05-31",
    reference: "SL_1167",
    customer: "cosmic",
    status: "Completed",
    grandTotal: 12.0,
    paid: 12.0,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: 4,
    date: "2025-02-25",
    reference: "SL_1166",
    customer: "Kennedy Chari",
    status: "Completed",
    grandTotal: 45.1,
    paid: 45.1,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: 5,
    date: "2025-02-25",
    reference: "SL_1165",
    customer: "Paul Macharanga",
    status: "Completed",
    grandTotal: 2.0,
    paid: 2.0,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: 6,
    date: "2024-12-09",
    reference: "SL_1164",
    customer: "walk-in-customer",
    status: "Completed",
    grandTotal: 14.5,
    paid: 14.5,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: 7,
    date: "2024-04-27",
    reference: "SL_1163",
    customer: "ZCHPC",
    status: "Pending",
    grandTotal: 75.0,
    paid: 75.0,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: 8,
    date: "2024-08-28",
    reference: "SL_1162",
    customer: "walk-in-customer",
    status: "Completed",
    grandTotal: 160.5,
    paid: 160.5,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: 9,
    date: "2024-04-24",
    reference: "SL_1161",
    customer: "walk-in-customer",
    status: "Completed",
    grandTotal: 30.0,
    paid: 30.0,
    due: 0.0,
    paymentStatus: "Paid",
  },
  {
    id: 10,
    date: "2024-04-24",
    reference: "SL_1160",
    customer: "walk-in-customer",
    status: "Completed",
    grandTotal: 75.0,
    paid: 75.0,
    due: 0.0,
    paymentStatus: "Paid",
  },
]

export default function SaleReport() {
  const [dateRange, setDateRange] = useState("1970-01-01 - 2025-07-01")

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Sale Report</span>
          </div>
          <h1 className="text-2xl font-bold">Sale Report</h1>
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
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Grand Total</th>
                  <th className="text-left p-3">Paid</th>
                  <th className="text-left p-3">Due</th>
                  <th className="text-left p-3">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{sale.date}</td>
                    <td className="p-3">{sale.reference}</td>
                    <td className="p-3">{sale.customer}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          sale.status === "Completed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {sale.status}
                      </span>
                    </td>
                    <td className="p-3">{sale.grandTotal.toFixed(2)}</td>
                    <td className="p-3">{sale.paid.toFixed(2)}</td>
                    <td className="p-3">{sale.due.toFixed(2)}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {sale.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - 10 of 52 | prev next</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
