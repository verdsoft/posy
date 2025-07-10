"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "../../../components/date-range-picker"

const purchases = [
  {
    id: 1,
    date: "2025-06-12",
    reference: "PR_1315",
    supplier: "verdsoft Global",
    status: "Received",
    grandTotal: 16.5,
    paid: 0.0,
    due: 16.5,
    paymentStatus: "Pending",
  },
  {
    id: 2,
    date: "2025-06-12",
    reference: "PR_1314",
    supplier: "Tawanda Photechix",
    status: "Received",
    grandTotal: 4000.0,
    paid: 0.0,
    due: 4000.0,
    paymentStatus: "Pending",
  },
  {
    id: 3,
    date: "2025-02-25",
    reference: "PR_1313",
    supplier: "Netru Zim",
    status: "Received",
    grandTotal: 20.0,
    paid: 0.0,
    due: 20.0,
    paymentStatus: "Pending",
  },
  {
    id: 4,
    date: "2024-12-05",
    reference: "PR_1312",
    supplier: "Darren",
    status: "Received",
    grandTotal: 15000.0,
    paid: 0.0,
    due: 15000.0,
    paymentStatus: "Pending",
  },
  {
    id: 5,
    date: "2024-11-06",
    reference: "PR_1311",
    supplier: "Darren",
    status: "Received",
    grandTotal: 300.0,
    paid: 0.0,
    due: 300.0,
    paymentStatus: "Pending",
  },
]

export default function PurchaseReport() {
  const [dateRange, setDateRange] = useState("1970-01-01 - 2025-07-01")

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Purchase Report</span>
          </div>
          <h1 className="text-2xl font-bold">Purchase Report</h1>
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
                  <th className="text-left p-3">Supplier</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Grand Total</th>
                  <th className="text-left p-3">Paid</th>
                  <th className="text-left p-3">Due</th>
                  <th className="text-left p-3">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{purchase.date}</td>
                    <td className="p-3">{purchase.reference}</td>
                    <td className="p-3">{purchase.supplier}</td>
                    <td className="p-3">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{purchase.status}</span>
                    </td>
                    <td className="p-3">{purchase.grandTotal.toFixed(2)}</td>
                    <td className="p-3">{purchase.paid.toFixed(2)}</td>
                    <td className="p-3">{purchase.due.toFixed(2)}</td>
                    <td className="p-3">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                        {purchase.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - 5 of 204 | prev next</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
