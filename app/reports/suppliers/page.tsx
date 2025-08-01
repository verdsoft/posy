"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, Trash2, Plus } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  country: string
  city: string
  address: string
  total_purchases: number
  total_paid: number
  total_due: number
}

export default function SupplierReport() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
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
        s.id === selectedSupplier.id ? { ...s, ...updatedSupplier } : s
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

  // Open view modal
  const openViewModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowViewModal(true)
  }

  // Open edit modal
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

  // Open delete modal
  const openDeleteModal = (supplier: Supplier) => {
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

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Supplier Report</span>
          </div>
          <h1 className="text-2xl font-bold">Supplier Report</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search this table" 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">ID</th>
                  <th className="text-left p-4 font-medium">Supplier Name</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Total Purchases</th>
                  <th className="text-left p-4 font-medium">Total Paid</th>
                  <th className="text-left p-4 font-medium">Total Due</th>
                  <th className="text-left p-4 font-medium">Action</th>
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
                      <td className="p-4">{supplier.id}</td>
                      <td className="p-4">{supplier.name}</td>
                      <td className="p-4">{supplier.phone || "-"}</td>
                      <td className="p-4">{supplier.email}</td>
                      <td className="p-4">${supplier.total_purchases || "0.00"}</td>
                      <td className="p-4">${supplier.total_paid || "0.00"}</td>
                      <td className="p-4">${supplier.total_due || "0.00"}</td>
                      <td className="p-4">
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

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Rows per page:
              <select className="ml-2 border rounded px-2 py-1">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredSuppliers.length > 0 
                  ? `1 - ${Math.min(filteredSuppliers.length, 10)} of ${filteredSuppliers.length}` 
                  : '0 - 0 of 0'}
              </span>
              <div className="flex gap-1">
                <button className="px-3 py-1 text-sm border rounded disabled:opacity-50" disabled>
                  prev
                </button>
                <button className="px-3 py-1 text-sm border rounded disabled:opacity-50" disabled>
                  next
                </button>
              </div>
            </div>
          </div>
        </div>

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
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Purchases</label>
                  <p className="mt-1 text-sm">${selectedSupplier.total_purchases || "0.00"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Paid</label>
                  <p className="mt-1 text-sm">${selectedSupplier.total_paid || "0.00"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Due</label>
                  <p className="mt-1 text-sm">${selectedSupplier.total_due || "0.00"}</p>
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
