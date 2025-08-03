"use client"

import { useState, useMemo } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Edit, Trash2, Loader2, FileDown } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useGetCustomersQuery } from "@/lib/slices/reportsApi"
import { useUpdateCustomerMutation, useDeleteCustomerMutation } from "@/lib/slices/customersApi"
import { Customer } from "@/lib/types"
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

export default function CustomerReport() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });

  const { data: customers, isLoading, refetch } = useGetCustomersQuery({
    from: dateRange?.from?.toISOString().split('T')[0] || '',
    to: dateRange?.to?.toISOString().split('T')[0] || '',
  });
  
  const [updateCustomer, { isLoading: isUpdating }] = useUpdateCustomerMutation();
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();

  const [searchTerm, setSearchTerm] = useState("")
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    city: "",
    address: ""
  })

  const filteredCustomers = useMemo(() => {
    if(!customers) return [];
    return customers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [customers, searchTerm]);

  const handleEdit = async () => {
    if (!selectedCustomer) return
    
    try {
        await updateCustomer({ id: selectedCustomer.id, data: formData }).unwrap();
        setShowEditModal(false)
        toast.success("Customer updated successfully")
        refetch();
    } catch (error) {
      toast.error("Failed to update customer")
      console.error(error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
        await deleteCustomer(id).unwrap();
        toast.success("Customer deleted successfully")
        refetch();
    } catch (error) {
      toast.error("Failed to delete customer")
      console.error(error)
    }
  }

  const openViewModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setShowViewModal(true)
  }

  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer)
    setFormData({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      country: customer.country || "",
      city: customer.city || "",
      address: customer.address || ""
    })
    setShowEditModal(true)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.text('Customer Report', 14, 16)
    
    const tableData = filteredCustomers.map(customer => [
        customer.id,
        customer.name,
        customer.phone || "-",
        customer.email || "-",
        customer.total_sales,
        `$${Number(customer.total_sales || 0).toFixed(2)}`,
        `$${Number(customer.total_paid || 0).toFixed(2)}`,
        `$${Number(customer.total_due || 0).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      head: [['ID', 'Name', 'Phone', 'Email', 'Total Sales', 'Amount', 'Paid', 'Due']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('customer-report.pdf')
  }

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredCustomers.map(customer => ({
        ID: customer.id,
        Name: customer.name,
        Phone: customer.phone || "-",
        Email: customer.email || "-",
        'Total Sales': customer.total_sales,
        'Amount': `$${Number(customer.total_sales || 0).toFixed(2)}`,
        'Paid': `$${Number(customer.total_paid || 0).toFixed(2)}`,
        'Due': `$${Number(customer.total_due || 0).toFixed(2)}`
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers")
    XLSX.writeFile(workbook, "customer-report.xlsx")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Customer Report</span>
          </div>
          <h1 className="text-2xl font-bold">Customer Report</h1>
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
                  <th className="text-left p-4 font-medium">Customer Name</th>
                  <th className="text-left p-4 font-medium">Phone</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Total Sales</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Paid</th>
                  <th className="text-left p-4 font-medium">Due</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="text-center p-6"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></td>
                  </tr>
                ) : filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-6">No customers found.</td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{customer.id}</td>
                      <td className="p-4">{customer.name}</td>
                      <td className="p-4">{customer.phone || "-"}</td>
                      <td className="p-4">{customer.email || "-"}</td>
                      <td className="p-4">{customer.total_sales || 0}</td>
                      <td className="p-4">${(customer.total_sales || 0)}</td>
                      <td className="p-4">${Number(customer.total_paid || 0).toFixed(2)}</td>
                      <td className="p-4">${Number(customer.total_due || 0).toFixed(2)}</td>
                      <td className="p-4">
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
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-red-600" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the customer.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(customer.id)} disabled={isDeleting}>Delete</AlertDialogAction>
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

        {selectedCustomer && (
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Customer Details</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">ID</label>
                  <p className="mt-1 text-sm">{selectedCustomer.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm">{selectedCustomer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-sm">{selectedCustomer.email || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="mt-1 text-sm">{selectedCustomer.phone || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="mt-1 text-sm">{selectedCustomer.country || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">City</label>
                  <p className="mt-1 text-sm">{selectedCustomer.city || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Sales</label>
                  <p className="mt-1 text-sm">{selectedCustomer.total_sales || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Paid</label>
                  <p className="mt-1 text-sm">${Number(selectedCustomer.total_paid || 0).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Due</label>
                  <p className="mt-1 text-sm">${Number(selectedCustomer.total_due || 0).toFixed(2)}</p>
                </div>
                {selectedCustomer.address && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="mt-1 text-sm">{selectedCustomer.address}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label className="text-sm font-medium">Customer Name *</label>
                <Input
                  placeholder="Customer Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
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
                  disabled={isUpdating || !formData.name}
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
