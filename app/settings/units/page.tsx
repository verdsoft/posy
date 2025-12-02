"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2, FileDown, Plus } from "lucide-react"
import type React from "react"
import {
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
  type Unit
} from "@/lib/slices/unitsApi"
import { toast } from "sonner"
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function Units() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [form, setForm] = useState({ name: "", short_name: "", base_unit: "-", operator: "*", operation_value: 1 })
  const [editId, setEditId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // RTK Query hooks
  const { data: units = [], isLoading: loading } = useGetUnitsQuery()
  const [createUnit, { isLoading: isCreating }] = useCreateUnitMutation()
  const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation()
  const [deleteUnit, { isLoading: isDeleting }] = useDeleteUnitMutation()

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [id]: type === "number" ? Number(value) : value,
    }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Helper to safely trim or fallback to empty string
  const safeTrim = (val: unknown) =>
    typeof val === "string" ? val.trim() : ""

  const handleCreate = async () => {
    const payload = {
      name: safeTrim(form.name),
      short_name: safeTrim(form.short_name),
      base_unit: safeTrim(form.base_unit) || "-",
      operator: safeTrim(form.operator) || "*",
      operation_value: Number(form.operation_value) || 1,
    }
    if (!payload.name || !payload.short_name || !payload.operator) {
      toast.error("Please fill all required fields.")
      return
    }
    try {
      await createUnit(payload).unwrap()
      setIsCreateOpen(false)
      setForm({ name: "", short_name: "", base_unit: "-", operator: "*", operation_value: 1 })
      toast.success("Unit created successfully")
    } catch (error :unknown) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("Error creating unit:", error)
      toast.error(message)
    }
  }

  const openEdit = (unit: Unit) => {
    setEditId(unit.id)
    setForm({
      name: unit.name ?? "",
      short_name: unit.short_name ?? "",
      base_unit: unit.base_unit ?? "-",
      operator: unit.operator ?? "*",
      operation_value: unit.operation_value ?? 1,
    })
    setIsEditOpen(true)
  }

  const handleEdit = async () => {
    if (!editId) return
    const payload = {
      id: editId,
      name: safeTrim(form.name),
      short_name: safeTrim(form.short_name),
      base_unit: safeTrim(form.base_unit) || "-",
      operator: safeTrim(form.operator) || "*",
      operation_value: Number(form.operation_value) || 1,
    }
    if (!payload.name || !payload.short_name || !payload.operator) {
      toast.error("Please fill all required fields.")
      return
    }
    try {
      await updateUnit(payload).unwrap()
      setIsEditOpen(false)
      setEditId(null)
      setForm({ name: "", short_name: "", base_unit: "-", operator: "*", operation_value: 1 })
      toast.success("Unit updated successfully")
    } catch (error) {
      console.error("Error updating unit:", error)
      toast.error("Failed to update unit")
    }
  }

  const openDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return
    try {
      await deleteUnit(deleteId).unwrap()
      setIsDeleteOpen(false)
      setDeleteId(null)
      toast.success("Unit deleted successfully")
    } catch (error) {
      console.error("Error deleting unit:", error)
      toast.error("Failed to delete unit")
    }
  }

  // PDF Export functionality
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()
      
      doc.text('Units List', 14, 16)
      
      const tableData = filteredUnits.map(unit => [
        unit.id,
        unit.name || "-",
        unit.short_name || "-",
        unit.base_unit || "-",
        unit.operator || "-",
        unit.operation_value || "-"
      ])
      
      autoTable(doc, {
        head: [['ID', 'Name', 'Short Name', 'Base Unit', 'Operator', 'Operation Value']],
        body: tableData,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [26, 35, 126] }
      })
      
      doc.save(`units-${new Date().getTime()}.pdf`)
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
        filteredUnits.map(unit => ({
          ID: unit.id,
          'Name': unit.name || "-",
          'Short Name': unit.short_name || "-",
          'Base Unit': unit.base_unit || "-",
          'Operator': unit.operator || "-",
          'Operation Value': unit.operation_value || "-"
        }))
      )
      
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Units")
      XLSX.writeFile(workbook, `units-${new Date().getTime()}.xlsx`)
      toast.success("Excel file exported successfully")
    } catch (error) {
      console.error("Error generating Excel:", error)
      toast.error("Failed to export Excel file")
    }
  }

  const filteredUnits = (Array.isArray(units) ? units : []).filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.short_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.base_unit ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-4">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
            <span>Settings</span>
            <span>|</span>
            <span>Unit</span>
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
                    <DialogTitle className="text-sm">Create Unit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name" className="text-xs">Unit Name *</Label>
                      <Input 
                        id="name" 
                        value={form.name} 
                        onChange={handleFormChange} 
                        placeholder="Enter unit name" 
                        className="h-8 text-sm" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="short_name" className="text-xs">Short Name *</Label>
                      <Input 
                        id="short_name" 
                        value={form.short_name} 
                        onChange={handleFormChange} 
                        placeholder="Enter short name" 
                        className="h-8 text-sm" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="base_unit" className="text-xs">Base Unit</Label>
                      <Select value={form.base_unit} onValueChange={v => handleSelectChange("base_unit", v)}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Choose Base Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="-">None</SelectItem>
                          <SelectItem value="kg">Kilogram</SelectItem>
                          <SelectItem value="m">Meter</SelectItem>
                          <SelectItem value="l">Litre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="operator" className="text-xs">Operator *</Label>
                      <Select value={form.operator} onValueChange={v => handleSelectChange("operator", v)}>
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Choose Operator" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="*">*</SelectItem>
                          <SelectItem value="/">/</SelectItem>
                          <SelectItem value="+">+</SelectItem>
                          <SelectItem value="-">-</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="operation_value" className="text-xs">Operation Value *</Label>
                      <Input 
                        id="operation_value" 
                        type="number" 
                        value={form.operation_value} 
                        onChange={handleFormChange} 
                        placeholder="Enter operation value" 
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button 
                        className="bg-[#1a237e] hover:bg-purple-700 flex-1 h-8 text-xs" 
                        onClick={handleCreate}
                        disabled={!safeTrim(form.name) || !safeTrim(form.short_name) || !safeTrim(form.operator) || !form.operation_value || isCreating}
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
                  <th className="text-left p-2 font-medium">ID</th>
                  <th className="text-left p-2 font-medium">Name</th>
                  <th className="text-left p-2 font-medium">Short Name</th>
                  <th className="text-left p-2 font-medium">Base Unit</th>
                  <th className="text-left p-2 font-medium">Operator</th>
                  <th className="text-left p-2 font-medium">Operation Value</th>
                  <th className="text-left p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4 text-sm">Loading...</td>
                  </tr>
                ) : filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-4 text-sm">No units found.</td>
                  </tr>
                ) : (
                  filteredUnits.map((unit) => (
                    <tr key={unit.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <input type="checkbox" className="rounded scale-75" />
                      </td>
                      <td className="p-2">{unit.id}</td>
                      <td className="p-2">{unit.name}</td>
                      <td className="p-2">{unit.short_name}</td>
                      <td className="p-2">{unit.base_unit}</td>
                      <td className="p-2">{unit.operator}</td>
                      <td className="p-2">{unit.operation_value}</td>
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0" 
                            onClick={() => openEdit(unit)}
                          >
                            <Edit className="h-3 w-3 text-green-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0" 
                            onClick={() => openDelete(unit.id)}
                          >
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
              <span className="text-xs text-gray-600">
                {filteredUnits.length > 0
                  ? `1 - ${filteredUnits.length} of ${filteredUnits.length}`
                  : "0"}
              </span>
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
            <DialogTitle className="text-sm">Edit Unit</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="name" className="text-xs">Unit Name *</Label>
              <Input 
                id="name" 
                value={form.name} 
                onChange={handleFormChange} 
                placeholder="Enter unit name" 
                className="h-8 text-sm" 
              />
            </div>
            <div>
              <Label htmlFor="short_name" className="text-xs">Short Name *</Label>
              <Input 
                id="short_name" 
                value={form.short_name} 
                onChange={handleFormChange} 
                placeholder="Enter short name" 
                className="h-8 text-sm" 
              />
            </div>
            <div>
              <Label htmlFor="base_unit" className="text-xs">Base Unit</Label>
              <Select value={form.base_unit} onValueChange={v => handleSelectChange("base_unit", v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Choose Base Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">None</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="m">Meter</SelectItem>
                  <SelectItem value="l">Litre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="operator" className="text-xs">Operator *</Label>
              <Select value={form.operator} onValueChange={v => handleSelectChange("operator", v)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Choose Operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="*">*</SelectItem>
                  <SelectItem value="/">/</SelectItem>
                  <SelectItem value="+">+</SelectItem>
                  <SelectItem value="-">-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="operation_value" className="text-xs">Operation Value *</Label>
              <Input 
                id="operation_value" 
                type="number" 
                value={form.operation_value} 
                onChange={handleFormChange} 
                placeholder="Enter operation value" 
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-3">
              <Button 
                className="bg-[#1a237e] hover:bg-purple-700 flex-1 h-8 text-xs" 
                onClick={handleEdit}
                disabled={!safeTrim(form.name) || !safeTrim(form.short_name) || !safeTrim(form.operator) || !form.operation_value || isUpdating}
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
            <DialogTitle className="text-sm">Delete Unit</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm">
            Are you sure you want to delete this unit?
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