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
import { useGetLeaveRequestsQuery, useGetCompaniesQuery, useGetDepartmentsQuery, useCreateLeaveRequestMutation, useUpdateLeaveRequestMutation, useDeleteLeaveRequestMutation, useGetLeaveTypesQuery } from "@/lib/slices/hrmCatalogApi"
import { useGetEmployeesQuery } from "@/lib/slices/hrmApi"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function LeaveRequest() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetLeaveRequestsQuery({ page, limit, search })
  const { data: companiesData } = useGetCompaniesQuery({ page: 1, limit: 100 })
  const { data: departmentsData } = useGetDepartmentsQuery({ page: 1, limit: 100 })
  const { data: leaveTypesData } = useGetLeaveTypesQuery({ page: 1, limit: 100 })
  const { data: employeesData } = useGetEmployeesQuery({ page: 1, limit: 100, search: "" })
  const [createLR, { isLoading: isCreating }] = useCreateLeaveRequestMutation()
  const [updateLR, { isLoading: isUpdating }] = useUpdateLeaveRequestMutation()
  const [deleteLR, { isLoading: isDeleting }] = useDeleteLeaveRequestMutation()
  const [form, setForm] = useState({ id: "", employee_name: "", company_id: "", department_id: "", leave_type: "", start_date: "", finish_date: "", reason: "", status: "pending" })

  const openCreate = () => { setForm({ id: "", employee_name: "", company_id: "", department_id: "", leave_type: "", start_date: "", finish_date: "", reason: "", status: "pending" }); setIsCreateOpen(true) }
  const openEdit = (lr:any) => { setForm({ id: String(lr.id), employee_name: lr.employee_name || "", company_id: String(lr.company_id || ""), department_id: String(lr.department_id || ""), leave_type: lr.leave_type || "", start_date: lr.start_date || "", finish_date: lr.finish_date || "", reason: lr.reason || "", status: lr.status || 'pending' }); setIsCreateOpen(true) }
  const handleDelete = async (id: string) => { await deleteLR(id).unwrap() }
  const handleSubmit = async () => { if (form.id) await updateLR(form as any).unwrap(); else { const { id, ...payload } = form; await createLR(payload as any).unwrap() } setIsCreateOpen(false) }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((r:any)=> [r.employee_name, r.leave_type, r.start_date, r.finish_date, r.status])
    const doc = new jsPDF()
    doc.text('Leave Requests', 14, 16)
    autoTable(doc, { head: [["Employee","Leave Type","Start","Finish","Status"]], body: rows, startY: 20 })
    doc.save('leave-requests.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (data?.data || []).map((r:any)=> ({ Employee: r.employee_name, LeaveType: r.leave_type, Start: r.start_date, Finish: r.finish_date, Status: r.status }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'LeaveRequests')
    XLSX.writeFile(workbook, 'leave-requests.xlsx')
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>HRM</span>
            <span>|</span>
            <span>Leave Request</span>
          </div>
          <h1 className="text-2xl font-bold">Leave Request</h1>
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
                    <DialogTitle>{form.id ? 'Edit Leave Request' : 'Create Leave Request'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="employee">Employee *</Label>
                      <Select value={form.employee_name} onValueChange={(v)=>setForm({...form, employee_name: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {(employeesData?.data || []).map((e:any)=> (
                            <SelectItem key={e.id} value={e.first_name ? `${e.first_name} ${e.last_name || ''}`.trim() : (e.name || e.email || e.id)}>
                              {e.first_name ? `${e.first_name} ${e.last_name || ''}`.trim() : (e.name || e.email || e.id)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="leaveType">Leave Type *</Label>
                      <Select value={form.leave_type} onValueChange={(v)=>setForm({...form, leave_type: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Leave Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {(leaveTypesData?.data || []).map((lt:any)=> (<SelectItem key={lt.id} value={lt.name}>{lt.name}</SelectItem>))}
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
                    <div>
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea id="reason" placeholder="Enter reason for leave" rows={3} value={form.reason} onChange={(e)=>setForm({...form, reason: e.target.value})} />
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
                  <th className="text-left p-4 font-medium">Employee</th>
                  <th className="text-left p-4 font-medium">Company</th>
                  <th className="text-left p-4 font-medium">Department</th>
                  <th className="text-left p-4 font-medium">Leave Type</th>
                  <th className="text-left p-4 font-medium">Start date</th>
                  <th className="text-left p-4 font-medium">Finish date</th>
                  <th className="text-left p-4 font-medium">Days</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={10} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : (data?.data || []).length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8 text-gray-500">No data for table</td></tr>
                ) : (
                  (data?.data || []).map((lr:any)=> (
                    <tr key={lr.id} className="border-b hover:bg-gray-50">
                      <td className="p-4"><input type="checkbox" className="rounded" /></td>
                      <td className="p-4">{lr.employee_name}</td>
                      <td className="p-4">{lr.company || '-'}</td>
                      <td className="p-4">{lr.department || '-'}</td>
                      <td className="p-4">{lr.leave_type}</td>
                      <td className="p-4">{lr.start_date}</td>
                      <td className="p-4">{lr.finish_date}</td>
                      <td className="p-4">{lr.days || '-'}</td>
                      <td className="p-4">{lr.status || '-'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={()=>openEdit(lr)}>Edit</Button>
                          <Button variant="ghost" size="sm" onClick={()=>handleDelete(lr.id)} disabled={isDeleting}>Delete</Button>
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
