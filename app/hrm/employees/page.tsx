"use client"

import { useState } from "react"
import { useGetEmployeesQuery, useCreateEmployeeMutation, useUpdateEmployeeMutation, useDeleteEmployeeMutation } from "@/lib/slices/hrmApi"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, FileDown } from "lucide-react"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useGetCompaniesQuery, useGetDepartmentsQuery, useGetShiftsQuery } from "@/lib/slices/hrmCatalogApi"

export default function Employees() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetEmployeesQuery({ page, limit, search })
  const { data: companiesData } = useGetCompaniesQuery({ page: 1, limit: 100 })
  const { data: departmentsData } = useGetDepartmentsQuery({ page: 1, limit: 100 })
  const { data: shiftsData } = useGetShiftsQuery({ page: 1, limit: 100 })

  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation()
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation()
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation()
  const [form, setForm] = useState({
    id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_id: "",
    department_id: "",
    designation: "",
    shift_id: "",
  })

  const openCreate = () => {
    setForm({ id: "", first_name: "", last_name: "", email: "", phone: "", company_id: "", department_id: "", designation: "", shift_id: "" })
    setIsCreateOpen(true)
  }

  const openEdit = (emp: any) => {
    setForm({
      id: emp.id,
      first_name: emp.first_name || emp.firstName || "",
      last_name: emp.last_name || emp.lastName || "",
      email: emp.email || "",
      phone: emp.phone || "",
      company_id: String(emp.company_id || ""),
      department_id: String(emp.department_id || ""),
      designation: emp.designation || "",
      shift_id: String(emp.shift_id || ""),
    })
    setIsCreateOpen(true)
  }

  const handleSubmit = async () => {
    if (form.id) {
      await updateEmployee(form as any).unwrap()
    } else {
      const { id, ...payload } = form
      await createEmployee(payload as any).unwrap()
    }
    setIsCreateOpen(false)
  }

  const handleDelete = async (id: string) => {
    await deleteEmployee(id).unwrap()
  }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((e:any)=> [
      e.first_name || e.firstName || '-',
      e.last_name || e.lastName || '-',
      e.phone || '-',
      e.company || e.company_name || '-',
      e.department || '-',
      e.designation || '-',
      e.shift || e.office_shift || '-',
    ])
    const doc = new jsPDF()
    doc.text('Employees', 14, 16)
    autoTable(doc, { head: [["First Name","Last Name","Phone","Company","Department","Designation","Shift"]], body: rows, startY: 20 })
    doc.save('employees.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (data?.data || []).map((e:any)=> ({
        FirstName: e.first_name || e.firstName || '-',
        LastName: e.last_name || e.lastName || '-',
        Phone: e.phone || '-',
        Company: e.company || e.company_name || '-',
        Department: e.department || '-',
        Designation: e.designation || '-',
        Shift: e.shift || e.office_shift || '-',
      }))
    )
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees')
    XLSX.writeFile(workbook, 'employees.xlsx')
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>HRM</span>
            <span>|</span>
            <span>Employees</span>
          </div>
          <h1 className="text-2xl font-bold">Employees</h1>
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
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportExcel}>
                  <FileDown className="h-4 w-4 mr-2" />
                  EXCEL
                </Button>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={openCreate}>Create</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{form.id ? 'Edit Employee' : 'Create Employee'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input id="firstName" placeholder="Enter first name" value={form.first_name} onChange={(e)=>setForm({...form, first_name: e.target.value})} />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input id="lastName" placeholder="Enter last name" value={form.last_name} onChange={(e)=>setForm({...form, last_name: e.target.value})} />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone *</Label>
                        <Input id="phone" placeholder="Enter phone number" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input id="email" type="email" placeholder="Enter email address" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
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
                      <div>
                        <Label htmlFor="department">Department *</Label>
                        <Select value={form.department_id} onValueChange={(v)=>setForm({...form, department_id: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose Department" />
                          </SelectTrigger>
                          <SelectContent>
                            {(departmentsData?.data || []).map((d:any)=> (
                              <SelectItem key={d.id} value={String(d.id)}>{d.department || d.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="designation">Designation *</Label>
                        <Input id="designation" placeholder="Enter designation" value={form.designation} onChange={(e)=>setForm({...form, designation: e.target.value})} />
                      </div>
                      <div>
                        <Label htmlFor="shift">Office Shift *</Label>
                        <Select value={form.shift_id} onValueChange={(v)=>setForm({...form, shift_id: v})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose Office Shift" />
                          </SelectTrigger>
                          <SelectContent>
                            {(shiftsData?.data || []).map((s:any)=> (
                              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
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
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="text-left p-4 font-medium">First Name</th>
                  <th className="text-left p-4 font-medium">Last Name</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">Company</th>
                  <th className="text-left p-4 font-medium">Department</th>
                  <th className="text-left p-4 font-medium">Designation</th>
                  <th className="text-left p-4 font-medium">Office Shift</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">Loading...</td>
                  </tr>
                ) : (data?.data || []).length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">No data for table</td>
                  </tr>
                ) : (
                  (data?.data || []).map((emp:any) => (
                    <tr key={emp.id} className="border-b hover:bg-gray-50">
                      <td className="p-4"><input type="checkbox" className="rounded" /></td>
                      <td className="p-4">{emp.first_name || emp.firstName || '-'}</td>
                      <td className="p-4">{emp.last_name || emp.lastName || '-'}</td>
                      <td className="p-4">{emp.phone || '-'}</td>
                      <td className="p-4">{emp.company || emp.company_name || '-'}</td>
                      <td className="p-4">{emp.department || '-'}</td>
                      <td className="p-4">{emp.designation || '-'}</td>
                      <td className="p-4">{emp.shift || emp.office_shift || '-'}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={()=>openEdit(emp)}>Edit</Button>
                          <Button variant="ghost" size="sm" onClick={()=>handleDelete(emp.id)} disabled={isDeleting}>Delete</Button>
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
