"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Edit, Trash2, FileDown, Plus } from "lucide-react"
import type React from "react"
import {
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  type Warehouse
} from "@/lib/slices/warehousesApi"
import { toast } from "sonner"

export default function Warehouses() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "", country: "", city: "", email: "", zip_code: "" })
  const [editId, setEditId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // RTK Query hooks
  const { data: warehouses = [], isLoading: loading } = useGetWarehousesQuery()
  const [createWarehouse, { isLoading: isCreating }] = useCreateWarehouseMutation()
  const [updateWarehouse, { isLoading: isUpdating }] = useUpdateWarehouseMutation()
  const [deleteWarehouse, { isLoading: isDeleting }] = useDeleteWarehouseMutation()

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const openDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return
    try {
      await deleteWarehouse(deleteId).unwrap()
      setIsDeleteOpen(false)
      setDeleteId(null)
      toast.success("Warehouse deleted successfully")
    } catch (error) {
      console.error("Error deleting warehouse:", error)
      toast.error("Failed to delete warehouse")
    }
  }

  const handleCreate = async () => {
    try {
      await createWarehouse(form).unwrap()
      setIsCreateOpen(false)
      setForm({ name: "", phone: "", country: "", city: "", email: "", zip_code: "" })
      toast.success("Warehouse created successfully")
    } catch (error) {
      console.error("Error creating warehouse:", error)
      toast.error("Failed to create warehouse")
    }
  }

  const openEdit = (warehouse: Warehouse) => {
    setEditId(warehouse.id)
    setForm({
      name: warehouse.name ?? "",
      phone: warehouse.phone ?? "",
      country: warehouse.country ?? "",
      city: warehouse.city ?? "",
      email: warehouse.email ?? "",
      zip_code: warehouse.zip_code ?? "",
    })
    setIsEditOpen(true)
  }

  const handleEdit = async () => {
    try {
      if (!editId) return
      await updateWarehouse({ id: editId, ...form }).unwrap()
      setIsEditOpen(false)
      setEditId(null)
      setForm({ name: "", phone: "", country: "", city: "", email: "", zip_code: "" })
      toast.success("Warehouse updated successfully")
    } catch (error) {
      console.error("Error updating warehouse:", error)
      toast.error("Failed to update warehouse")
    }
  }

  // Export functions
  const handleExportPDF = () => {
    // PDF export logic here
    toast.success("Exporting to PDF...")
    console.log("Exporting to PDF:", filteredWarehouses)
  }

  const handleExportExcel = () => {
    // Excel export logic here
    toast.success("Exporting to Excel...")
    console.log("Exporting to Excel:", filteredWarehouses)
  }

  const filteredWarehouses = (Array.isArray(warehouses) ? warehouses : []).filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.phone.toLowerCase().includes(search.toLowerCase()) ||
      w.country.toLowerCase().includes(search.toLowerCase()) ||
      w.city.toLowerCase().includes(search.toLowerCase()) ||
      w.email.toLowerCase().includes(search.toLowerCase()) ||
      (w.zip_code ? w.zip_code.toLowerCase().includes(search.toLowerCase()) : false)
  )

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
            <span>Settings</span>
            <span>|</span>
            <span>Warehouse</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-3 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400" />
                <Input
                  placeholder="Search this table"
                  className="w-48 h-8 text-sm pl-7"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={handleExportPDF}
              >
                <FileDown className="h-3 w-3 mr-1" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={handleExportExcel}
              >
                <FileDown className="h-3 w-3 mr-1" />
                EXCEL
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1a237e] hover:bg-purple-700 h-8 px-2 text-xs">
                    <Plus className="h-3 w-3 mr-1" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-sm">Create Warehouse</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="text-xs">Warehouse Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter warehouse name" className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-xs">Phone *</Label>
                      <Input id="phone" value={form.phone} onChange={handleFormChange} placeholder="Enter phone number" className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="country" className="text-xs">Country *</Label>
                      <Input id="country" value={form.country} onChange={handleFormChange} placeholder="Enter country" className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="city" className="text-xs">City *</Label>
                      <Input id="city" value={form.city} onChange={handleFormChange} placeholder="Enter city" className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs">Email *</Label>
                      <Input id="email" type="email" value={form.email} onChange={handleFormChange} placeholder="Enter email address" className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label htmlFor="zip_code" className="text-xs">Zip Code</Label>
                      <Input id="zip_code" value={form.zip_code} onChange={handleFormChange} placeholder="Enter zip code" className="h-8 text-sm" />
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button className="bg-[#1a237e] hover:bg-purple-700 flex-1 h-8 text-xs" onClick={handleCreate}>
                        Submit
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1 h-8 text-xs">
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
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 font-medium">
                    <input type="checkbox" className="rounded scale-75" />
                  </th>
                  <th className="text-left p-2 font-medium">Name</th>
                  <th className="text-left p-2 font-medium">Phone</th>
                  <th className="text-left p-2 font-medium">Country</th>
                  <th className="text-left p-2 font-medium">City</th>
                  <th className="text-left p-2 font-medium">Email</th>
                  <th className="text-left p-2 font-medium">Zip Code</th>
                  <th className="text-left p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4 text-sm">Loading...</td>
                  </tr>
                ) : filteredWarehouses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4 text-sm">No warehouses found.</td>
                  </tr>
                ) : (
                  filteredWarehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <input type="checkbox" className="rounded scale-75" />
                      </td>
                      <td className="p-2">{warehouse.name}</td>
                      <td className="p-2">{warehouse.phone}</td>
                      <td className="p-2">{warehouse.country}</td>
                      <td className="p-2">{warehouse.city}</td>
                      <td className="p-2">{warehouse.email}</td>
                      <td className="p-2">{warehouse.zip_code}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEdit(warehouse)}>
                            <Edit className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openDelete(warehouse.id)}>
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t flex items-center justify-between">
            <div className="text-xs text-gray-600">Rows per page: 10</div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600">1 - {filteredWarehouses.length} of {filteredWarehouses.length}</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
                  prev
                </Button>
                <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
                  next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Warehouse</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-xs">Warehouse Name *</Label>
              <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter warehouse name" className="h-8 text-sm" />
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs">Phone *</Label>
              <Input id="phone" value={form.phone} onChange={handleFormChange} placeholder="Enter phone number" className="h-8 text-sm" />
            </div>
            <div>
              <Label htmlFor="country" className="text-xs">Country *</Label>
              <Input id="country" value={form.country} onChange={handleFormChange} placeholder="Enter country" className="h-8 text-sm" />
            </div>
            <div>
              <Label htmlFor="city" className="text-xs">City *</Label>
              <Input id="city" value={form.city} onChange={handleFormChange} placeholder="Enter city" className="h-8 text-sm" />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs">Email *</Label>
              <Input id="email" type="email" value={form.email} onChange={handleFormChange} placeholder="Enter email address" className="h-8 text-sm" />
            </div>
            <div>
              <Label htmlFor="zip_code" className="text-xs">Zip Code</Label>
              <Input id="zip_code" value={form.zip_code} onChange={handleFormChange} placeholder="Enter zip code" className="h-8 text-sm" />
            </div>
            <div className="flex gap-2 pt-3">
              <Button className="bg-[#1a237e] hover:bg-purple-700 flex-1 h-8 text-xs" onClick={handleEdit}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1 h-8 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Delete Warehouse</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm">
            Are you sure you want to delete this warehouse?
          </div>
          <div className="flex gap-2 pt-3">
            <Button className="bg-red-600 hover:bg-red-700 flex-1 h-8 text-xs" onClick={handleDeleteConfirmed}>
              Delete
            </Button>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1 h-8 text-xs">
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}