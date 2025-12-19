"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search } from "lucide-react"
import { useGetLeaveRequestsQuery, useGetLeaveTypesQuery, useGetEmployeesQuery, useCreateLeaveRequestMutation, useUpdateLeaveRequestMutation, useDeleteLeaveRequestMutation } from "@/lib/slices/hrmV2Api"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function LeaveRequest() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetLeaveRequestsQuery({ page, limit, search })

  const { data: leaveTypesData } = useGetLeaveTypesQuery({ page: 1, limit: 100 })
  const { data: employeesData } = useGetEmployeesQuery({ page: 1, limit: 100, search: "" })
  const [createLR, { isLoading: isCreating }] = useCreateLeaveRequestMutation()
  const [updateLR, { isLoading: isUpdating }] = useUpdateLeaveRequestMutation()
  const [deleteLR, { isLoading: isDeleting }] = useDeleteLeaveRequestMutation()
  const [form, setForm] = useState({ id: "", employee_id: "", leave_type_id: "", start_date: "", end_date: "", reason: "", status: "pending" })

  const openCreate = () => { setForm({ id: "", employee_id: "", leave_type_id: "", start_date: "", end_date: "", reason: "", status: "pending" }); setIsCreateOpen(true) }
  const openEdit = (lr: any) => {
    setForm({
      id: String(lr.id),
      employee_id: String(lr.employee_id || ""),
      leave_type_id: String(lr.leave_type_id || ""),
      start_date: lr.start_date ? new Date(lr.start_date).toISOString().split('T')[0] : "",
      end_date: lr.end_date ? new Date(lr.end_date).toISOString().split('T')[0] : "",
      reason: lr.reason || "",
      status: lr.status || 'pending'
    })
    setIsCreateOpen(true)
  }
  const handleDelete = async (id: string) => { await deleteLR(parseInt(id)).unwrap() }
  const handleSubmit = async () => {
    const payload = { ...form, employee_id: parseInt(form.employee_id), leave_type_id: parseInt(form.leave_type_id) }
    if (form.id) await updateLR(payload as any).unwrap();
    else {
      // @ts-ignore
      const { id, ...rest } = payload
      await createLR(rest as any).unwrap()
    }
    setIsCreateOpen(false)
  }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((r: any) => [
      r.employees?.name,
      r.leave_types?.name,
      new Date(r.start_date).toLocaleDateString(),
      new Date(r.end_date).toLocaleDateString(),
      r.status
    ])
    const doc = new jsPDF()
    doc.text('Leave Requests', 14, 16)
    autoTable(doc, { head: [["Employee", "Leave Type", "Start", "End", "Status"]], body: rows, startY: 20 })
    doc.save('leave-requests.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (data?.data || []).map((r: any) => ({
        Employee: r.employees?.name,
        LeaveType: r.leave_types?.name,
        Start: new Date(r.start_date).toLocaleDateString(),
        End: new Date(r.end_date).toLocaleDateString(),
        Status: r.status
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LeaveRequests')
    XLSX.writeFile(workbook, 'leave-requests.xlsx')
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>HRM</span>
            <span>|</span>
            <span>Leave Request</span>
          </div>
          {/* <h1 className="text-2xl font-bold">Leave Request</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input placeholder="Search leave requests..." className="w-full md:w-64 h-8 text-sm pl-8" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-8 px-2 text-xs flex-1 md:flex-none">PDF</Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel} className="h-8 px-2 text-xs flex-1 md:flex-none">EXCEL</Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none" onClick={openCreate}>Create Leave Request</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{form.id ? 'Edit Leave Request' : 'Create Leave Request'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="employee">Employee *</Label>
                      <Select value={form.employee_id} onValueChange={(v) => setForm({ ...form, employee_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {(employeesData?.data || []).map((e: any) => (
                            <SelectItem key={e.id} value={String(e.id)}>
                              {e.name || e.first_name || e.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="leaveType">Leave Type *</Label>
                      <Select value={form.leave_type_id} onValueChange={(v) => setForm({ ...form, leave_type_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Leave Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {(leaveTypesData?.data || []).map((lt: any) => (<SelectItem key={lt.id} value={String(lt.id)}>{lt.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input id="startDate" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="finishDate">End Date *</Label>
                      <Input id="finishDate" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea id="reason" placeholder="Enter reason for leave" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-[#1a237e] hover:bg-purple-700 flex-1" onClick={handleSubmit} disabled={isCreating || isUpdating}>{form.id ? (isUpdating ? 'Updating...' : 'Update') : (isCreating ? 'Creating...' : 'Create')}</Button>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] p-2">
                    <input type="checkbox" className="rounded" />
                  </TableHead>
                  <TableHead className="p-2">Employee</TableHead>
                  <TableHead className="p-2">Leave Type</TableHead>
                  <TableHead className="p-2">Start Date</TableHead>
                  <TableHead className="p-2">End Date</TableHead>
                  <TableHead className="p-2">Days</TableHead>
                  <TableHead className="p-2">Status</TableHead>
                  <TableHead className="p-2">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                ) : (data?.data || []).length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8 text-gray-500">No data for table</TableCell></TableRow>
                ) : (
                  (data?.data || []).map((lr: any) => (
                    <TableRow key={lr.id} className="border-b hover:bg-gray-50">
                      <TableCell className="p-2"><input type="checkbox" className="rounded" /></TableCell>
                      <TableCell className="p-2">{lr.employees?.name || '-'}</TableCell>
                      <TableCell className="p-2">{lr.leave_types?.name || '-'}</TableCell>
                      <TableCell className="p-2">{new Date(lr.start_date).toLocaleDateString()}</TableCell>
                      <TableCell className="p-2">{new Date(lr.end_date).toLocaleDateString()}</TableCell>
                      <TableCell className="p-2">{lr.days}</TableCell>
                      <TableCell className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${lr.status === 'approved' ? 'bg-green-100 text-green-800' : lr.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {lr.status}
                        </span>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(lr)}>Edit</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(lr.id)} disabled={isDeleting}>Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data?.pagination?.total || 0)} of {data?.pagination?.total || 0} entries
            </div>
            <div className="flex items-center gap-2">
              <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
                <SelectTrigger className="h-7 w-[60px] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((size) => (<SelectItem key={size} value={String(size)} className="text-xs">{size}</SelectItem>))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                {Array.from({ length: Math.min(5, data?.pagination?.totalPages || 1) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <Button key={p} variant={page === p ? "default" : "ghost"} size="sm" className={`h-7 w-7 text-xs p-0 ${page === p ? "bg-[#1a237e] hover:bg-purple-700" : ""}`} onClick={() => setPage(p)}>{p}</Button>
                  )
                })}
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page >= (data?.pagination?.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
