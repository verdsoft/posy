"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2 } from "lucide-react"
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
import { useGetShiftsQuery, useCreateShiftMutation, useUpdateShiftMutation, useDeleteShiftMutation } from "@/lib/slices/hrmV2Api"

export default function OfficeShift() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetShiftsQuery({ page, limit, search })

  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation()
  const [updateShift, { isLoading: isUpdating }] = useUpdateShiftMutation()
  const [deleteShift, { isLoading: isDeleting }] = useDeleteShiftMutation()
  const [form, setForm] = useState({ id: "", name: "", start_time: "", end_time: "" })

  const openCreate = () => { setForm({ id: "", name: "", start_time: "", end_time: "" }); setIsCreateOpen(true) }
  const openEdit = (s: any) => {
    setForm({
      id: String(s.id),
      name: s.name || "",
      start_time: s.start_time ? new Date(s.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "",
      end_time: s.end_time ? new Date(s.end_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ""
    })
    setIsCreateOpen(true)
  }
  const handleDelete = async (id: string) => { await deleteShift(parseInt(id)).unwrap() }
  const handleSubmit = async () => { if (form.id) await updateShift(form as any).unwrap(); else { const { id, ...payload } = form; await createShift(payload as any).unwrap() } setIsCreateOpen(false) }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((s: any) => [
      s.name,
      s.start_time ? new Date(s.start_time).toLocaleTimeString() : '-',
      s.end_time ? new Date(s.end_time).toLocaleTimeString() : '-'
    ])
    const doc = new jsPDF()
    doc.text('Office Shifts', 14, 16)
    autoTable(doc, { head: [["Name", "Start", "End"]], body: rows, startY: 20 })
    doc.save('office-shifts.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet((data?.data || []).map((s: any) => ({
      Name: s.name,
      Start: s.start_time ? new Date(s.start_time).toLocaleTimeString() : '-',
      End: s.end_time ? new Date(s.end_time).toLocaleTimeString() : '-'
    })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OfficeShifts')
    XLSX.writeFile(workbook, 'office-shifts.xlsx')
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>HRM</span>
            <span>|</span>
            <span>Office Shift</span>
          </div>
          {/* <h1 className="text-2xl font-bold">Office Shift</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input placeholder="Search shifts..." className="w-full md:w-64 h-8 text-sm pl-8" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-8 px-2 text-xs flex-1 md:flex-none">PDF</Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel} className="h-8 px-2 text-xs flex-1 md:flex-none">EXCEL</Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none" onClick={openCreate}>Create Shift</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{form.id ? 'Edit Office Shift' : 'Create Office Shift'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Shift Name *</Label>
                      <Input id="name" placeholder="Enter shift name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input id="startTime" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input id="endTime" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
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
                  <TableHead className="p-2">Name</TableHead>
                  <TableHead className="p-2">Start Time</TableHead>
                  <TableHead className="p-2">End Time</TableHead>
                  <TableHead className="p-2">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                ) : (data?.data || []).length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No data for table</TableCell></TableRow>
                ) : (
                  (data?.data || []).map((shift: any) => (
                    <TableRow key={shift.id} className="border-b hover:bg-gray-50">
                      <TableCell className="p-2"><input type="checkbox" className="rounded" /></TableCell>
                      <TableCell className="p-2">{shift.name}</TableCell>
                      <TableCell className="p-2">{shift.start_time ? new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                      <TableCell className="p-2">{shift.end_time ? new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</TableCell>
                      <TableCell className="p-2">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(shift)}><Edit className="h-4 w-4 text-green-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(shift.id)} disabled={isDeleting}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
    </DashboardLayout >
  )
}
