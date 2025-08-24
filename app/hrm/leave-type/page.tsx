"use client"

import { useState } from "react"
import { useGetLeaveTypesQuery, useCreateLeaveTypeMutation, useUpdateLeaveTypeMutation, useDeleteLeaveTypeMutation } from "@/lib/slices/hrmCatalogApi"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search } from "lucide-react"
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
  const [form, setForm] = useState({ id: "", name: "" })

  const openCreate = () => { setForm({ id: "", name: "" }); setIsCreateOpen(true) }
  const openEdit = (lt:any) => { setForm({ id: String(lt.id), name: lt.name || "" }); setIsCreateOpen(true) }
  const handleDelete = async (id: string) => { await deleteLeaveType(id).unwrap() }
  const handleSubmit = async () => { if (form.id) await updateLeaveType(form as any).unwrap(); else { const { id, ...payload } = form; await createLeaveType(payload as any).unwrap() } setIsCreateOpen(false) }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((lt:any)=> [lt.name])
    const doc = new jsPDF()
    doc.text('Leave Types', 14, 16)
    autoTable(doc, { head: [["Leave Type"]], body: rows, startY: 20 })
    doc.save('leave-types.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet((data?.data || []).map((lt:any)=> ({ LeaveType: lt.name })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LeaveTypes')
    XLSX.writeFile(workbook, 'leave-types.xlsx')
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>HRM</span>
            <span>|</span>
            <span>Leave Type</span>
          </div>
          <h1 className="text-2xl font-bold">Leave Type</h1>
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
                    <DialogTitle>{form.id ? 'Edit Leave Type' : 'Create Leave Type'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="leaveType">Leave Type Name *</Label>
                      <Input id="leaveType" placeholder="Enter leave type name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
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
                  <th className="text-left p-4 font-medium">Leave Type</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : (data?.data || []).length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-500">No data for table</td></tr>
                ) : (
                  (data?.data || []).map((lt:any)=> (
                    <tr key={lt.id} className="border-b hover:bg-gray-50">
                      <td className="p-4"><input type="checkbox" className="rounded" /></td>
                      <td className="p-4">{lt.name}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={()=>openEdit(lt)}>Edit</Button>
                          <Button variant="ghost" size="sm" onClick={()=>handleDelete(lt.id)} disabled={isDeleting}>Delete</Button>
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
