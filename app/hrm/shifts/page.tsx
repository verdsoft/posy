"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2 } from "lucide-react"

const shifts = [
  {
    id: 1,
    name: "Day",
    company: " Global",
  },
]

export default function OfficeShift() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>HRM</span>
            <span>|</span>
            <span>Office Shift</span>
          </div>
          <h1 className="text-2xl font-bold">Office Shift</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search this table" className="pl-10" />
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">Create</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Office Shift</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Shift Name *</Label>
                      <Input id="name" placeholder="Enter shift name" />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input id="startTime" type="time" />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input id="endTime" type="time" />
                    </div>
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Company" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=""> Global</SelectItem>
                          <SelectItem value="learnedz">LEARNedz Private Limited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-purple-600 hover:bg-purple-700 flex-1">Submit</Button>
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Company</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((shift) => (
                  <tr key={shift.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-4">{shift.name}</td>
                    <td className="p-4">{shift.company}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">1 - 1 of 1</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>
                  prev
                </Button>
                <Button variant="outline" size="sm" disabled>
                  next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
