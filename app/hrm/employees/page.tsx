"use client"

import { useState } from "react"
import { useGetEmployeesQuery, useCreateEmployeeMutation, useUpdateEmployeeMutation, useDeleteEmployeeMutation } from "@/lib/slices/hrmV2Api"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileDown } from "lucide-react"
import * as XLSX from 'xlsx'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useGetCompaniesQuery, useGetDepartmentsQuery, useGetShiftsQuery, useGetOrganizationQuery } from "@/lib/slices/hrmV2Api"
import { generatePDF } from "@/lib/utils/pdf-generator"

export default function Employees() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetEmployeesQuery({ page, limit, search })
  const { data: companiesData } = useGetCompaniesQuery({ page: 1, limit: 100 })
  const { data: departmentsData } = useGetDepartmentsQuery({ page: 1, limit: 100 })
  const { data: shiftsData } = useGetShiftsQuery({ page: 1, limit: 100 })
  const { data: orgData } = useGetOrganizationQuery()

  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation()
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation()
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation()
  const [form, setForm] = useState({
    id: "",
    employee_id: "",
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
    setForm({ id: "", employee_id: "", first_name: "", last_name: "", email: "", phone: "", company_id: "", department_id: "", designation: "", shift_id: "" })
    setIsCreateOpen(true)
  }

  const openEdit = (emp: any) => {
    const [first, ...last] = (emp.name || "").split(" ")
    setForm({
      id: emp.id,
      employee_id: String(emp.employee_id || ""),
      first_name: first || "",
      last_name: last.join(" ") || "",
      email: emp.email || "",
      phone: emp.phone || "",
      company_id: String(emp.departments?.companies?.id || ""),
      department_id: String(emp.department_id || ""),
      designation: emp.position || "",
      shift_id: String(emp.shift_id || ""),
    })
    setIsCreateOpen(true)
  }

  const handleSubmit = async () => {
    const payload = {
      ...form,
      name: `${form.first_name} ${form.last_name}`.trim(),
      position: form.designation,
      employee_id: parseInt(form.employee_id) || 0,
      // company_id: parseInt(form.company_id) || 0,
      department_id: parseInt(form.department_id) || 0,
      shift_id: parseInt(form.shift_id) || 0,
    }
    if (form.id) {
      await updateEmployee(payload as any).unwrap()
    } else {
      const { id, ...rest } = payload
      await createEmployee(rest as any).unwrap()
    }
    setIsCreateOpen(false)
  }

  const handleDelete = async (id: string) => {
    await deleteEmployee(parseInt(id)).unwrap()
  }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((e: any) => [
      e.first_name || e.firstName || '-',
      e.last_name || e.lastName || '-',
      e.phone || '-',
      e.company || e.company_name || '-',
      e.department || '-',
      e.designation || '-',
      e.shift || e.office_shift || '-',
    ])
    generatePDF({
      title: 'Employees List',
      columns: ["First Name", "Last Name", "Phone", "Company", "Department", "Designation", "Shift"],
      rows: rows,
      organization: orgData,
      filename: 'employees.pdf'
    })
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      (data?.data || []).map((e: any) => ({
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
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>HRM</span>
            <span>|</span>
            <span>Employees</span>
          </div>
          {/* <h1 className="text-xl font-semibold">Employees</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  className="w-full md:w-64 h-8 text-sm pl-8"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              {/* <Button variant="outline" size="sm" className="h-8 px-2 text-xs flex-1 md:flex-none">
                <Filter className="h-3 w-3 mr-1" />
                Filter
              </Button> */}
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-8 px-2 text-xs flex-1 md:flex-none">
                <FileDown className="h-3 w-3 mr-1" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel} className="h-8 px-2 text-xs flex-1 md:flex-none">
                <FileDown className="h-3 w-3 mr-1" />
                Excel
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none" onClick={openCreate}>Create Employee</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>{form.id ? 'Edit Employee' : 'Create Employee'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="employeeId">Employee ID *</Label>
                        <Input id="employeeId" placeholder="Enter employee ID" value={form.employee_id} onChange={(e) => setForm({ ...form, employee_id: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" placeholder="Enter first name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" placeholder="Enter last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" placeholder="Enter phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="Enter email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="company">Company *</Label>
                      <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Company" />
                        </SelectTrigger>
                        <SelectContent>
                          {(companiesData?.data || []).map((c: any) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select value={form.department_id} onValueChange={(v) => setForm({ ...form, department_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {(departmentsData?.data || []).map((d: any) => (
                            <SelectItem key={d.id} value={String(d.id)}>{d.department || d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="designation">Designation *</Label>
                      <Input id="designation" placeholder="Enter designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="shift">Office Shift *</Label>
                      <Select value={form.shift_id} onValueChange={(v) => setForm({ ...form, shift_id: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose Office Shift" />
                        </SelectTrigger>
                        <SelectContent>
                          {(shiftsData?.data || []).map((s: any) => (
                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                          ))}
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] p-2">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead className="p-2">First Name</TableHead>
                <TableHead className="p-2">Last Name</TableHead>
                <TableHead className="p-2">Phone</TableHead>
                <TableHead className="p-2">Company</TableHead>
                <TableHead className="p-2">Department</TableHead>
                <TableHead className="p-2">Designation</TableHead>
                <TableHead className="p-2">Office Shift</TableHead>
                <TableHead className="p-2">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">Loading...</TableCell>
                </TableRow>
              ) : (data?.data || []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">No data for table</TableCell>
                </TableRow>
              ) : (
                (data?.data || []).map((emp: any) => (
                  <TableRow key={emp.id} className="border-b hover:bg-gray-50">
                    <TableCell className="p-2"><input type="checkbox" className="rounded" /></TableCell>
                    <TableCell className="p-2">{emp.name?.split(' ')[0] || '-'}</TableCell>
                    <TableCell className="p-2">{emp.name?.split(' ').slice(1).join(' ') || '-'}</TableCell>
                    <TableCell className="p-2">{emp.phone || '-'}</TableCell>
                    <TableCell className="p-2">{emp.departments?.companies?.name || '-'}</TableCell>
                    <TableCell className="p-2">{emp.departments?.name || emp.department || '-'}</TableCell>
                    <TableCell className="p-2">{emp.position || emp.designation || '-'}</TableCell>
                    <TableCell className="p-2">{emp.office_shifts?.name || emp.shift || '-'}</TableCell>
                    <TableCell className="p-2">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(emp)}>Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(emp.id)} disabled={isDeleting}>Delete</Button>
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
                  <Button
                    key={p}
                    variant={page === p ? "default" : "ghost"}
                    size="sm"
                    className={`h-7 w-7 text-xs p-0 ${page === p ? "bg-[#1a237e] hover:bg-purple-700" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                )
              })}
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled={page >= (data?.pagination?.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
