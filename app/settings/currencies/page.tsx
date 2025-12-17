"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, FileDown, Plus } from "lucide-react"
import type React from "react"
import { TableActions } from "@/components/ui/table-actions"
import {
  useGetCurrenciesQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
  type Currency
} from "@/lib/slices/currenciesApi"
import { toast } from "sonner"
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

export default function Currencies() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [form, setForm] = useState({ code: "", name: "", symbol: "", exchange_rate: "" })
  const [editId, setEditId] = useState<number | null>(null)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // RTK Query hooks
  const { data: currencies = [], isLoading: loading } = useGetCurrenciesQuery()
  const [createCurrency, { isLoading: isCreating }] = useCreateCurrencyMutation()
  const [updateCurrency, { isLoading: isUpdating }] = useUpdateCurrencyMutation()
  const [deleteCurrency, { isLoading: isDeleting }] = useDeleteCurrencyMutation()

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }))
  }

  const handleCreate = async () => {
    try {
      await createCurrency({ ...form, exchange_rate: parseFloat(form.exchange_rate) }).unwrap()
      setIsCreateOpen(false)
      setForm({ code: "", name: "", symbol: "", exchange_rate: "" })
      toast.success("Currency created successfully")
    } catch (error: any) {
      console.error("Error creating currency:", error)
      toast.error(error?.data?.error || "Failed to create currency")
    }
  }

  const openEdit = (currency: Currency) => {
    setEditId(currency.id)
    setForm({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchange_rate: currency.exchange_rate?.toString() || "1"
    })
    setIsEditOpen(true)
  }

  const handleEdit = async () => {
    try {
      if (!editId) return
      await updateCurrency({ id: editId, ...form, exchange_rate: parseFloat(form.exchange_rate) }).unwrap()
      setIsEditOpen(false)
      setEditId(null)
      setForm({ code: "", name: "", symbol: "", exchange_rate: "" })
      toast.success("Currency updated successfully")
    } catch (error: any) {
      console.error("Error updating currency:", error)
      toast.error(error?.data?.error || "Failed to update currency")
    }
  }

  const openDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteOpen(true)
  }

  const handleDeleteConfirmed = async () => {
    if (!deleteId) return
    try {
      await deleteCurrency(deleteId).unwrap()
      setIsDeleteOpen(false)
      setDeleteId(null)
      toast.success("Currency deleted successfully")
    } catch (error) {
      console.error("Error deleting currency:", error)
      toast.error("Failed to delete currency")
    }
  }

  // PDF Export functionality
  const handleExportPDF = () => {
    try {
      const doc = new jsPDF()

      doc.text('Currencies List', 14, 16)

      const tableData = filteredCurrencies.map(currency => [
        currency.id,
        currency.code || "-",
        currency.name || "-",
        currency.symbol || "-",
        currency.exchange_rate || "-"
      ])

      autoTable(doc, {
        head: [['ID', 'Currency Code', 'Currency Name', 'Symbol', 'Exchange Rate']],
        body: tableData,
        startY: 20,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [26, 35, 126] }
      })

      doc.save(`currencies-${new Date().getTime()}.pdf`)
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
        filteredCurrencies.map(currency => ({
          ID: currency.id,
          'Currency Code': currency.code || "-",
          'Currency Name': currency.name || "-",
          'Symbol': currency.symbol || "-",
          'Exchange Rate': currency.exchange_rate || "-"
        }))
      )

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Currencies")
      XLSX.writeFile(workbook, `currencies-${new Date().getTime()}.xlsx`)
      toast.success("Excel file exported successfully")
    } catch (error) {
      console.error("Error generating Excel:", error)
      toast.error("Failed to export Excel file")
    }
  }

  const filteredCurrencies = (Array.isArray(currencies) ? currencies : []).filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Settings</span>
            <span>|</span>
            <span>Currencies</span>
          </div>
          {/* <h1 className="text-xl font-semibold">Currencies</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search currencies..."
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
                    Create Currency
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-sm">Create Currency</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="code" className="text-xs">Currency Code *</Label>
                      <Input
                        id="code"
                        value={form.code}
                        onChange={handleFormChange}
                        placeholder="Enter currency code"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="name" className="text-xs">Currency Name *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={handleFormChange}
                        placeholder="Enter currency name"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="symbol" className="text-xs">Symbol *</Label>
                      <Input
                        id="symbol"
                        value={form.symbol}
                        onChange={handleFormChange}
                        placeholder="Enter currency symbol"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="exchange_rate" className="text-xs">Exchange Rate *</Label>
                      <Input
                        id="exchange_rate"
                        type="number"
                        step="0.0001"
                        min="0"
                        value={form.exchange_rate}
                        onChange={handleFormChange}
                        placeholder="Enter exchange rate"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button
                        className="bg-[#1a237e] hover:bg-purple-700 flex-1 h-8 text-xs"
                        onClick={handleCreate}
                        disabled={!form.code.trim() || !form.name.trim() || !form.symbol.trim() || !form.exchange_rate.trim() || isCreating}
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
                  <th className="text-left p-2 font-medium">Currency Code</th>
                  <th className="text-left p-2 font-medium">Currency Name</th>
                  <th className="text-left p-2 font-medium">Symbol</th>
                  <th className="text-left p-2 font-medium">Exchange Rate</th>
                  <th className="text-right p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">Loading...</td>
                  </tr>
                ) : filteredCurrencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-muted-foreground">No currencies found.</td>
                  </tr>
                ) : (
                  filteredCurrencies.map((currency) => (
                    <tr key={currency.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2">
                        <input type="checkbox" className="rounded scale-75" />
                      </td>
                      <td className="p-2">{currency.code}</td>
                      <td className="p-2 font-medium">{currency.name}</td>
                      <td className="p-2">{currency.symbol}</td>
                      <td className="p-2">{currency.exchange_rate}</td>
                      <td className="p-2 text-right">
                        <TableActions
                          onEdit={() => openEdit(currency)}
                          onDelete={() => openDelete(currency.id)}
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
              Showing {filteredCurrencies.length > 0
                ? `1 to ${filteredCurrencies.length}`
                : "0"} of {filteredCurrencies.length} entries
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
            <DialogTitle className="text-sm">Edit Currency</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="code" className="text-xs">Currency Code *</Label>
              <Input
                id="code"
                value={form.code}
                onChange={handleFormChange}
                placeholder="Enter currency code"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-xs">Currency Name *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Enter currency name"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="symbol" className="text-xs">Symbol *</Label>
              <Input
                id="symbol"
                value={form.symbol}
                onChange={handleFormChange}
                placeholder="Enter currency symbol"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="exchange_rate" className="text-xs">Exchange Rate *</Label>
              <Input
                id="exchange_rate"
                type="number"
                step="0.0001"
                min="0"
                value={form.exchange_rate}
                onChange={handleFormChange}
                placeholder="Enter exchange rate"
                className="h-8 text-sm"
              />
            </div>
            <div className="flex gap-2 pt-3">
              <Button
                className="bg-[#1a237e] hover:bg-purple-700 flex-1 h-8 text-xs"
                onClick={handleEdit}
                disabled={!form.code.trim() || !form.name.trim() || !form.symbol.trim() || !form.exchange_rate.trim() || isUpdating}
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
            <DialogTitle className="text-sm">Delete Currency</DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm">
            Are you sure you want to delete this currency?
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