"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Edit, Trash2 } from "lucide-react"
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
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Settings</span>
            <span>|</span>
            <span>Warehouse</span>
          </div>
          <h1 className="text-2xl font-bold">Warehouse</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
               <Input
  placeholder="Search this table"
  className="pl-10"
  value={search}
  onChange={e => setSearch(e.target.value)}
/>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-hover text-white">Create</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Warehouse</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Warehouse Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter warehouse name" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" value={form.phone} onChange={handleFormChange} placeholder="Enter phone number" />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input id="country" value={form.country} onChange={handleFormChange} placeholder="Enter country" />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" value={form.city} onChange={handleFormChange} placeholder="Enter city" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={form.email} onChange={handleFormChange} placeholder="Enter email address" />
                    </div>
                    <div>
                      <Label htmlFor="zip_code">Zip Code</Label>
                      <Input id="zip_code" value={form.zip_code} onChange={handleFormChange} placeholder="Enter zip code" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-[#1a237e] hover:bg-purple-700 flex-1" onClick={handleCreate}>
                        Submit
                      </Button>
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Warehouse</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Warehouse Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter warehouse name" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone *</Label>
                      <Input id="phone" value={form.phone} onChange={handleFormChange} placeholder="Enter phone number" />
                    </div>
                    <div>
                      <Label htmlFor="country">Country *</Label>
                      <Input id="country" value={form.country} onChange={handleFormChange} placeholder="Enter country" />
                    </div>
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" value={form.city} onChange={handleFormChange} placeholder="Enter city" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={form.email} onChange={handleFormChange} placeholder="Enter email address" />
                    </div>
                    <div>
                      <Label htmlFor="zip_code">Zip Code</Label>
                      <Input id="zip_code" value={form.zip_code} onChange={handleFormChange} placeholder="Enter zip code" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-[#1a237e] hover:bg-purple-700 flex-1" onClick={handleEdit}>
                        Save
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">
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
                  <th className="text-left p-4 font-medium">City</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Zip Code</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
               {filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-4">{warehouse.name}</td>
                    <td className="p-4">{warehouse.phone}</td>
                    <td className="p-4">{warehouse.country}</td>
                    <td className="p-4">{warehouse.city}</td>
                    <td className="p-4">{warehouse.email}</td>
                    <td className="p-4">{warehouse.zip_code}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(warehouse)}>
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDelete(warehouse.id)}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">1 - 2 of 2</span>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" disabled>
                  prev
                </Button>
                <Button variant="outline" size="sm" disabled>
                  next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
  <DialogContent className="sm:max-w-md">
    <DialogHeader>
      <DialogTitle>Delete Warehouse</DialogTitle>
    </DialogHeader>
    <div className="py-4">
      Are you sure you want to delete this warehouse?
    </div>
    <div className="flex gap-2 pt-4">
      <Button className="bg-red-600 hover:bg-red-700 flex-1" onClick={handleDeleteConfirmed}>
        Delete
      </Button>
      <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1">
        Cancel
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </DashboardLayout>
  )
}
