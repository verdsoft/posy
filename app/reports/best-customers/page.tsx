"use client"

import { useState, useMemo } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileDown, Eye, Edit, Trash2, Loader2 } from "lucide-react"
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

export default function BestCustomers() {
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
    phone: "",
    email: "",
    address: "",
    city: "",
    country: ""
  })

  const bestCustomers = useMemo(() => {
    if (!customers) return [];
    return [...customers]
        .filter(c => c.total_sales > 0)
        .sort((a, b) => b.total_sales - a.total_sales);
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    return bestCustomers.filter(customer =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  }, [bestCustomers, searchTerm]);
  
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
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
      city: customer.city || "",
      country: customer.country || ""
    })
    setShowEditModal(true)
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.text('Best Customers Report', 14, 16)
    
    const tableData = filteredCustomers.map(customer => [
      customer.name,
      customer.phone || "-",
      customer.email || "-",
      customer.total_sales.toString(),
      `$${Number(customer.total_paid || 0) }`,
      `$${Number(customer.total_due || 0) }`
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

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredCustomers.map(customer => ({
        Name: customer.name,
        Phone: customer.phone || "-",
        Email: customer.email || "-",
        'Total Sales': customer.total_sales,
        'Total Paid': `$${Number(customer.total_paid || 0) }`,
        'Total Due': `$${Number(customer.total_due || 0) }`
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
              <DateRangePicker onDateChange={setDateRange} initialDateRange={dateRange} />
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
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center p-6"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></td>
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
                      <td className="p-3">${Number(customer.total_paid || 0) }</td>
                      <td className="p-3">${Number(customer.total_due || 0) }</td>
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
                  <p className="mt-1 text-sm">${Number(selectedCustomer.total_paid || 0) }</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Due</label>
                  <p className="mt-1 text-sm">${Number(selectedCustomer.total_due || 0) }</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Customer Since</label>
                  <p className="mt-1 text-sm">{new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
                </div>
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
