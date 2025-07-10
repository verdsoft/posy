"use client"

import DashboardLayout from "../../../components/dashboard-layout"

const customers = [
  {
    name: "walk-in-customer",
    phone: "123456780",
    email: "walk-in-customer@example.com",
    totalSales: 40,
    totalAmount: 1318,
  },
  {
    name: "Paul Macharanga",
    phone: "777890",
    email: "aa@gigigig.yy",
    totalSales: 3,
    totalAmount: 18,
  },
  {
    name: "Kennedy Chari",
    phone: "0774565606",
    email: "dd@gmail.com",
    totalSales: 3,
    totalAmount: 171.1,
  },
  {
    name: "cosmic",
    phone: "0774882645",
    email: "jnogcentral@gmail.com",
    totalSales: 2,
    totalAmount: 272,
  },
  {
    name: "Probottlers Zimbabwe",
    phone: "+263 715 320 318",
    email: "sales@probottlers.co.zw",
    totalSales: 2,
    totalAmount: 110,
  },
  {
    name: "Trust Academy",
    phone: "+263711347117",
    email: "admin@trustacademy.co.zw",
    totalSales: 1,
    totalAmount: 320,
  },
  {
    name: "ZCHPC",
    phone: "334895",
    email: "procurement@zchpc.ac.zw",
    totalSales: 1,
    totalAmount: 75,
  },
]

export default function BestCustomers() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Best Customers</span>
          </div>
          <h1 className="text-2xl font-bold">Best customers</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Total Sales</th>
                  <th className="text-left p-3">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3">{customer.name}</td>
                    <td className="p-3">{customer.phone}</td>
                    <td className="p-3">{customer.email}</td>
                    <td className="p-3">{customer.totalSales}</td>
                    <td className="p-3">$ {customer.totalAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - 7 of 7 | prev next</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
