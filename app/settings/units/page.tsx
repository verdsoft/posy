"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Edit, Trash2 } from "lucide-react"

type Unit = {
  id: number
  name: string
  short_name: string
  base_unit: string
  operator: string
  operation_value: number
}

export default function Units() {
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [form, setForm] = useState({ name: "", short_name: "", base_unit: "-", operator: "*", operation_value: 1 })
  const [editId, setEditId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const fetchUnits = async () => {
    setLoading(true)
    const res = await fetch("/api/settings/units")
    const data = await res.json()
    setUnits(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchUnits()
  }, [])

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
      alert("Please fill all required fields.")
      return
    }
    const res = await fetch("/api/settings/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      await fetchUnits()
      setIsCreateOpen(false)
      setForm({ name: "", short_name: "", base_unit: "-", operator: "*", operation_value: 1 })
    } else {
      alert("Failed to create unit")
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
    const payload = {
      id: editId,
      name: safeTrim(form.name),
      short_name: safeTrim(form.short_name),
      base_unit: safeTrim(form.base_unit) || "-",
      operator: safeTrim(form.operator) || "*",
      operation_value: Number(form.operation_value) || 1,
    }
    if (!payload.name || !payload.short_name || !payload.operator) {
      alert("Please fill all required fields.")
      return
    }
    const res = await fetch("/api/settings/units", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    if (res.ok) {
      await fetchUnits()
      setIsEditOpen(false)
      setEditId(null)
      setForm({ name: "", short_name: "", base_unit: "-", operator: "*", operation_value: 1 })
    } else {
      alert("Failed to update unit")
    }
  }

  const openDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return
    const res = await fetch("/api/settings/units", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    })
    if (res.ok) {
      await fetchUnits()
      setIsDeleteOpen(false)
      setDeleteId(null)
    } else {
      alert("Failed to delete unit")
    }
  }

  const filteredUnits = units.filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.short_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.base_unit ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Settings</span>
            <span>|</span>
            <span>Unit</span>
          </div>
          <h1 className="text-2xl font-bold">Unit</h1>
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
                  <Button className="bg-purple-600 hover:bg-purple-700">Create</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Unit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Unit Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter unit name" />
                    </div>
                    <div>
                      <Label htmlFor="short_name">Short Name *</Label>
                      <Input id="short_name" value={form.short_name} onChange={handleFormChange} placeholder="Enter short name" />
                    </div>
                    <div>
                      <Label htmlFor="base_unit">Base Unit</Label>
                      <Select value={form.base_unit} onValueChange={v => handleSelectChange("base_unit", v)}>
                        <SelectTrigger>
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
                      <Label htmlFor="operator">Operator *</Label>
                      <Select value={form.operator} onValueChange={v => handleSelectChange("operator", v)}>
                        <SelectTrigger>
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
                      <Label htmlFor="operation_value">Operation Value *</Label>
                      <Input id="operation_value" type="number" value={form.operation_value} onChange={handleFormChange} placeholder="Enter operation value" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-purple-600 hover:bg-purple-700 flex-1" onClick={handleCreate}
                        disabled={!safeTrim(form.name) || !safeTrim(form.short_name) || !safeTrim(form.operator) || !form.operation_value}>
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
                    <DialogTitle>Edit Unit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Unit Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter unit name" />
                    </div>
                    <div>
                      <Label htmlFor="short_name">Short Name *</Label>
                      <Input id="short_name" value={form.short_name} onChange={handleFormChange} placeholder="Enter short name" />
                    </div>
                    <div>
                      <Label htmlFor="base_unit">Base Unit</Label>
                      <Select value={form.base_unit} onValueChange={v => handleSelectChange("base_unit", v)}>
                        <SelectTrigger>
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
                      <Label htmlFor="operator">Operator *</Label>
                      <Select value={form.operator} onValueChange={v => handleSelectChange("operator", v)}>
                        <SelectTrigger>
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
                      <Label htmlFor="operation_value">Operation Value *</Label>
                      <Input id="operation_value" type="number" value={form.operation_value} onChange={handleFormChange} placeholder="Enter operation value" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-purple-600 hover:bg-purple-700 flex-1" onClick={handleEdit}
                        disabled={!safeTrim(form.name) || !safeTrim(form.short_name) || !safeTrim(form.operator) || !form.operation_value}>
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
                  <th className="text-left p-4 font-medium">Short Name</th>
                  <th className="text-left p-4 font-medium">Base Unit</th>
                  <th className="text-left p-4 font-medium">Operator</th>
                  <th className="text-left p-4 font-medium">Operation Value</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-400">
                      No units found.
                    </td>
                  </tr>
                )}
                {filteredUnits.map((unit) => (
                  <tr key={unit.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-4">{unit.name}</td>
                    <td className="p-4">{unit.short_name}</td>
                    <td className="p-4">{unit.base_unit}</td>
                    <td className="p-4">{unit.operator}</td>
                    <td className="p-4">{unit.operation_value}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(unit)}>
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDelete(unit.id)}>
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
                {filteredUnits.length > 0
                  ? `1 - ${filteredUnits.length} of ${filteredUnits.length}`
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
            <DialogTitle>Delete Unit</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this unit?
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