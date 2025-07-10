"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

const products = [
  {
    code: "AB043",
    product: "5V HC_SR04 ULTRASONIC SENSOR 4PIN",
    warehouse: "Karigamombe Centre",
    quantity: 0,
    alertQuantity: 0,
  },
  {
    code: "AA999",
    product: "4*4 KEYPAD",
    warehouse: "Karigamombe",
    quantity: 0,
    alertQuantity: 0,
  },
  {
    code: "AA999",
    product: "4*4 KEYPAD",
    warehouse: "Karigamombe Centre",
    quantity: 0,
    alertQuantity: 0,
  },
  {
    code: "AA276",
    product: "HC05 BLUETOOTH MODULE",
    warehouse: "Karigamombe",
    quantity: 0,
    alertQuantity: 0,
  },
  {
    code: "AA276",
    product: "HC05 BLUETOOTH MODULE",
    warehouse: "Karigamombe Centre",
    quantity: 0,
    alertQuantity: 0,
  },
  {
    code: "AC105",
    product: "5mm LED",
    warehouse: "Karigamombe Centre",
    quantity: 0,
    alertQuantity: 0,
  },
  {
    code: "AC320",
    product: "LM35",
    warehouse: "Karigamombe Centre",
    quantity: 0,
    alertQuantity: 0,
  },
  {
    code: "AC040",
    product: "9V BATTERY CONNECTOR",
    warehouse: "Karigamombe",
    quantity: 0,
    alertQuantity: 0,
  },
  {
    code: "AC040",
    product: "9V BATTERY CONNECTOR",
    warehouse: "Karigamombe Centre",
    quantity: 0,
    alertQuantity: 0,
  },
  {
    code: "AC191",
    product: "MALE HEADER PIN",
    warehouse: "Karigamombe Centre",
    quantity: 0,
    alertQuantity: 0,
  },
]

export default function ProductQuantityAlerts() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Product Quantity Alerts</span>
          </div>
          <h1 className="text-2xl font-bold">Product Quantity Alerts</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-end">
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
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Code</th>
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Warehouse</th>
                  <th className="text-left p-4 font-medium">Quantity</th>
                  <th className="text-left p-4 font-medium">Alert Quantity</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-4">{product.code}</td>
                    <td className="p-4 text-blue-600">{product.product}</td>
                    <td className="p-4">{product.warehouse}</td>
                    <td className="p-4">{product.quantity}</td>
                    <td className="p-4">
                      <Badge variant="destructive" className="bg-red-100 text-red-800">
                        {product.alertQuantity}
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
              <span className="text-sm text-gray-600">1 - 10 of 315</span>
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
