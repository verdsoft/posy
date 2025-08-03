"use client"

import { useState, useMemo } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, Trash2, Loader2, FileDown } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useGetSuppliersQuery } from "@/lib/slices/reportsApi"
import { useUpdateSupplierMutation, useDeleteSupplierMutation } from "@/lib/slices/suppliersApi"
import { Supplier } from "@/lib/types"
import { DateRangePicker } from "@/components/date-range-picker"
import { DateRange } from "react-day-picker"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

declare module 'jspdf' {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
    }
}

export default function SupplierReport() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 1),
        to: new Date(),
    });

    const { data: suppliers, isLoading, refetch } = useGetSuppliersQuery({
        from: dateRange?.from?.toISOString().split('T')[0] || '',
        to: dateRange?.to?.toISOString().split('T')[0] || '',
    });
    
    const [updateSupplier, { isLoading: isUpdating }] = useUpdateSupplierMutation();
    const [deleteSupplier, { isLoading: isDeleting }] = useDeleteSupplierMutation();

  const [searchTerm, setSearchTerm] = useState("")
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: ""
  })

  const filteredSuppliers = useMemo(() => {
    if(!suppliers) return [];
    return suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [suppliers, searchTerm]);

  const handleEdit = async () => {
    if (!selectedSupplier) return
    
    try {
        await updateSupplier({ id: selectedSupplier.id, ...formData }).unwrap();
        setShowEditModal(false)
        toast.success("Supplier updated successfully")
        refetch();
    } catch (error) {
      toast.error("Failed to update supplier")
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
        await deleteSupplier(id).unwrap();
        toast.success("Supplier deleted successfully")
        refetch();
    } catch (error) {
      toast.error("Failed to delete supplier")
      console.error(error)
    }
  }

  const openViewModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowViewModal(true)
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

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.text('Supplier Report', 14, 16)
    
    const tableData = filteredSuppliers.map(supplier => [
      supplier.id,
      supplier.name,
      supplier.phone || "-",
      supplier.email || "-",
      `$${Number(supplier.total_purchases || 0) }`,
      `$${Number(supplier.total_paid || 0) }`,
      `$${Number(supplier.total_due || 0) }`
    ])
    
    autoTable(doc, {
      head: [['ID', 'Name', 'Phone', 'Email', 'Total Purchases', 'Total Paid', 'Total Due']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('suppliers-report.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
        filteredSuppliers.map(supplier => ({
        ID: supplier.id,
        Name: supplier.name,
        Phone: supplier.phone || "-",
        Email: supplier.email || "-",
        'Total Purchases': `$${Number(supplier.total_purchases || 0) }`,
        'Total Paid': `$${Number(supplier.total_paid || 0) }`,
        'Total Due': `$${Number(supplier.total_due || 0) }`
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers")
    XLSX.writeFile(workbook, "suppliers-report.xlsx")
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
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                    placeholder="Search this table" 
                    className="pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                </div>
                <DateRangePicker onDateChange={setDateRange} initialDateRange={dateRange} />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPDF}><FileDown className="h-4 w-4 mr-2" />PDF</Button>
                <Button variant="outline" size="sm" onClick={handleExportExcel}><FileDown className="h-4 w-4 mr-2" />EXCEL</Button>
            </div>
          </div>

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
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-6"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></td>
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
                      <td className="p-4">${Number(supplier.total_purchases || 0) }</td>
                      <td className="p-4">${Number(supplier.total_paid || 0) }</td>
                      <td className="p-4">${Number(supplier.total_due || 0) }</td>
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the supplier.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(supplier.id)} disabled={isDeleting}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                           </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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
                  <p className="mt-1 text-sm">${Number(selectedSupplier.total_purchases || 0) }</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Paid</label>
                  <p className="mt-1 text-sm">${Number(selectedSupplier.total_paid || 0) }</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Due</label>
                  <p className="mt-1 text-sm">${Number(selectedSupplier.total_due || 0) }</p>
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
                  disabled={isUpdating || !formData.name || !formData.email}
                >
                    {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
