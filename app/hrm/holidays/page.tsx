"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useGetHolidaysQuery, useGetCompaniesQuery, useCreateHolidayMutation, useUpdateHolidayMutation, useDeleteHolidayMutation } from "@/lib/slices/hrmCatalogApi"

export default function Holidays() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetHolidaysQuery({ page, limit, search })
  const { data: companiesData } = useGetCompaniesQuery({ page: 1, limit: 100 })
  const [createHoliday, { isLoading: isCreating }] = useCreateHolidayMutation()
  const [updateHoliday, { isLoading: isUpdating }] = useUpdateHolidayMutation()
  const [deleteHoliday, { isLoading: isDeleting }] = useDeleteHolidayMutation()
  const [form, setForm] = useState({ id: "", name: "", company_id: "", start_date: "", finish_date: "" })

  const openCreate = () => { setForm({ id: "", name: "", company_id: "", start_date: "", finish_date: "" }); setIsCreateOpen(true) }
  const openEdit = (h:any) => { setForm({ id: String(h.id), name: h.name || "", company_id: String(h.company_id || ""), start_date: h.start_date || "", finish_date: h.finish_date || "" }); setIsCreateOpen(true) }
  const handleDelete = async (id: string) => { await deleteHoliday(id).unwrap() }
  const handleSubmit = async () => { if (form.id) await updateHoliday(form as any).unwrap(); else { const { id, ...payload } = form; await createHoliday(payload as any).unwrap() } setIsCreateOpen(false) }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((h:any)=> [h.name, h.company || '-', h.start_date, h.finish_date])
    const doc = new jsPDF()
    doc.text('Holidays', 14, 16)
    autoTable(doc, { head: [["Holiday","Company","Start","Finish"]], body: rows, startY: 20 })
    doc.save('holidays.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet((data?.data || []).map((h:any)=> ({ Holiday: h.name, Company: h.company || '-', Start: h.start_date, Finish: h.finish_date })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Holidays')
    XLSX.writeFile(workbook, 'holidays.xlsx')
  }

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
                    <DialogTitle>{form.id ? 'Edit Holiday' : 'Create Holiday'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="holiday">Holiday Name *</Label>
                      <Input id="holiday" placeholder="Enter holiday name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Select value={form.company_id} onValueChange={(v)=>setForm({...form, company_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Company" />
                        </SelectTrigger>
                        <SelectContent>
                          {(companiesData?.data || []).map((c:any)=> (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input id="startDate" type="date" value={form.start_date} onChange={(e)=>setForm({...form, start_date: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="finishDate">Finish Date *</Label>
                      <Input id="finishDate" type="date" value={form.finish_date} onChange={(e)=>setForm({...form, finish_date: e.target.value})} />
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
                  <th className="text-left p-4 font-medium">Holiday</th>
                  <th className="text-left p-4 font-medium">Company</th>
                  <th className="text-left p-4 font-medium">Start date</th>
                  <th className="text-left p-4 font-medium">Finish date</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : (data?.data || []).length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No data for table</td></tr>
                ) : (
                  (data?.data || []).map((h:any)=> (
                    <tr key={h.id} className="border-b hover:bg-gray-50">
                      <td className="p-4"><input type="checkbox" className="rounded" /></td>
                      <td className="p-4">{h.name}</td>
                      <td className="p-4">{h.company || '-'}</td>
                      <td className="p-4">{h.start_date}</td>
                      <td className="p-4">{h.finish_date}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={()=>openEdit(h)}>Edit</Button>
                          <Button variant="ghost" size="sm" onClick={()=>handleDelete(h.id)} disabled={isDeleting}>Delete</Button>
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
