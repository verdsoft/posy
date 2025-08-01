"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit, Eye, Trash2, FileDown, Plus } from "lucide-react"
import { toast } from "sonner"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export default function SupplierList() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: ""
  })

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/suppliers')
        if (!res.ok) throw new Error("Failed to fetch suppliers")
        const data = await res.json()
        setSuppliers(data)
      } catch (error) {
        toast.error("Failed to load suppliers")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSuppliers()
  }, [])

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle create supplier
  const handleCreate = async () => {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) throw new Error("Failed to create supplier")
      
      const newSupplier = await res.json()
      setSuppliers([...suppliers, newSupplier])
      setShowCreateModal(false)
      resetForm()
      toast.success("Supplier created successfully")
    } catch (error) {
      toast.error("Failed to create supplier")
      console.error(error)
    }
  }

  // Handle edit supplier
  const handleEdit = async () => {
    if (!selectedSupplier) return
    
    try {
      const res = await fetch('/api/suppliers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: selectedSupplier.id })
      })
      
      if (!res.ok) throw new Error("Failed to update supplier")
      
      const updatedSupplier = await res.json()
      setSuppliers(suppliers.map(s => 
        s.id === selectedSupplier.id ? updatedSupplier : s
      ))
      setShowEditModal(false)
      resetForm()
      toast.success("Supplier updated successfully")
    } catch (error) {
      toast.error("Failed to update supplier")
      console.error(error)
    }
  }

  // Handle delete supplier
  const handleDelete = async () => {
    if (!selectedSupplier) return
    
    try {
      const res = await fetch(`/api/suppliers?id=${selectedSupplier.id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error("Failed to delete supplier")
      
      setSuppliers(suppliers.filter(s => s.id !== selectedSupplier.id))
      setShowDeleteModal(false)
      toast.success("Supplier deleted successfully")
    } catch (error) {
      toast.error("Failed to delete supplier")
      console.error(error)
    }
  }

  // Open edit modal
  const openEditModal = (supplier: any) => {
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

  // Open view modal
  const openViewModal = (supplier: any) => {
    setSelectedSupplier(supplier)
    setShowViewModal(true)
  }

  // Open delete modal
  const openDeleteModal = (supplier: any) => {
    setSelectedSupplier(supplier)
    setShowDeleteModal(true)
  }

  // Reset form
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

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.text('Suppliers List', 14, 16)
    
    const tableData = filteredSuppliers.map(supplier => [
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

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredSuppliers.map(supplier => ({
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
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Supplier List</span>
            <span>|</span>
            <span>Supplier Management</span>
          </div>
          <h1 className="text-2xl font-bold">Supplier Management</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input 
                  placeholder="Search this table..." 
                  className="w-64" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPDF}
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
              >
                <FileDown className="h-4 w-4 mr-2" />
                EXCEL
              </Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">
                    <input type="checkbox" />
                  </th>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Country</th>
                  <th className="text-left p-3">City</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-6">Loading...</td>
                  </tr>
                ) : filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-6">No suppliers found.</td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input type="checkbox" />
                      </td>
                      <td className="p-3">{supplier.id}</td>
                      <td className="p-3">{supplier.name}</td>
                      <td className="p-3">{supplier.phone || "-"}</td>
                      <td className="p-3">{supplier.email}</td>
                      <td className="p-3">{supplier.country || "-"}</td>
                      <td className="p-3">{supplier.city || "-"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(supplier)}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(supplier)}
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(supplier)}
                          >
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

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">
              {filteredSuppliers.length > 0 
                ? `1 - ${Math.min(filteredSuppliers.length, 10)} of ${filteredSuppliers.length}` 
                : '0 - 0 of 0'}
            </div>
          </div>
        </div>

        {/* Create Supplier Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Supplier</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label className="text-sm font-medium">Supplier Name *</label>
                <Input
                  placeholder="Supplier Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  placeholder="Phone" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="mt-1" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input 
                  placeholder="City" 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})} 
                  className="mt-1" 
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700" 
                  onClick={handleCreate}
                  disabled={!formData.name || !formData.email}
                >
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Supplier Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Supplier</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label className="text-sm font-medium">Supplier Name *</label>
                <Input
                  placeholder="Supplier Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  placeholder="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  placeholder="Phone" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})} 
                  className="mt-1" 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input 
                  placeholder="City" 
                  value={formData.city} 
                  onChange={(e) => setFormData({...formData, city: e.target.value})} 
                  className="mt-1" 
                />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700" 
                  onClick={handleEdit}
                  disabled={!formData.name || !formData.email}
                >
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Supplier Modal */}
        {selectedSupplier && (
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Supplier Details</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="mt-1 text-sm">{selectedSupplier.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm">{selectedSupplier.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm">{selectedSupplier.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-sm">{selectedSupplier.phone || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="mt-1 text-sm">{selectedSupplier.country || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="mt-1 text-sm">{selectedSupplier.city || "-"}</p>
                </div>
                {selectedSupplier.address && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="mt-1 text-sm">{selectedSupplier.address}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation Modal */}
        {selectedSupplier && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Supplier</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete supplier "{selectedSupplier.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700" 
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
