"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileDown, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface BestCustomer {
  id: string
  name: string
  phone: string
  email: string
  address: string
  city: string
  country: string
  total_sales: number
  total_paid: number
  total_due: number
  sales_count: number
  created_at: string
}

export default function BestCustomers() {
  const [customers, setCustomers] = useState<BestCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<BestCustomer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: ""
  })

  // Fetch best customers
  useEffect(() => {
    const fetchBestCustomers = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/customers')
        if (!res.ok) throw new Error("Failed to fetch customers")
        const data = await res.json()
        
        // Sort by total sales to get best customers
        const sortedCustomers = data
          .filter((customer: any) => customer.total_sales > 0)
          .sort((a: any, b: any) => b.total_sales - a.total_sales)
        
        setCustomers(sortedCustomers)
      } catch (error) {
        toast.error("Failed to load best customers")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchBestCustomers()
  }, [])

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Handle edit customer
  const handleEdit = async () => {
    if (!selectedCustomer) return
    
    try {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: selectedCustomer.id })
      })
      
      if (!res.ok) throw new Error("Failed to update customer")
      
      const updatedCustomer = await res.json()
      setCustomers(customers.map(c => 
        c.id === selectedCustomer.id ? { ...c, ...updatedCustomer } : c
      ))
      setShowEditModal(false)
      resetForm()
      toast.success("Customer updated successfully")
    } catch (error) {
      toast.error("Failed to update customer")
      console.error(error)
    }
  }

  // Handle delete customer
  const handleDelete = async () => {
    if (!selectedCustomer) return
    
    try {
      const res = await fetch(`/api/customers?id=${selectedCustomer.id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error("Failed to delete customer")
      
      setCustomers(customers.filter(c => c.id !== selectedCustomer.id))
      setShowDeleteModal(false)
      toast.success("Customer deleted successfully")
    } catch (error) {
      toast.error("Failed to delete customer")
      console.error(error)
    }
  }

  // Open view modal
  const openViewModal = (customer: BestCustomer) => {
    setSelectedCustomer(customer)
    setShowViewModal(true)
  }

  // Open edit modal
  const openEditModal = (customer: BestCustomer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      city: customer.city || "",
      country: customer.country || ""
    })
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = (customer: BestCustomer) => {
    setSelectedCustomer(customer)
    setShowDeleteModal(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      country: ""
    })
  }

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.text('Best Customers Report', 14, 16)
    
    const tableData = filteredCustomers.map(customer => [
      customer.name,
      customer.phone || "-",
      customer.email || "-",
      customer.total_sales.toString(),
      `$${customer.total_paid || "0.00"}`,
      `$${customer.total_due || "0.00"}`
    ])
    
    autoTable(doc, {
      head: [['Name', 'Phone', 'Email', 'Total Sales', 'Total Paid', 'Total Due']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('best-customers.pdf')
  }

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredCustomers.map(customer => ({
        Name: customer.name,
        Phone: customer.phone || "-",
        Email: customer.email || "-",
        'Total Sales': customer.total_sales,
        'Total Paid': `$${customer.total_paid || "0.00"}`,
        'Total Due': `$${customer.total_due || "0.00"}`
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Best Customers")
    XLSX.writeFile(workbook, "best-customers.xlsx")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Best Customers</span>
          </div>
          <h1 className="text-2xl font-bold">Best customers</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search customers..." 
                  className="w-64 pl-10" 
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
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Total Sales</th>
                  <th className="text-left p-3">Total Paid</th>
                  <th className="text-left p-3">Total Due</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6">Loading...</td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6">No customers found.</td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{customer.name}</td>
                      <td className="p-3">{customer.phone || "-"}</td>
                      <td className="p-3">{customer.email || "-"}</td>
                      <td className="p-3">{customer.total_sales}</td>
                      <td className="p-3">${customer.total_paid || "0.00"}</td>
                      <td className="p-3">${customer.total_due || "0.00"}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(customer)}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(customer)}
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(customer)}
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
              {filteredCustomers.length > 0 
                ? `1 - ${Math.min(filteredCustomers.length, 10)} of ${filteredCustomers.length}` 
                : '0 - 0 of 0'}
            </div>
          </div>
        </div>

        {/* View Customer Modal */}
        {selectedCustomer && (
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Customer Details</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-sm">{selectedCustomer.phone || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm">{selectedCustomer.email || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="mt-1 text-sm">{selectedCustomer.address || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="mt-1 text-sm">{selectedCustomer.city || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="mt-1 text-sm">{selectedCustomer.country || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Sales</label>
                  <p className="mt-1 text-sm">{selectedCustomer.total_sales}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Paid</label>
                  <p className="mt-1 text-sm">${selectedCustomer.total_paid || "0.00"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Due</label>
                  <p className="mt-1 text-sm">${selectedCustomer.total_due || "0.00"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Since</label>
                  <p className="mt-1 text-sm">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Customer Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  placeholder="Customer name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
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
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  placeholder="Country"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700" 
                  onClick={handleEdit}
                  disabled={!formData.name}
                >
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        {selectedCustomer && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Customer</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete customer "{selectedCustomer.name}"? This action cannot be undone.
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
