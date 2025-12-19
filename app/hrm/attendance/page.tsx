"use client"

import { useState } from "react"
import { useGetAttendanceQuery, useGetEmployeesQuery, useCreateAttendanceMutation, useUpdateAttendanceMutation, useDeleteAttendanceMutation } from "@/lib/slices/hrmV2Api"
import { Edit, Trash2, FileDown } from "lucide-react"
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
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

export default function Attendances() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetAttendanceQuery({ page, limit, search })
  const { data: employeesData } = useGetEmployeesQuery({ page: 1, limit: 100 })
  const [createAttendance, { isLoading: isCreating }] = useCreateAttendanceMutation()
  const [updateAttendance, { isLoading: isUpdating }] = useUpdateAttendanceMutation()
  const [deleteAttendance, { isLoading: isDeleting }] = useDeleteAttendanceMutation()
  const [form, setForm] = useState({ id: "", employee_id: "", date: "", time_in: "", time_out: "", status: "present" })

  const openCreate = () => { setForm({ id: "", employee_id: "", date: "", time_in: "", time_out: "", status: "present" }); setIsCreateOpen(true) }
  const openEdit = (item: any) => {
    setForm({
      id: String(item.id),
      employee_id: String(item.employee_id),
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : "",
      time_in: item.time_in ? new Date(item.time_in).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "",
      time_out: item.time_out ? new Date(item.time_out).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "",
      status: item.status || 'present'
    })
    setIsCreateOpen(true)
  }

  const handleDelete = async (id: string) => { await deleteAttendance(parseInt(id)).unwrap() }

  const handleSubmit = async () => {
    const payload = {
      ...form,
      employee_id: parseInt(form.employee_id),
      date: new Date(form.date).toISOString(),
      time_in: form.time_in ? new Date(`${form.date}T${form.time_in}:00`).toISOString() : null,
      time_out: form.time_out ? new Date(`${form.date}T${form.time_out}:00`).toISOString() : null
    }

    if (form.id) {
      await updateAttendance(payload as any).unwrap()
    } else {
      // @ts-ignore
      const { id, ...newPayload } = payload
      await createAttendance(newPayload as any).unwrap()
    }
    setIsCreateOpen(false)
  }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((row: any) => [
      row.employees?.name || '-',
      new Date(row.date).toLocaleDateString(),
      row.time_in ? new Date(row.time_in).toLocaleTimeString() : '-',
      row.time_out ? new Date(row.time_out).toLocaleTimeString() : '-',
      row.status
    ])
    const doc = new jsPDF()
    doc.text('Attendance', 14, 16)
    autoTable(doc, { head: [["Employee", "Date", "In", "Out", "Status"]], body: rows, startY: 20 })
    doc.save('attendance.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet((data?.data || []).map((row: any) => ({
      Employee: row.employees?.name || '-',
      Date: new Date(row.date).toLocaleDateString(),
      TimeIn: row.time_in ? new Date(row.time_in).toLocaleTimeString() : '-',
      TimeOut: row.time_out ? new Date(row.time_out).toLocaleTimeString() : '-',
      Status: row.status
    })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance')
    XLSX.writeFile(workbook, 'attendance.xlsx')
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>HRM</span>
            <span>|</span>
            <span>Attendance</span>
          </div>
          {/* <h1 className="text-2xl font-bold">Attendance</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input placeholder="Search attendance..." className="w-full md:w-64 h-8 text-sm pl-8" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-8 px-2 text-xs flex-1 md:flex-none">PDF</Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel} className="h-8 px-2 text-xs flex-1 md:flex-none">EXCEL</Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none" onClick={openCreate}>Create Attendance</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{form.id ? 'Edit Attendance' : 'Create Attendance'}</DialogTitle>
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
                            <SelectItem key={e.id} value={String(e.id)}>{e.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input id="date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="timeIn">Time In</Label>
                      <Input id="timeIn" type="time" value={form.time_in} onChange={(e) => setForm({ ...form, time_in: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="timeOut">Time Out</Label>
                      <Input id="timeOut" type="time" value={form.time_out} onChange={(e) => setForm({ ...form, time_out: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-[#1a237e] hover:bg-purple-700 flex-1" onClick={handleSubmit} disabled={isCreating || isUpdating}>{form.id ? 'Update' : 'Create'}</Button>
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
                  <TableHead className="p-2">Date</TableHead>
                  <TableHead className="p-2">Time In</TableHead>
                  <TableHead className="p-2">Time Out</TableHead>
                  <TableHead className="p-2">Status</TableHead>
                  <TableHead className="p-2">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                ) : (data?.data || []).length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-gray-500">No data for table</TableCell></TableRow>
                ) : (
                  (data?.data || []).map((row: any) => (
                    <TableRow key={row.id} className="border-b hover:bg-gray-50">
                      <TableCell className="p-2"><input type="checkbox" className="rounded" /></TableCell>
                      <TableCell className="p-2">{row.employees?.name || '-'}</TableCell>
                      <TableCell className="p-2">{new Date(row.date).toLocaleDateString()}</TableCell>
                      <TableCell className="p-2">{row.time_in ? new Date(row.time_in).toLocaleTimeString() : '-'}</TableCell>
                      <TableCell className="p-2">{row.time_out ? new Date(row.time_out).toLocaleTimeString() : '-'}</TableCell>
                      <TableCell className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${row.status === 'present' ? 'bg-green-100 text-green-800' : row.status === 'absent' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {row.status}
                        </span>
                      </TableCell>
                      <TableCell className="p-2">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(row)}><Edit className="h-4 w-4 text-green-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(row.id)} disabled={isDeleting}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
