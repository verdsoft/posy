"use client"

import { useState, useMemo } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Edit, Trash2, Loader2, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { useGetWarehousesQuery, useUpdateWarehouseMutation, useDeleteWarehouseMutation } from "@/lib/slices/settingsApi"
import { Warehouse } from "@/lib/types"

declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
    }
}

export default function WarehouseReport() {
  const { data: warehouses, isLoading, refetch } = useGetWarehousesQuery();
  const [updateWarehouse, { isLoading: isUpdating }] = useUpdateWarehouseMutation();
  const [deleteWarehouse, { isLoading: isDeleting }] = useDeleteWarehouseMutation();

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("all")
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedWarehouseData, setSelectedWarehouseData] = useState<Warehouse | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    country: "",
    city: "",
    zip_code: ""
  })

  const filteredWarehouses = useMemo(() => {
    if (!warehouses) return [];
    let filtered = warehouses;

    if (selectedWarehouse !== "all") {
        filtered = filtered.filter(warehouse => warehouse.id === selectedWarehouse);
    }

    if (searchTerm) {
        filtered = filtered.filter(warehouse =>
            warehouse.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            warehouse.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            warehouse.city?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    
    return filtered;
  }, [warehouses, searchTerm, selectedWarehouse]);

  const handleEdit = async () => {
    if (!selectedWarehouseData) return
    
    try {
      await updateWarehouse({ id: selectedWarehouseData.id, ...formData }).unwrap()
      setShowEditModal(false)
      toast.success("Warehouse updated successfully")
      refetch();
    } catch (error) {
      toast.error("Failed to update warehouse")
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteWarehouse(id).unwrap()
      toast.success("Warehouse deleted successfully")
      refetch();
    } catch (error) {
      toast.error("Failed to delete warehouse")
      console.error(error)
    }
  }

  const openViewModal = (warehouse: Warehouse) => {
    setSelectedWarehouseData(warehouse)
    setShowViewModal(true)
  }

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
  
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.text('Warehouse Report', 14, 16)
    
    const tableData = filteredWarehouses.map(warehouse => [
      warehouse.name,
      warehouse.phone || "-",
      warehouse.email || "-",
      warehouse.city || "-",
      warehouse.country || "-",
      warehouse.status || "active",
    ])
    
    autoTable(doc, {
      head: [['Name', 'Phone', 'Email', 'City', 'Country', 'Status']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('warehouse-report.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredWarehouses.map(warehouse => ({
        Name: warehouse.name,
        Phone: warehouse.phone || "-",
        Email: warehouse.email || "-",
        City: warehouse.city || "-",
        Country: warehouse.country || "-",
        Status: warehouse.status || "active",
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouses")
    XLSX.writeFile(workbook, "warehouse-report.xlsx")
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
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-64">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Warehouse</label>
                        <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Warehouses</SelectItem>
                            {warehouses?.map((warehouse) => (
                            <SelectItem key={warehouse.id} value={warehouse.id}>
                                {warehouse.name}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                            placeholder="Search this table" 
                            className="pl-10" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportPDF}><FileDown className="h-4 w-4 mr-2" />PDF</Button>
                    <Button variant="outline" size="sm" onClick={handleExportExcel}><FileDown className="h-4 w-4 mr-2" />EXCEL</Button>
                </div>
            </div>
          </div>

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
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></td>
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
                            onClick={() => handleDelete(warehouse.id)}
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
        </div>

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

        {selectedWarehouseData && (
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
                    disabled={isUpdating || !formData.name || !formData.phone || !formData.email || !formData.country || !formData.city}
                    >
                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update
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
