"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function CreateExpense() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Expenses</span>
            <span>|</span>
            <span>Create Expense</span>
          </div>
          <h1 className="text-2xl font-bold">Create Expense</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input type="date" defaultValue="2025-07-01" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Warehouse *</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="karigamombe">Karigamombe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Expense Category *</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="operational">Operational Costs</SelectItem>
                  <SelectItem value="petty">Petty Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium">Amount *</label>
            <Input placeholder="Amount" className="mt-1" />
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium">Details *</label>
            <Textarea placeholder="A few words ..." className="mt-1" rows={4} />
          </div>

          <Button className="bg-purple-600 hover:bg-purple-700">Submit</Button>
        </div>
      </div>
    </DashboardLayout>
  )
}
