"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const suppliers = [
  {
    code: "5",
    name: "verdsoft Global",
    phone: "+263242787615",
    purchases: 56,
    totalAmount: 176286.5,
    paid: 35.0,
    due: 176251.5,
  },
  {
    code: "4",
    name: "Tinker",
    phone: "0453523295",
    purchases: 26,
    totalAmount: 6551.0,
    paid: 0.0,
    due: 6551.0,
  },
  {
    code: "3",
    name: "Netro Zim",
    phone: "0454441485",
    purchases: 41,
    totalAmount: 14572.8,
    paid: 76.8,
    due: 14296.0,
  },
  {
    code: "2",
    name: "Darren",
    phone: "26983225",
    purchases: 46,
    totalAmount: 45446.0,
    paid: 949.0,
    due: 44497.0,
  },
  {
    code: "1",
    name: "Tawanda Photechx",
    phone: "1212812",
    purchases: 35,
    totalAmount: 16564.21,
    paid: 2123.0,
    due: 14441.21,
  },
]

export default function SupplierReport() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Supplier Report</span>
          </div>
          <h1 className="text-2xl font-bold">Supplier Report</h1>
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
                  <th className="text-left p-4 font-medium">Supplier Code</th>
                  <th className="text-left p-4 font-medium">Supplier Name</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">Purchases</th>
                  <th className="text-left p-4 font-medium">Total Amount</th>
                  <th className="text-left p-4 font-medium">Paid</th>
                  <th className="text-left p-4 font-medium">Due</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">{supplier.code}</td>
                    <td className="p-4">{supplier.name}</td>
                    <td className="p-4">{supplier.phone}</td>
                    <td className="p-4">{supplier.purchases}</td>
                    <td className="p-4">{supplier.totalAmount.toFixed(2)}</td>
                    <td className="p-4">{supplier.paid.toFixed(2)}</td>
                    <td className="p-4">{supplier.due.toFixed(2)}</td>
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
              <span className="text-sm text-gray-600">1 - 5 of 5</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 text-sm border rounded disabled:opacity-50" disabled>
                  prev
                </button>
                <button className="px-3 py-1 text-sm border rounded disabled:opacity-50" disabled>
                  next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
