"use client"

import { useState, useMemo } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2 } from "lucide-react"
import { useGetDepartmentsQuery, useGetCompaniesQuery, useCreateDepartmentMutation, useUpdateDepartmentMutation, useDeleteDepartmentMutation } from "@/lib/slices/hrmCatalogApi"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Departments() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetDepartmentsQuery({ page, limit, search })
  const { data: companiesData } = useGetCompaniesQuery({ page: 1, limit: 100 })
  const [createDepartment, { isLoading: isCreating }] = useCreateDepartmentMutation()
  const [updateDepartment, { isLoading: isUpdating }] = useUpdateDepartmentMutation()
  const [deleteDepartment, { isLoading: isDeleting }] = useDeleteDepartmentMutation()
  const [form, setForm] = useState({ id: "", name: "", company_id: "", description: "", status: "active" })

  const openCreate = () => { setForm({ id: "", name: "", company_id: "", description: "", status: "active" }); setIsCreateOpen(true) }
  const openEdit = (dept: any) => { setForm({ id: String(dept.id), name: dept.name || dept.department || "", company_id: String(dept.company_id || ""), description: dept.description || "", status: dept.status || 'active' }); setIsCreateOpen(true) }
  const handleDelete = async (id: string) => { await deleteDepartment(id).unwrap() }
  const handleSubmit = async () => {
    if (form.id) await updateDepartment(form as any).unwrap(); else { const { id, ...payload } = form; await createDepartment(payload as any).unwrap() }
    setIsCreateOpen(false)
  }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((d:any)=> [
      d.name || d.department || '-',
      companyNameById[String(d.company_id)] || d.company || d.company_name || '-',
      d.description || '-',
      d.status || 'active'
    ])
    const doc = new jsPDF()
    doc.text('Departments', 14, 16)
    autoTable(doc, { head: [["Department","Company","Description","Status"]], body: rows, startY: 20 })
    doc.save('departments.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (data?.data || []).map((d:any)=> ({
        Department: d.name || d.department || '-',
        Company: companyNameById[String(d.company_id)] || d.company || d.company_name || '-',
        Description: d.description || '-',
        Status: d.status || 'active'
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Departments')
    XLSX.writeFile(workbook, 'departments.xlsx')
  }

  const companyNameById = useMemo(() => {
    const map: Record<string, string> = {}
    ;(companiesData?.data || []).forEach((c: any) => {
      map[String(c.id)] = c.name
    })
    return map
  }, [companiesData])

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>HRM</span>
            <span>|</span>
            <span>Department</span>
          </div>
          <h1 className="text-2xl font-bold">Department</h1>
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
                    <DialogTitle>{form.id ? 'Edit Department' : 'Create Department'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Department Name *</Label>
                      <Input id="name" placeholder= "Enter department name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input id= "description" placeholder= "Description" value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Select value={form.company_id} onValueChange={(v: string)=>setForm({...form, company_id: v})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Company" />
                        </SelectTrigger>
                        <SelectContent>
                          {(companiesData?.data || []).map((c:any)=> (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={form.status} onValueChange={(v: string)=>setForm({...form, status: v})}>
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
                  <th className="text-left p-4 font-medium">Department</th>
                  <th className="text-left p-4 font-medium">Company</th>
                  <th className="text-left p-4 font-medium">Description</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : (data?.data || []).length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">No data for table</td></tr>
                ) : ((data?.data || []).map((dept:any) => (
                  <tr key={dept.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-4">{dept.name || dept.department}</td>
                    <td className="p-4">{companyNameById[String(dept.company_id)] || dept.company || dept.company_name || '-'}</td>
                    <td className="p-4">{dept.description || '-'}</td>
                    <td className="p-4">{dept.status || 'active'}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={()=>openEdit(dept)}>
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={()=>handleDelete(dept.id)} disabled={isDeleting}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )))}
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
