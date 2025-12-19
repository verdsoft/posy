"use client"

import { useState } from "react"
import { useGetLeaveTypesQuery, useCreateLeaveTypeMutation, useUpdateLeaveTypeMutation, useDeleteLeaveTypeMutation } from "@/lib/slices/hrmV2Api"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
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

export default function LeaveType() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetLeaveTypesQuery({ page, limit, search })
  const [createLeaveType, { isLoading: isCreating }] = useCreateLeaveTypeMutation()
  const [updateLeaveType, { isLoading: isUpdating }] = useUpdateLeaveTypeMutation()
  const [deleteLeaveType, { isLoading: isDeleting }] = useDeleteLeaveTypeMutation()
  const [form, setForm] = useState({ id: "", name: "", days_allowed: "", status: "active" })

  const openCreate = () => { setForm({ id: "", name: "", days_allowed: "", status: "active" }); setIsCreateOpen(true) }
  const openEdit = (lt: any) => { setForm({ id: String(lt.id), name: lt.name || "", days_allowed: String(lt.days_allowed || 0), status: lt.status || 'active' }); setIsCreateOpen(true) }
  const handleDelete = async (id: string) => { await deleteLeaveType(parseInt(id)).unwrap() }
  const handleSubmit = async () => {
    const payload = { ...form, days_allowed: parseInt(String(form.days_allowed)) || 0 }
    if (form.id) await updateLeaveType(payload as any).unwrap();
    else { const { id, ...rest } = payload; await createLeaveType(rest as any).unwrap() }
    setIsCreateOpen(false)
  }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((lt: any) => [lt.name, lt.days_allowed, lt.status])
    const doc = new jsPDF()
    doc.text('Leave Types', 14, 16)
    autoTable(doc, { head: [["Leave Type", "Days Allowed", "Status"]], body: rows, startY: 20 })
    doc.save('leave-types.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet((data?.data || []).map((lt: any) => ({ LeaveType: lt.name, DaysAllowed: lt.days_allowed, Status: lt.status })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LeaveTypes')
    XLSX.writeFile(workbook, 'leave-types.xlsx')
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>HRM</span>
            <span>|</span>
            <span>Leave Type</span>
          </div>
          {/* <h1 className="text-2xl font-bold">Leave Type</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input placeholder="Search leave types..." className="w-full md:w-64 h-8 text-sm pl-8" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-8 px-2 text-xs flex-1 md:flex-none">PDF</Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel} className="h-8 px-2 text-xs flex-1 md:flex-none">EXCEL</Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none" onClick={openCreate}>Create Leave Type</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{form.id ? 'Edit Leave Type' : 'Create Leave Type'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="leaveType">Leave Type Name *</Label>
                      <Input id="leaveType" placeholder="Enter leave type name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="daysAllowed">Days Allowed *</Label>
                      <Input id="daysAllowed" type="number" placeholder="Enter days allowed" value={form.days_allowed} onChange={(e) => setForm({ ...form, days_allowed: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <TableHead className="p-2">Leave Type</TableHead>
                  <TableHead className="p-2">Days Allowed</TableHead>
                  <TableHead className="p-2">Status</TableHead>
                  <TableHead className="p-2">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                ) : (data?.data || []).length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No data for table</TableCell></TableRow>
                ) : (
                  (data?.data || []).map((lt: any) => (
                    <TableRow key={lt.id} className="border-b hover:bg-gray-50">
                      <TableCell className="p-2"><input type="checkbox" className="rounded" /></TableCell>
                      <TableCell className="p-2">{lt.name}</TableCell>
                      <TableCell className="p-2">{lt.days_allowed}</TableCell>
                      <TableCell className="p-2">{lt.status}</TableCell>
                      <TableCell className="p-2">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(lt)}>Edit</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(lt.id)} disabled={isDeleting}>Delete</Button>
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
