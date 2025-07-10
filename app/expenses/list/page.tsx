"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit } from "lucide-react"

const expenses = [
  {
    id: 1,
    date: "2025-06-26",
    reference: "EXP_1125",
    details:
      "List Onetime 1.50 Leslie 1.50 Time 1.50 Talent 1.50 Courage 1.50 Cider 1.50 Mervin 1.50 Lincoln 1.50 Prince 1.50 Mubas 1.50 Alienne 1.50 Sir Inna 1.50 bunny 1.50 tamaka 1.50",
    amount: 21.0,
    category: "Lunch",
    warehouse: "Karigamombe",
  },
  {
    id: 2,
    date: "2025-01-08",
    reference: "EXP_1124",
    details: "kits purchase",
    amount: 100.0,
    category: "Operational Costs",
    warehouse: "Karigamombe",
  },
  {
    id: 3,
    date: "2025-01-08",
    reference: "EXP_1123",
    details: "lunch payment",
    amount: 16.0,
    category: "Lunch",
    warehouse: "Karigamombe",
  },
  {
    id: 4,
    date: "2024-02-02",
    reference: "EXP_1122",
    details: "Lunch",
    amount: 200.0,
    category: "Lunch",
    warehouse: "Karigamombe",
  },
  {
    id: 5,
    date: "2024-02-02",
    reference: "EXP_1121",
    details: "Marirangwe",
    amount: 2000.0,
    category: "Operational Costs",
    warehouse: "Karigamombe",
  },
  {
    id: 6,
    date: "2023-01-10",
    reference: "EXP_1120",
    details: "lunch",
    amount: 9.0,
    category: "Lunch",
    warehouse: "Karigamombe",
  },
  {
    id: 7,
    date: "2023-01-09",
    reference: "EXP_1119",
    details: "Lunch",
    amount: 10.0,
    category: "Lunch",
    warehouse: "Karigamombe",
  },
  {
    id: 8,
    date: "2023-01-10",
    reference: "EXP_1118",
    details: "Rent",
    amount: 270.0,
    category: "Operational Costs",
    warehouse: "Karigamombe",
  },
  {
    id: 9,
    date: "2023-01-05",
    reference: "EXP_1117",
    details: "Benjamin Makoni",
    amount: 8.0,
    category: "Petty Payments",
    warehouse: "Karigamombe",
  },
  {
    id: 10,
    date: "2023-01-04",
    reference: "EXP_1116",
    details: "Food",
    amount: 10.0,
    category: "Lunch",
    warehouse: "Karigamombe",
  },
]

export default function ExpenseList() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Expenses</span>
            <span>|</span>
            <span>Expense List</span>
          </div>
          <h1 className="text-2xl font-bold">Expense List</h1>
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
                  <th className="text-left p-3">Details</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-left p-3">Warehouse</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input type="checkbox" />
                    </td>
                    <td className="p-3">{expense.date}</td>
                    <td className="p-3">{expense.reference}</td>
                    <td className="p-3 max-w-xs truncate">{expense.details}</td>
                    <td className="p-3">{expense.amount.toFixed(2)}</td>
                    <td className="p-3">{expense.category}</td>
                    <td className="p-3">{expense.warehouse}</td>
                    <td className="p-3">
                      <Button size="sm" variant="ghost" className="text-green-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - 10 of 12 | prev next</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
