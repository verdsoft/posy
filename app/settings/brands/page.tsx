"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, ImageIcon, FileDown, Plus } from "lucide-react"
import type React from "react"
import { TableActions } from "@/components/ui/table-actions"
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  type Brand
} from "@/lib/slices/brandsApi"
import { toast } from "sonner"
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

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
    } catch (error: any) {
      console.error("Error creating brand:", error)
      const message = error?.data?.error || "Failed to create brand"
      toast.error(message)
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
    } catch (error: any) {
      console.error("Error updating brand:", error)
      const message = error?.data?.error || "Failed to update brand"
      toast.error(message)
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

  // PDF Export functionality
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()

      doc.text('Brands List', 14, 16)

      const tableData = filteredBrands.map(brand => [
        brand.id,
        brand.name || "-",
        brand.description || "-"
      ])

      autoTable(doc, {
        head: [['ID', 'Brand Name', 'Brand Description']],
        body: tableData,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [26, 35, 126] }
      })

      doc.save(`brands-${new Date().getTime()}.pdf`)
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
        filteredBrands.map(brand => ({
          ID: brand.id,
          'Brand Name': brand.name || "-",
          'Brand Description': brand.description || "-"
        }))
      )

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Brands")
      XLSX.writeFile(workbook, `brands-${new Date().getTime()}.xlsx`)
      toast.success("Excel file exported successfully")
    } catch (error) {
      console.error("Error generating Excel:", error)
      toast.error("Failed to export Excel file")
    }
  }

  const filteredBrands = (Array.isArray(brands) ? brands : []).filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Settings</span>
            <span>|</span>
            <span>Brands</span>
          </div>
          {/* <h1 className="text-xl font-semibold">Brands</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search brands..."
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
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none">
                    <Plus className="h-3 w-3 mr-1" />
                    Create Brand
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-sm">Create Brand</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="text-xs">Brand Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="Enter brand name"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-xs">Brand Description</Label>
                      <Textarea
                        id="description"
                        value={form.description}
                        onChange={handleFormChange}
                        placeholder="Enter brand description"
                        rows={3}
                        className="text-sm"
                      />
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button
                        className="bg-[#1a237e] hover:bg-purple-700 flex-1 h-8 text-xs"
                        onClick={handleCreate}
                        disabled={!form.name.trim() || isCreating}
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
                  <th className="text-left p-2 font-medium">Brand Name</th>
                  <th className="text-left p-2 font-medium">Description</th>
                  <th className="text-right p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-muted-foreground">Loading...</td>
                  </tr>
                ) : filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-muted-foreground">No brands found.</td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => (
                    <tr key={brand.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2">
                        <input type="checkbox" className="rounded scale-75" />
                      </td>
                      <td className="p-2 font-medium flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        {brand.name}
                      </td>
                      <td className="p-2 text-muted-foreground">{brand.description || '-'}</td>
                      <td className="p-2 text-right">
                        <TableActions
                          onEdit={() => openEdit(brand)}
                          onDelete={() => openDelete(brand.id)}
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
              Showing {filteredBrands.length > 0 ? `1 to ${filteredBrands.length}` : "0"} of {filteredBrands.length} entries
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
            <DialogTitle className="text-sm">Edit Brand</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-xs">Brand Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Enter brand name"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-xs">Brand Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Enter brand description"
                rows={3}
                className="text-sm"
              />
            </div>
            <div className="flex gap-2 pt-3">
              <Button
                className="bg-[#1a237e] hover:bg-purple-700 flex-1 h-8 text-xs"
                onClick={handleEdit}
                disabled={!form.name.trim() || isUpdating}
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
            <DialogTitle className="text-sm">Delete Brand</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm">
            Are you sure you want to delete this brand?
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