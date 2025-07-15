"use client"

import type React from "react"
import { useState, useEffect } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Edit, Trash2 } from "lucide-react"
import { fetchCategories } from "@/lib/api"
import { Category } from "@/lib/types"

export default function Categories() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ code: "", name: "" })
  const [editId, setEditId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  // Fetch categories
  const loadCategories = async () => {
    try {
      setLoading(true)
      const data = await fetchCategories()
      setCategories(data)
    } catch (error) {
      console.error("Failed to load categories:", error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  // Create category
  const handleCreate = async () => {
    try {
      const res = await fetch("/api/settings/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Failed to create category")
      
      await loadCategories() // Reload categories after creation
      setIsCreateOpen(false)
      setForm({ code: "", name: "" })
    } catch (error) {
      console.error("Error creating category:", error)
      alert("Failed to create category")
    }
  }

  // Open edit dialog
  const openEdit = (category: Category) => {
    setEditId(category.id)
    setForm({
      code: category.code ?? "",
      name: category.name ?? "",
    })
    setIsEditOpen(true)
  }

  // Update category
  const handleEdit = async () => {
    try {
      const res = await fetch("/api/settings/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editId }),
      })
      if (!res.ok) throw new Error("Failed to update category")
      
      await loadCategories() // Reload categories after update
      setIsEditOpen(false)
      setEditId(null)
      setForm({ code: "", name: "" })
    } catch (error) {
      console.error("Error updating category:", error)
      alert("Failed to update category")
    }
  }

  // Open delete dialog
  const openDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  // Delete category
  const handleDeleteConfirmed = async () => {
    if (!deleteId) return
    
    try {
      const res = await fetch("/api/settings/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId }),
      })
      if (!res.ok) throw new Error("Failed to delete category")
      
      await loadCategories() // Reload categories after deletion
      setIsDeleteOpen(false)
      setDeleteId(null)
    } catch (error) {
      console.error("Error deleting category:", error)
      alert("Failed to delete category")
    }
  }

  const filteredCategories = categories.filter(
    (cat) =>
      cat.code.toLowerCase().includes(search.toLowerCase()) ||
      cat.name.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Settings</span>
            <span>|</span>
            <span>Category</span>
          </div>
          <h1 className="text-2xl font-bold">Category</h1>
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

              {/* Create Dialog */}
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-700 hover:bg-purple-700">Create</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="code">Category Code *</Label>
                      <Input id="code" value={form.code} onChange={handleFormChange} placeholder="Enter category code" />
                    </div>
                    <div>
                      <Label htmlFor="name">Category Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter category name" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-purple-600 hover:bg-purple-700 flex-1" onClick={handleCreate}>Submit</Button>
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Dialog */}
              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="code">Category Code *</Label>
                      <Input id="code" value={form.code} onChange={handleFormChange} placeholder="Enter category code" />
                    </div>
                    <div>
                      <Label htmlFor="name">Category Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter category name" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-purple-600 hover:bg-purple-700 flex-1" onClick={handleEdit}>Save</Button>
                      <Button variant="outline" onClick={() => setIsEditOpen(false)} className="flex-1">Cancel</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              {/* Delete Dialog */}
              <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delete Category</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    Are you sure you want to delete this category?
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="bg-red-600 hover:bg-red-700 flex-1" onClick={handleDeleteConfirmed}>Delete</Button>
                    <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="flex-1">Cancel</Button>
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
                  <th className="text-left p-4 font-medium">Category Code</th>
                  <th className="text-left p-4 font-medium">Category Name</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center p-4">Loading...</td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-4">No categories found.</td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 pl-4">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="p-2">{category.code}</td>
                      <td className="p-2">{category.name}</td>
                      <td className="p-2">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDelete(category.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
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
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                1 - {categories.length} of {categories.length}
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
    </DashboardLayout>
  )
}