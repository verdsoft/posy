"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Edit, Trash2 } from "lucide-react"

type Currency = {
  id: number
  code: string
  name: string
  symbol: string
}

export default function Currencies() {
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [form, setForm] = useState({ code: "", name: "", symbol: "" })
  const [editId, setEditId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const fetchCurrencies = async () => {
    setLoading(true)
    const res = await fetch("/api/settings/currencies")
    const data = await res.json()
    setCurrencies(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCurrencies()
  }, [])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleCreate = async () => {
    const res = await fetch("/api/settings/currencies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      await fetchCurrencies()
      setIsCreateOpen(false)
      setForm({ code: "", name: "", symbol: "" })
    } else {
      alert("Failed to create currency")
    }
  }

  const openEdit = (currency: Currency) => {
    setEditId(currency.id)
    setForm({ code: currency.code, name: currency.name, symbol: currency.symbol })
    setIsEditOpen(true)
  }

  const handleEdit = async () => {
    const res = await fetch("/api/settings/currencies", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: editId }),
    })
    if (res.ok) {
      await fetchCurrencies()
      setIsEditOpen(false)
      setEditId(null)
      setForm({ code: "", name: "", symbol: "" })
    } else {
      alert("Failed to update currency")
    }
  }

  const openDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return
    const res = await fetch("/api/settings/currencies", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteId }),
    })
    if (res.ok) {
      await fetchCurrencies()
      setIsDeleteOpen(false)
      setDeleteId(null)
    } else {
      alert("Failed to delete currency")
    }
  }

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Settings</span>
            <span>|</span>
            <span>Currency</span>
          </div>
          <h1 className="text-2xl font-bold">Currency</h1>
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
                    <DialogTitle>Create Currency</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="code">Currency Code *</Label>
                      <Input id="code" value={form.code} onChange={handleFormChange} placeholder="Enter currency code" />
                    </div>
                    <div>
                      <Label htmlFor="name">Currency Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter currency name" />
                    </div>
                    <div>
                      <Label htmlFor="symbol">Symbol *</Label>
                      <Input id="symbol" value={form.symbol} onChange={handleFormChange} placeholder="Enter currency symbol" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-purple-600 hover:bg-purple-700 flex-1" onClick={handleCreate} disabled={!form.code.trim() || !form.name.trim() || !form.symbol.trim()}>
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
                    <DialogTitle>Edit Currency</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="code">Currency Code *</Label>
                      <Input id="code" value={form.code} onChange={handleFormChange} placeholder="Enter currency code" />
                    </div>
                    <div>
                      <Label htmlFor="name">Currency Name *</Label>
                      <Input id="name" value={form.name} onChange={handleFormChange} placeholder="Enter currency name" />
                    </div>
                    <div>
                      <Label htmlFor="symbol">Symbol *</Label>
                      <Input id="symbol" value={form.symbol} onChange={handleFormChange} placeholder="Enter currency symbol" />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button className="bg-purple-600 hover:bg-purple-700 flex-1" onClick={handleEdit} disabled={!form.code.trim() || !form.name.trim() || !form.symbol.trim()}>
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
                  <th className="text-left p-4 font-medium">Currency Code</th>
                  <th className="text-left p-4 font-medium">Currency Name</th>
                  <th className="text-left p-4 font-medium">Symbol</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCurrencies.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">
                      No currencies found.
                    </td>
                  </tr>
                )}
                {filteredCurrencies.map((currency) => (
                  <tr key={currency.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="p-4">{currency.code}</td>
                    <td className="p-4">{currency.name}</td>
                    <td className="p-4">{currency.symbol}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(currency)}>
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openDelete(currency.id)}>
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
                {filteredCurrencies.length > 0
                  ? `1 - ${filteredCurrencies.length} of ${filteredCurrencies.length}`
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
            <DialogTitle>Delete Currency</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            Are you sure you want to delete this currency?
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