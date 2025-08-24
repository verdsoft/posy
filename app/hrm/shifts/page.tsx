"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2 } from "lucide-react"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useGetShiftsQuery, useGetCompaniesQuery, useCreateShiftMutation, useUpdateShiftMutation, useDeleteShiftMutation } from "@/lib/slices/hrmCatalogApi"

export default function OfficeShift() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetShiftsQuery({ page, limit, search })
  const { data: companiesData } = useGetCompaniesQuery({ page: 1, limit: 100 })
  const [createShift, { isLoading: isCreating }] = useCreateShiftMutation()
  const [updateShift, { isLoading: isUpdating }] = useUpdateShiftMutation()
  const [deleteShift, { isLoading: isDeleting }] = useDeleteShiftMutation()
  const [form, setForm] = useState({ id: "", name: "", company_id: "", start_time: "", end_time: "" })

  const openCreate = () => { setForm({ id: "", name: "", company_id: "", start_time: "", end_time: "" }); setIsCreateOpen(true) }
  const openEdit = (s:any) => { setForm({ id: String(s.id), name: s.name || "", company_id: String(s.company_id || ""), start_time: s.start_time || "", end_time: s.end_time || "" }); setIsCreateOpen(true) }
  const handleDelete = async (id: string) => { await deleteShift(id).unwrap() }
  const handleSubmit = async () => { if (form.id) await updateShift(form as any).unwrap(); else { const { id, ...payload } = form; await createShift(payload as any).unwrap() } setIsCreateOpen(false) }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((s:any)=> [s.name, s.company || '-', s.start_time || '-', s.end_time || '-'])
    const doc = new jsPDF()
    doc.text('Office Shifts', 14, 16)
    autoTable(doc, { head: [["Name","Company","Start","End"]], body: rows, startY: 20 })
    doc.save('office-shifts.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet((data?.data || []).map((s:any)=> ({ Name: s.name, Company: s.company || '-', Start: s.start_time || '-', End: s.end_time || '-' })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'OfficeShifts')
    XLSX.writeFile(workbook, 'office-shifts.xlsx')
  }

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
                <Input placeholder="Search this table" className="pl-10" value={search} onChange={(e)=>{setSearch(e.target.value); setPage(1)}} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPDF}>PDF</Button>
                <Button variant="outline" size="sm" onClick={handleExportExcel}>EXCEL</Button>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700" onClick={openCreate}>Create</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{form.id ? 'Edit Office Shift' : 'Create Office Shift'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Shift Name *</Label>
                      <Input id="name" placeholder="Enter shift name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input id="startTime" type="time" value={form.start_time} onChange={(e)=>setForm({...form, start_time: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input id="endTime" type="time" value={form.end_time} onChange={(e)=>setForm({...form, end_time: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Select value={form.company_id} onValueChange={(v)=>setForm({...form, company_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Company" />
                        </SelectTrigger>
                        <SelectContent>
                          {(companiesData?.data || []).map((c:any)=> (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-purple-600 hover:bg-purple-700 flex-1" onClick={handleSubmit} disabled={isCreating || isUpdating}>{form.id ? (isUpdating ? 'Updating...' : 'Update') : (isCreating ? 'Creating...' : 'Create')}</Button>
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
                {isLoading ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : (data?.data || []).length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8 text-gray-500">No data for table</td></tr>
                ) : (
                  (data?.data || []).map((shift:any) => (
                    <tr key={shift.id} className="border-b hover:bg-gray-50">
                      <td className="p-4"><input type="checkbox" className="rounded" /></td>
                      <td className="p-4">{shift.name}</td>
                      <td className="p-4">{shift.company || '-'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={()=>openEdit(shift)}><Edit className="h-4 w-4 text-green-600" /></Button>
                          <Button variant="ghost" size="sm" onClick={()=>handleDelete(shift.id)} disabled={isDeleting}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: {limit}</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Page {page} of {data?.pagination?.totalPages || 1}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled={page===1} onClick={()=>setPage((p)=>Math.max(1,p-1))}>
                  prev
                </Button>
                <Button variant="outline" size="sm" disabled={page>=(data?.pagination?.totalPages||1)} onClick={()=>setPage((p)=>p+1)}>
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
