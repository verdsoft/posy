"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const customers = [
  {
    code: "15",
    name: "shamiso",
    phone: "",
    totalSales: 0,
    amount: 0.0,
    paid: 0.0,
    due: 0.0,
  },
  {
    code: "14",
    name: "midlands state university",
    phone: "0775445934",
    totalSales: 0,
    amount: 0.0,
    paid: 0.0,
    due: 0.0,
  },
  {
    code: "13",
    name: "UZ",
    phone: "0775786987",
    totalSales: 0,
    amount: 0.0,
    paid: 0.0,
    due: 0.0,
  },
  {
    code: "12",
    name: "Probottlers Zimbabwe",
    phone: "+263 715 320 318",
    totalSales: 2,
    amount: 110.0,
    paid: 55.0,
    due: 55.0,
  },
  {
    code: "11",
    name: "ZCHPC",
    phone: "334895",
    totalSales: 1,
    amount: 75.0,
    paid: 75.0,
    due: 0.0,
  },
  {
    code: "10",
    name: "Ada",
    phone: "0783225949",
    totalSales: 0,
    amount: 0.0,
    paid: 0.0,
    due: 0.0,
  },
  {
    code: "9",
    name: "Munyaradzi Mareya",
    phone: "0771341797",
    totalSales: 0,
    amount: 0.0,
    paid: 0.0,
    due: 0.0,
  },
  {
    code: "8",
    name: "Trust Academy",
    phone: "+263711347117",
    totalSales: 1,
    amount: 320.0,
    paid: 320.0,
    due: 0.0,
  },
  {
    code: "7",
    name: "Tafadzwa Mubvuma",
    phone: "0773428816",
    totalSales: 0,
    amount: 0.0,
    paid: 0.0,
    due: 0.0,
  },
  {
    code: "6",
    name: "SIRDC",
    phone: "0772967507",
    totalSales: 0,
    amount: 0.0,
    paid: 0.0,
    due: 0.0,
  },
]

export default function CustomerReport() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Customer Report</span>
          </div>
          <h1 className="text-2xl font-bold">Customer Report</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search this table" className="pl-10" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Customer Code</th>
                  <th className="text-left p-4 font-medium">Customer Name</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">Total Sales</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Paid</th>
                  <th className="text-left p-4 font-medium">Due</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">{customer.code}</td>
                    <td className="p-4">{customer.name}</td>
                    <td className="p-4">{customer.phone}</td>
                    <td className="p-4">{customer.totalSales}</td>
                    <td className="p-4">{customer.amount.toFixed(2)}</td>
                    <td className="p-4">{customer.paid.toFixed(2)}</td>
                    <td className="p-4">{customer.due.toFixed(2)}</td>
                    <td className="p-4">
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-sm">
                        Reports
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Rows per page:
              <select className="ml-2 border rounded px-2 py-1">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">1 - 10 of 16</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 text-sm border rounded disabled:opacity-50" disabled>
                  prev
                </button>
                <button className="px-3 py-1 text-sm border rounded">next</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
