"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Edit, Trash2, ImageIcon } from "lucide-react"
import type React from "react"
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  type Brand
} from "@/lib/slices/brandsApi"
import { toast } from "sonner"

export default function Brands() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [form, setForm] = useState({ name: "", description: "" })
  const [editId, setEditId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // RTK Query hooks
  const { data: brands = [], isLoading: loading } = useGetBrandsQuery()
  const [createBrand, { isLoading: isCreating }] = useCreateBrandMutation()
  const [updateBrand, { isLoading: isUpdating }] = useUpdateBrandMutation()
  const [deleteBrand, { isLoading: isDeleting }] = useDeleteBrandMutation()

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleCreate = async () => {
    try {
      await createBrand(form).unwrap()
      setIsCreateOpen(false)
      setForm({ name: "", description: "" })
      toast.success("Brand created successfully")
    } catch (error) {
      console.error("Error creating brand:", error)
      toast.error("Failed to create brand")
    }
  }

  const openEdit = (brand: Brand) => {
    setEditId(brand.id)
    setForm({ name: brand.name, description: brand.description })
    setIsEditOpen(true)
  }

  const handleEdit = async () => {
    try {
      if (!editId) return
      await updateBrand({ id: editId, ...form }).unwrap()
      setIsEditOpen(false)
      setEditId(null)
      setForm({ name: "", description: "" })
      toast.success("Brand updated successfully")
    } catch (error) {
      console.error("Error updating brand:", error)
      toast.error("Failed to update brand")
    }
  }

  const openDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return
    try {
      await deleteBrand(deleteId).unwrap()
      setIsDeleteOpen(false)
      setDeleteId(null)
      toast.success("Brand deleted successfully")
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast.error("Failed to delete brand")
    }
  }

  const filteredBrands = (Array.isArray(brands) ? brands : []).filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Settings</span>
            <span>|</span>
            <span>Brand</span>
          </div>
          <h1 className="text-2xl font-bold">Brand</h1>
        </div>

        <div className="bg-white rounded-lg shadow flat-ui">
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
                  <Button className="bg-[#1a237e] hover:bg-purple-700">Create</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Brand</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Brand Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter brand name" />
                    </div>
                    <div>
                      <Label htmlFor="description">Brand Description</Label>
                      <Textarea id="description" value={form.description} onChange={handleFormChange} placeholder="Enter brand description" rows={3} />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-[#1a237e] hover:bg-purple-700 flex-1" onClick={handleCreate} disabled={!form.name.trim()}>
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
                    <DialogTitle>Edit Brand</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Brand Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter brand name" />
                    </div>
                    <div>
                      <Label htmlFor="description">Brand Description</Label>
                      <Textarea id="description" value={form.description} onChange={handleFormChange} placeholder="Enter brand description" rows={3} />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-[#1a237e] hover:bg-purple-700 flex-1" onClick={handleEdit} disabled={!form.name.trim()}>
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
                  <th className="text-left p-4 font-medium">Brand Image</th>
                  <th className="text-left p-4 font-medium">Brand Name</th>
                  <th className="text-left p-4 font-medium">Brand Description</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBrands.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">
                      No brands found.
                    </td>
                  </tr>
                )}
                {filteredBrands.map((brand) => (
                  <tr key={brand.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-4">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    </td>
                    <td className="p-4">{brand.name}</td>
                    <td className="p-4">{brand.description}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(brand)}>
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDelete(brand.id)}>
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
              <span className="text-sm text-gray-600">
                {filteredBrands.length > 0
                  ? `1 - ${filteredBrands.length} of ${filteredBrands.length}`
                  : "0"}
              </span>
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
            <DialogTitle>Delete Brand</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this brand?
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