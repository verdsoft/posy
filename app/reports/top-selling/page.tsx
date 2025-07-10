"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { DateRangePicker } from "../../../components/date-range-picker"

const products = [
  {
    code: "AC105",
    product: "5mm LED",
    price: 0.25,
    totalSales: 12,
    quantity: "18 Pcs",
    totalAmount: 4.5,
  },
  {
    code: "AB043",
    product: "5V HC_SR04 ULTRASONIC SENSOR 4PIN",
    price: 6,
    totalSales: 12,
    quantity: "18 Pcs",
    totalAmount: 108,
  },
  {
    code: "AC320",
    product: "LM35",
    price: 0.25,
    totalSales: 8,
    quantity: "12 Pcs",
    totalAmount: 3.0,
  },
  {
    code: "AC193",
    product: "MALE HEADER PIN",
    price: 1,
    totalSales: 7,
    quantity: "11 Pcs",
    totalAmount: 11,
  },
  {
    code: "AA046",
    product: "FEMALE TO FEMALE CONNECTORS",
    price: 0.1,
    totalSales: 6,
    quantity: "105 Pcs",
    totalAmount: 10.5,
  },
  {
    code: "AC040",
    product: "9V BATTERY CONNECTOR",
    price: 0.25,
    totalSales: 5,
    quantity: "9 Pcs",
    totalAmount: 2.25,
  },
  {
    code: "AC246",
    product: "ULTRASONIC BRACKET",
    price: 1,
    totalSales: 4,
    quantity: "4 Pcs",
    totalAmount: 4,
  },
  {
    code: "AB028",
    product: "LDR MODULE",
    price: 4.5,
    totalSales: 4,
    quantity: "4 Pcs",
    totalAmount: 18,
  },
  {
    code: "AAB",
    product: "Safe Space - Community Hub",
    price: 2,
    totalSales: 4,
    quantity: "6 Pcs",
    totalAmount: 12,
  },
  {
    code: "AA045a",
    product: "MALE TO MALE CONNECTORS - long",
    price: 0.2,
    totalSales: 4,
    quantity: "84 Pcs",
    totalAmount: 16.8,
  },
]

export default function TopSellingProducts() {
  const [dateRange, setDateRange] = useState("1970-01-01 - 2025-07-01")

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Top Selling Products</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Top Selling Products</h1>
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Code</th>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Total Sales</th>
                  <th className="text-left p-3">Quantity</th>
                  <th className="text-left p-3">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">{product.code}</td>
                    <td className="p-3">{product.product}</td>
                    <td className="p-3">$ {product.price.toFixed(2)}</td>
                    <td className="p-3">{product.totalSales}</td>
                    <td className="p-3">{product.quantity}</td>
                    <td className="p-3">$ {product.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - 10 of 33 | prev next</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
