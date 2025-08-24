"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Edit, Trash2 } from "lucide-react"
import { useGetCompaniesQuery, useCreateCompanyMutation, useUpdateCompanyMutation, useDeleteCompanyMutation } from "@/lib/slices/hrmCatalogApi"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function Company() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useGetCompaniesQuery({ page, limit, search })
  const [createCompany, { isLoading: isCreating }] = useCreateCompanyMutation()
  const [updateCompany, { isLoading: isUpdating }] = useUpdateCompanyMutation()
  const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyMutation()
  const [form, setForm] = useState({ id: "", name: "", phone: "", country: "", email: "" })

  const openCreate = () => {
    setForm({ id: "", name: "", phone: "", country: "", email: "" })
    setIsCreateOpen(true)
  }

  const openEdit = (company: any) => {
    setForm({ id: String(company.id), name: company.name || "", phone: company.phone || "", country: company.country || "", email: company.email || "" })
    setIsCreateOpen(true)
  }

  const handleSubmit = async () => {
    if (form.id) {
      await updateCompany(form as any).unwrap()
    } else {
      const { id, ...payload } = form
      await createCompany(payload as any).unwrap()
    }
    setIsCreateOpen(false)
  }

  const handleDelete = async (id: string) => {
    await deleteCompany(id).unwrap()
  }

  const handleExportPDF = () => {
    const rows = (data?.data || []).map((c:any)=> [c.name, c.phone, c.country, c.email])
    const doc = new jsPDF()
    doc.text('Companies', 14, 16)
    autoTable(doc, { head: [["Name","Phone","Country","Email"]], body: rows, startY: 20 })
    doc.save('companies.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet((data?.data || []).map((c:any)=> ({ Name: c.name, Phone: c.phone, Country: c.country, Email: c.email })))
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies')
    XLSX.writeFile(workbook, 'companies.xlsx')
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>HRM</span>
            <span>|</span>
            <span>Company</span>
          </div>
          <h1 className="text-2xl font-bold">Company</h1>
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
                    <DialogTitle>{form.id ? 'Edit Company' : 'Create Company'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Company Name *</Label>
                      <Input id="name" placeholder="Enter company name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" placeholder="Enter phone number" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input id="country" placeholder="Enter country" value={form.country} onChange={(e)=>setForm({...form, country: e.target.value})} />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="Enter email address" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} />
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
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">Country</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">Loading...</td></tr>
                ) : (data?.data || []).length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No data for table</td></tr>
                ) : ((data?.data || []).map((company:any) => (
                  <tr key={company.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-4">{company.name}</td>
                    <td className="p-4">{company.phone}</td>
                    <td className="p-4">{company.country}</td>
                    <td className="p-4">{company.email}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={()=>openEdit(company)}>
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={()=>handleDelete(company.id)} disabled={isDeleting}>
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
