"use client"

import type React from "react"
import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, FileDown, Plus } from "lucide-react"

import { TableActions } from "@/components/ui/table-actions"
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category
} from "@/lib/slices/categoriesApi"
import { toast } from "sonner"
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function Categories() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [form, setForm] = useState({ code: "", name: "" })
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  // RTK Query hooks
  const { data: categories = [], isLoading: loading, error } = useGetCategoriesQuery()
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation()

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
      await createCategory(form).unwrap()
      setIsCreateOpen(false)
      setForm({ code: "", name: "" })
      toast.success("Category created successfully")
    } catch (error: any) {
      console.error("Error creating category:", error)
      const message = error?.data?.error || "Failed to create category"
      toast.error(message)
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
      if (!editId) return
      await updateCategory({ id: editId, ...form }).unwrap()
      setIsEditOpen(false)
      setEditId(null)
      setForm({ code: "", name: "" })
      toast.success("Category updated successfully")
    } catch (error: any) {
      console.error("Error updating category:", error)
      const message = error?.data?.error || "Failed to update category"
      toast.error(message)
    }
  }

  // Open delete dialog
  const openDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  // Delete category
  const handleDeleteConfirmed = async () => {
    if (!deleteId) return

    try {
      await deleteCategory(deleteId).unwrap()
      setIsDeleteOpen(false)
      setDeleteId(null)
      toast.success("Category deleted successfully")
    } catch (error) {
      console.error("Error deleting category:", error)
      toast.error("Failed to delete category")
    }
  }

  // PDF Export functionality
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()

      // Add title
      doc.text('Categories List', 14, 16)

      // Prepare table data
      const tableData = filteredCategories.map(category => [
        category.id,
        category.code || "-",
        category.name || "-"
      ])

      // Add table using autoTable as separate function
      autoTable(doc, {
        head: [['ID', 'Category Code', 'Category Name']],
        body: tableData,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [26, 35, 126] }
      })

      // Save the PDF
      doc.save(`categories-${new Date().getTime()}.pdf`)
      toast.success("PDF exported successfully")
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.error("Failed to export PDF")
    }
  }

  // Excel Export functionality
  const handleExportExcel = () => {
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        filteredCategories.map(category => ({
          ID: category.id,
          'Category Code': category.code || "-",
          'Category Name': category.name || "-"
        }))
      )

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Categories")
      XLSX.writeFile(workbook, `categories-${new Date().getTime()}.xlsx`)
      toast.success("Excel file exported successfully")
    } catch (error) {
      console.error("Error generating Excel:", error)
      toast.error("Failed to export Excel file")
    }
  }

  const filteredCategories = (Array.isArray(categories) ? categories : []).filter(
    (cat) =>
      cat.code.toLowerCase().includes(search.toLowerCase()) ||
      cat.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Settings</span>
            <span>|</span>
            <span>Categories</span>
          </div>
          {/* <h1 className="text-xl font-semibold">Categories</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  className="w-full md:w-64 h-8 text-sm pl-8"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs flex-1 md:flex-none"
                onClick={handleExportPDF}
              >
                <FileDown className="h-3 w-3 mr-1" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs flex-1 md:flex-none"
                onClick={handleExportExcel}
              >
                <FileDown className="h-3 w-3 mr-1" />
                Excel
              </Button>
              {/* Create Dialog */}
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1a237e] hover:bg-blue-700 h-8 px-3 text-xs flex-1 md:flex-none">
                    <Plus className="h-3 w-3 mr-1" />
                    Create Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-sm">Create Category</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="code" className="text-xs">Category Code *</Label>
                      <Input
                        id="code"
                        value={form.code}
                        onChange={handleFormChange}
                        placeholder="Enter category code"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name" className="text-xs">Category Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="Enter category name"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button
                        className="bg-[#1a237e] hover:bg-purple-700 flex-1 h-8 text-xs"
                        onClick={handleCreate}
                        disabled={isCreating}
                      >
                        {isCreating ? "Creating..." : "Submit"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateOpen(false)}
                        className="flex-1 h-8 text-xs"
                      >
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
                  <th className="text-left p-2 font-medium">Category Code</th>
                  <th className="text-left p-2 font-medium">Category Name</th>
                  <th className="text-right p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-muted-foreground">Loading...</td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-muted-foreground">No categories found.</td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2">
                        <input type="checkbox" className="rounded scale-75" />
                      </td>
                      <td className="p-2">{category.code}</td>
                      <td className="p-2 font-medium">{category.name}</td>
                      <td className="p-2 text-right">
                        <TableActions
                          onEdit={() => openEdit(category)}
                          onDelete={() => openDelete(category.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-3 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              Showing {filteredCategories.length > 0 ? `1 to ${filteredCategories.length}` : "0"} of {filteredCategories.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs" disabled>
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="code" className="text-xs">Category Code *</Label>
              <Input
                id="code"
                value={form.code}
                onChange={handleFormChange}
                placeholder="Enter category code"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-xs">Category Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Enter category name"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-3">
              <Button
                className="bg-[#1a237e] hover:bg-purple-700 flex-1 h-8 text-xs"
                onClick={handleEdit}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditOpen(false)}
                className="flex-1 h-8 text-xs"
              >
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
            <DialogTitle className="text-sm">Delete Category</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm">
            Are you sure you want to delete this category?
          </div>
          <div className="flex gap-2 pt-3">
            <Button
              className="bg-red-600 hover:bg-red-700 flex-1 h-8 text-xs"
              onClick={handleDeleteConfirmed}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 h-8 text-xs"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}