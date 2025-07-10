"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit } from "lucide-react"

const categories = [
  {
    id: 1,
    name: "Petty Payments",
    description: "Due debts",
  },
  {
    id: 2,
    name: "Salaries",
    description: "",
  },
  {
    id: 3,
    name: "Operational Costs",
    description: "",
  },
  {
    id: 4,
    name: "Lunch",
    description: "",
  },
]

export default function ExpenseCategory() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Expenses</span>
            <span>|</span>
            <span>Expense Category</span>
          </div>
          <h1 className="text-2xl font-bold">Expense Category</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input placeholder="Search this table..." className="w-64" />
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                  <th className="text-left p-3">Category Name</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input type="checkbox" />
                    </td>
                    <td className="p-3">{category.name}</td>
                    <td className="p-3">{category.description}</td>
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
            <div className="text-sm text-gray-600">1 - 4 of 4 | prev next</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
