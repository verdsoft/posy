"use client"

import { useState } from "react"
import DashboardLayout from "../../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "../../../../components/date-range-picker"

const payments = [
  {
    id: 1,
    date: "2023-11-17",
    reference: "INV/PR_1118",
    purchase: "PR_1282",
    supplier: "Tawanda Photechix",
    paidBy: "Cash",
    amount: 1903.0,
  },
  {
    id: 2,
    date: "2023-11-17",
    reference: "INV/PR_1117",
    purchase: "PR_1283",
    supplier: "Darren",
    paidBy: "Cash",
    amount: 500.0,
  },
  {
    id: 3,
    date: "2022-11-04",
    reference: "INV/PR_1116",
    purchase: "PR_1127",
    supplier: "Netru Zim",
    paidBy: "Cash",
    amount: 20.0,
  },
  {
    id: 4,
    date: "2022-11-04",
    reference: "INV/PR_1115",
    purchase: "PR_1126",
    supplier: "Netru Zim",
    paidBy: "Cash",
    amount: 56.8,
  },
  {
    id: 5,
    date: "2022-11-04",
    reference: "INV/PR_1114",
    purchase: "PR_1125",
    supplier: "Darren",
    paidBy: "Cash",
    amount: 52.0,
  },
  {
    id: 6,
    date: "2022-07-06",
    reference: "INV/PR_1113",
    purchase: "PR_1124",
    supplier: "Darren",
    paidBy: "Cash",
    amount: 387.0,
  },
  {
    id: 7,
    date: "2022-06-09",
    reference: "INV/PR_1112",
    purchase: "PR_1123",
    supplier: " Global",
    paidBy: "Cash",
    amount: 15.0,
  },
  {
    id: 8,
    date: "2022-06-09",
    reference: "INV/PR_1111",
    purchase: "PR_1112",
    supplier: "Tawanda Photechix",
    paidBy: "Cash",
    amount: 220.0,
  },
]

export default function PurchasesPayments() {
  const [dateRange, setDateRange] = useState("1970-01-01 - 2025-07-01")

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
                  <th className="text-left p-3">Purchase</th>
                  <th className="text-left p-3">Supplier</th>
                  <th className="text-left p-3">Paid by</th>
                  <th className="text-left p-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{payment.date}</td>
                    <td className="p-3">{payment.reference}</td>
                    <td className="p-3">{payment.purchase}</td>
                    <td className="p-3">{payment.supplier}</td>
                    <td className="p-3">{payment.paidBy}</td>
                    <td className="p-3">{payment.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - 8 of 8 | prev next</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
