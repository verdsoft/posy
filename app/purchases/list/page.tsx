"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal } from "lucide-react"

const purchases = [
  {
    id: 1,
    date: "2025-06-12",
    reference: "PR_1315",
    supplier: "verdsoft Global",
    warehouse: "Karigamombe",
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
    warehouse: "Karigamombe",
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
    warehouse: "Karigamombe",
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
    warehouse: "Karigamombe",
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
    warehouse: "Karigamombe",
    status: "Received",
    grandTotal: 300.0,
    paid: 0.0,
    due: 300.0,
    paymentStatus: "Pending",
  },
]

export default function PurchaseList() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Purchases</span>
            <span>|</span>
            <span>Purchase List</span>
          </div>
          <h1 className="text-2xl font-bold">Purchase List</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
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
              <Button variant="outline" className="text-orange-600 bg-transparent">
                📊 EXCEL
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">➕ Create</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">
                    <input type="checkbox" />
                  </th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Reference</th>
                  <th className="text-left p-3">Supplier</th>
                  <th className="text-left p-3">Warehouse</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Grand Total</th>
                  <th className="text-left p-3">Paid</th>
                  <th className="text-left p-3">Due</th>
                  <th className="text-left p-3">Payment Status</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input type="checkbox" />
                    </td>
                    <td className="p-3">{purchase.date}</td>
                    <td className="p-3">{purchase.reference}</td>
                    <td className="p-3">{purchase.supplier}</td>
                    <td className="p-3">{purchase.warehouse}</td>
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
                    <td className="p-3">
                      <Button size="sm" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - 10 of 204 | prev next</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
