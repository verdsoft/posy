"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FileDown, Plus, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useGetSuppliersQuery, useUpdateSupplierMutation, useDeleteSupplierMutation, useCreateSupplierMutation } from "@/lib/slices/suppliersApi"
import { Supplier } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination as UIPagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TableActions } from "@/components/ui/table-actions"

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function SupplierList() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: ""
  })

  const { data, isLoading, isError } = useGetSuppliersQuery({ page, limit, search: searchTerm })
  const [createSupplier, { isLoading: isCreating }] = useCreateSupplierMutation()
  const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation()
  const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation()

  const suppliers = data?.data || [];
  const pagination = data?.pagination;

  const handleCreate = async () => {
    try {
      await createSupplier(formData).unwrap()
      setShowCreateModal(false)
      resetForm()
      toast.success("Supplier created successfully")
    } catch (error: any) {
      const message = error?.data?.error || "Failed to create supplier"
      toast.error(message)
      console.error(error)
    }
  }

  const handleEdit = async () => {
    if (!selectedSupplier) return

    try {
      await updateSupplier({ id: selectedSupplier.id, data: formData }).unwrap()
      setShowEditModal(false)
      resetForm()
      toast.success("Supplier updated successfully")
    } catch (error: any) {
      const message = error?.data?.error || "Failed to update supplier"
      toast.error(message)
      console.error(error)
    }
  }

  const handleDelete = async () => {
    if (!selectedSupplier) return

    try {
      await deleteSupplier(selectedSupplier.id).unwrap()
      setShowDeleteModal(false)
      toast.success("Supplier deleted successfully")
    } catch (error) {
      toast.error("Failed to delete supplier")
      console.error(error)
    }
  }

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setFormData({
      name: supplier.name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      country: supplier.country || "",
      city: supplier.city || "",
      address: supplier.address || ""
    })
    setShowEditModal(true)
  }

  const openViewModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowViewModal(true)
  }

  const openDeleteModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowDeleteModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      country: "",
      city: "",
      address: ""
    })
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()

    doc.text('Suppliers List', 14, 16)

    const tableData = suppliers.map(supplier => [
      supplier.id,
      supplier.name,
      supplier.phone || "-",
      supplier.email,
      supplier.country || "-",
      supplier.city || "-"
    ])

    autoTable(doc, {
      head: [['ID', 'Name', 'Phone', 'Email', 'Country', 'City']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })

    doc.save('suppliers.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      suppliers.map(supplier => ({
        ID: supplier.id,
        Name: supplier.name,
        Phone: supplier.phone || "-",
        Email: supplier.email,
        Country: supplier.country || "-",
        City: supplier.city || "-"
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers")
    XLSX.writeFile(workbook, "suppliers.xlsx")
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>People</span>
            <span>|</span>
            <span>Supplier List</span>
          </div>
          {/* <h1 className="text-xl font-semibold">Supplier Management</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers..."
                  className="w-full md:w-64 h-8 text-sm pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
              <Button
                className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Supplier
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 font-medium">
                    <input type="checkbox" className="rounded scale-75" />
                  </th>
                  {/* <th className="text-left p-2 font-medium">ID</th> */}
                  <th className="text-left p-2 font-medium">Name</th>
                  <th className="text-left p-2 font-medium">Phone</th>
                  <th className="text-left p-2 font-medium">Email</th>
                  <th className="text-left p-2 font-medium">Country</th>
                  <th className="text-left p-2 font-medium">City</th>
                  <th className="text-right p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">Loading...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-red-500">Failed to load suppliers</td>
                  </tr>
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-muted-foreground">No suppliers found.</td>
                  </tr>
                ) : (
                  suppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2">
                        <input type="checkbox" className="rounded scale-75" />
                      </td>
                      {/* <td className="p-2">{supplier.id}</td> */}
                      <td className="p-2 font-medium">{supplier.name}</td>
                      <td className="p-2">{supplier.phone || "-"}</td>
                      <td className="p-2">{supplier.email}</td>
                      <td className="p-2">{supplier.country || "-"}</td>
                      <td className="p-2">{supplier.city || "-"}</td>
                      <td className="p-2 text-right">
                        <TableActions
                          onView={() => openViewModal(supplier)}
                          onEdit={() => openEditModal(supplier)}
                          onDelete={() => openDeleteModal(supplier)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="p-3 border-t flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => setLimit(Number(value))}
                >
                  <SelectTrigger className="h-7 w-[60px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 15, 25, 50, 100].map((size) => (
                      <SelectItem key={size} value={size.toString()} className="text-xs">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <UIPagination>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage((old) => Math.max(old - 1, 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                      <span className="text-xs">Page {page} of {pagination.totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage((old) => old + 1)}
                      disabled={page >= (pagination.totalPages || 1)}
                    >
                      Next
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </UIPagination>
              </div>
            </div>
          )}
        </div>

        {/* Create Supplier Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="supplier@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={isCreating || !formData.name}>
                  {isCreating ? "Creating..." : "Create Supplier"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Supplier Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Supplier name"
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="supplier@example.com"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="edit-country">Country</Label>
                <Input
                  id="edit-country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="Country"
                />
              </div>
              <div>
                <Label htmlFor="edit-city">City</Label>
                <Input
                  id="edit-city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Textarea
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEdit} disabled={isUpdating || !formData.name}>
                  {isUpdating ? "Updating..." : "Update Supplier"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Supplier Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Supplier Details</DialogTitle>
            </DialogHeader>
            {selectedSupplier && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="text-sm">{selectedSupplier.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-sm">{selectedSupplier.email || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Phone</Label>
                  <p className="text-sm">{selectedSupplier.phone || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Country</Label>
                  <p className="text-sm">{selectedSupplier.country || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">City</Label>
                  <p className="text-sm">{selectedSupplier.city || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Address</Label>
                  <p className="text-sm">{selectedSupplier.address || "-"}</p>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowViewModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the supplier
                and remove their data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Supplier"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
