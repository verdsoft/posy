"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

const quotations = [
  {
    date: "2025-06-12",
    customer: "walk-in-customer",
    reference: "QT_1160",
    grandTotal: 120,
    status: "Pending",
  },
  {
    date: "2025-03-22",
    customer: "Paul Macharanga",
    reference: "QT_1159",
    grandTotal: 14,
    status: "Pending",
  },
  {
    date: "2025-03-20",
    customer: "walk-in-customer",
    reference: "QT_1158",
    grandTotal: 250,
    status: "Pending",
  },
  {
    date: "2025-01-20",
    customer: "Trust Academy",
    reference: "QT_1157",
    grandTotal: 134.2,
    status: "Pending",
  },
  {
    date: "2024-12-05",
    customer: "walk-in-customer",
    reference: "QT_1156",
    grandTotal: 70.8,
    status: "Pending",
  },
  {
    date: "2024-11-05",
    customer: "walk-in-customer",
    reference: "QT_1155",
    grandTotal: 71.5,
    status: "Pending",
  },
  {
    date: "2024-11-05",
    customer: "walk-in-customer",
    reference: "QT_1154",
    grandTotal: 151.2,
    status: "Pending",
  },
  {
    date: "2024-10-03",
    customer: "ZCHPC",
    reference: "QT_1153",
    grandTotal: 2702,
    status: "Pending",
  },
  {
    date: "2024-09-20",
    customer: "midlands state university",
    reference: "QT_1152",
    grandTotal: 504.1,
    status: "Pending",
  },
  {
    date: "2024-09-19",
    customer: "walk-in-customer",
    reference: "QT_1151",
    grandTotal: 136,
    status: "Pending",
  },
]

export default function WarehouseReport() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Warehouse report</span>
          </div>
          <h1 className="text-2xl font-bold">Warehouse report</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-center mb-6">
              <div className="w-64">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Warehouse</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    <SelectItem value="karigamombe">Karigamombe</SelectItem>
                    <SelectItem value="karigamombe-centre">Karigamombe Centre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500 rounded"></div>
                </div>
                <div className="text-2xl font-bold text-blue-600">52</div>
                <div className="text-sm text-gray-600">Sales</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-purple-500 rounded"></div>
                </div>
                <div className="text-2xl font-bold text-purple-600">204</div>
                <div className="text-sm text-gray-600">Purchases</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-500 rounded"></div>
                </div>
                <div className="text-2xl font-bold text-gray-600">0</div>
                <div className="text-sm text-gray-600">Purchases Return</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-500 rounded"></div>
                </div>
                <div className="text-2xl font-bold text-gray-600">0</div>
                <div className="text-sm text-gray-600">Sales Return</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button className="px-4 py-2 text-sm font-medium text-purple-600 border-b-2 border-purple-600 bg-purple-50">
                Quotations
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Sales</button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Sales Return</button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                Purchases Return
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Expenses</button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
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
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Reference</th>
                  <th className="text-left p-4 font-medium">Grand Total</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((quotation, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">{quotation.date}</td>
                    <td className="p-4">{quotation.customer}</td>
                    <td className="p-4 text-blue-600">{quotation.reference}</td>
                    <td className="p-4">{quotation.grandTotal}</td>
                    <td className="p-4">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        {quotation.status}
                      </Badge>
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
              <Select defaultValue="10">
                <SelectTrigger className="w-16 ml-2 inline-flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">1 - 10 of 60</span>
              <div className="flex gap-1">
                <button className="px-3 py-1 text-sm border rounded disabled:opacity-50" disabled>
                  prev
                </button>
                <button className="px-3 py-1 text-sm border rounded">next</button>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="p-6 border-t">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Total Items & Quantity</h3>
                <div className="flex items-center justify-center h-64">
                  <div className="w-48 h-48 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm">Karigamombe</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Value by Cost and Price</h3>
                <div className="flex items-center justify-center h-64">
                  <div className="w-48 h-48 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm">Karigamombe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
