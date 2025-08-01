"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function Holidays() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>HRM</span>
            <span>|</span>
            <span>Holidays</span>
          </div>
          <h1 className="text-2xl font-bold">Holidays</h1>
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
                    <DialogTitle>Create Holiday</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="holiday">Holiday Name *</Label>
                      <Input id="holiday" placeholder="Enter holiday name" />
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
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input id="startDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="finishDate">Finish Date *</Label>
                      <Input id="finishDate" type="date" />
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
                  <th className="text-left p-4 font-medium">Holiday</th>
                  <th className="text-left p-4 font-medium">Company</th>
                  <th className="text-left p-4 font-medium">Start date</th>
                  <th className="text-left p-4 font-medium">Finish date</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No data for table
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">0 - 0 of 0</span>
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
