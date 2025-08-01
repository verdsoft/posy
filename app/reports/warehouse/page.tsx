"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Edit, Trash2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Warehouse {
  id: string
  name: string
  phone: string
  email: string
  country: string
  city: string
  zip_code: string
  status: string
  created_at: string
}

export default function WarehouseReport() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedWarehouseData, setSelectedWarehouseData] = useState<Warehouse | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    country: "",
    city: "",
    zip_code: ""
  })

  // Fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/settings/warehouses')
        if (!res.ok) throw new Error("Failed to fetch warehouses")
        const data = await res.json()
        setWarehouses(data)
      } catch (error) {
        toast.error("Failed to load warehouses")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchWarehouses()
  }, [])

  // Filter warehouses based on search and selection
  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warehouse.city?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedWarehouse === "all") return matchesSearch
    return matchesSearch && warehouse.id === selectedWarehouse
  })

  // Handle edit warehouse
  const handleEdit = async () => {
    if (!selectedWarehouseData) return
    
    try {
      const res = await fetch('/api/settings/warehouses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: selectedWarehouseData.id })
      })
      
      if (!res.ok) throw new Error("Failed to update warehouse")
      
      const updatedWarehouse = await res.json()
      setWarehouses(warehouses.map(w => 
        w.id === selectedWarehouseData.id ? { ...w, ...updatedWarehouse } : w
      ))
      setShowEditModal(false)
      resetForm()
      toast.success("Warehouse updated successfully")
    } catch (error) {
      toast.error("Failed to update warehouse")
      console.error(error)
    }
  }

  // Handle delete warehouse
  const handleDelete = async () => {
    if (!selectedWarehouseData) return
    
    try {
      const res = await fetch('/api/settings/warehouses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedWarehouseData.id })
      })
      
      if (!res.ok) throw new Error("Failed to delete warehouse")
      
      setWarehouses(warehouses.filter(w => w.id !== selectedWarehouseData.id))
      setShowDeleteModal(false)
      toast.success("Warehouse deleted successfully")
    } catch (error) {
      toast.error("Failed to delete warehouse")
      console.error(error)
    }
  }

  // Open view modal
  const openViewModal = (warehouse: Warehouse) => {
    setSelectedWarehouseData(warehouse)
    setShowViewModal(true)
  }

  // Open edit modal
  const openEditModal = (warehouse: Warehouse) => {
    setSelectedWarehouseData(warehouse)
    setFormData({
      name: warehouse.name || "",
      phone: warehouse.phone || "",
      email: warehouse.email || "",
      country: warehouse.country || "",
      city: warehouse.city || "",
      zip_code: warehouse.zip_code || ""
    })
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = (warehouse: Warehouse) => {
    setSelectedWarehouseData(warehouse)
    setShowDeleteModal(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      country: "",
      city: "",
      zip_code: ""
    })
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Warehouse report</span>
          </div>
          <h1 className="text-2xl font-bold">Warehouse report</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-center mb-6">
              <div className="w-64">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Warehouse</label>
                <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-blue-500 rounded"></div>
                </div>
                <div className="text-2xl font-bold text-blue-600">{warehouses.length}</div>
                <div className="text-sm text-gray-600">Total Warehouses</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-purple-100 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-purple-500 rounded"></div>
                </div>
                <div className="text-2xl font-bold text-purple-600">{filteredWarehouses.length}</div>
                <div className="text-sm text-gray-600">Filtered Warehouses</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-green-500 rounded"></div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {warehouses.filter(w => w.status === 'active').length}
                </div>
                <div className="text-sm text-gray-600">Active Warehouses</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-500 rounded"></div>
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {warehouses.filter(w => w.status === 'inactive').length}
                </div>
                <div className="text-sm text-gray-600">Inactive Warehouses</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b">
              <button className="px-4 py-2 text-sm font-medium text-purple-600 border-b-2 border-purple-600 bg-purple-50">
                Warehouses
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Products</button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Transfers</button>
              <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Adjustments</button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b">
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
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">City</th>
                  <th className="text-left p-4 font-medium">Country</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6">Loading...</td>
                  </tr>
                ) : filteredWarehouses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6">No warehouses found.</td>
                  </tr>
                ) : (
                  filteredWarehouses.map((warehouse) => (
                    <tr key={warehouse.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{warehouse.name}</td>
                      <td className="p-4">{warehouse.phone || "-"}</td>
                      <td className="p-4">{warehouse.email || "-"}</td>
                      <td className="p-4">{warehouse.city || "-"}</td>
                      <td className="p-4">{warehouse.country || "-"}</td>
                      <td className="p-4">
                        <Badge variant="secondary" className={
                          warehouse.status === 'active' 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }>
                          {warehouse.status || "active"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(warehouse)}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(warehouse)}
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(warehouse)}
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
              <Select defaultValue="10">
                <SelectTrigger className="w-16 ml-2 inline-flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredWarehouses.length > 0 
                  ? `1 - ${Math.min(filteredWarehouses.length, 10)} of ${filteredWarehouses.length}` 
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

          {/* Charts */}
          <div className="p-6 border-t">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Warehouse Distribution</h3>
                <div className="flex items-center justify-center h-64">
                  <div className="w-48 h-48 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm">{warehouses.length} Warehouses</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Status Overview</h3>
                <div className="flex items-center justify-center h-64">
                  <div className="w-48 h-48 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white text-sm">
                      {warehouses.filter(w => w.status === 'active').length} Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Warehouse Modal */}
        {selectedWarehouseData && (
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Warehouse Details</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="mt-1 text-sm">{selectedWarehouseData.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm">{selectedWarehouseData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-sm">{selectedWarehouseData.phone || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm">{selectedWarehouseData.email || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="mt-1 text-sm">{selectedWarehouseData.country || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="mt-1 text-sm">{selectedWarehouseData.city || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Zip Code</label>
                  <p className="mt-1 text-sm">{selectedWarehouseData.zip_code || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm">{selectedWarehouseData.status || "active"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created At</label>
                  <p className="mt-1 text-sm">{new Date(selectedWarehouseData.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Warehouse Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Warehouse</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  placeholder="Warehouse Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone *</label>
                <Input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
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
                <label className="text-sm font-medium">Country *</label>
                <Input
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">City *</label>
                <Input
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Zip Code</label>
                <Input
                  placeholder="Zip Code"
                  value={formData.zip_code}
                  onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700" 
                  onClick={handleEdit}
                  disabled={!formData.name || !formData.phone || !formData.email || !formData.country || !formData.city}
                >
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        {selectedWarehouseData && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Warehouse</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete warehouse "{selectedWarehouseData.name}"? This action cannot be undone.
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
