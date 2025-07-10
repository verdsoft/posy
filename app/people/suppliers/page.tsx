"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit, Eye } from "lucide-react"

const suppliers = [
  {
    id: 1,
    code: "SUP001",
    name: "verdsoft Global",
    phone: "0774882645",
    email: "admin@verdsoft.com",
    country: "Zimbabwe",
    city: "Harare",
  },
  {
    id: 2,
    code: "SUP002",
    name: "Tawanda Photechix",
    phone: "0771234567",
    email: "info@photechix.co.zw",
    country: "Zimbabwe",
    city: "Bulawayo",
  },
  {
    id: 3,
    code: "SUP003",
    name: "Netru Zim",
    phone: "0773456789",
    email: "sales@netru.co.zw",
    country: "Zimbabwe",
    city: "Harare",
  },
  {
    id: 4,
    code: "SUP004",
    name: "Darren Electronics",
    phone: "0775678901",
    email: "darren@electronics.co.zw",
    country: "Zimbabwe",
    city: "Gweru",
  },
]

export default function SupplierList() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [supplierName, setSupplierName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")

  const handleSubmit = () => {
    // Handle form submission
    setShowCreateModal(false)
    // Reset form
    setSupplierName("")
    setEmail("")
    setPhone("")
    setCountry("")
    setCity("")
    setAddress("")
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
                <Input placeholder="Search this table..." className="w-64" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-blue-600 bg-transparent">
                🔍 Filter
              </Button>
              <Button variant="outline" className="text-green-600 bg-transparent">
                📄 PDF
              </Button>
              <Button variant="outline" className="text-orange-600 bg-transparent">
                📊 EXCEL
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => setShowCreateModal(true)}>
                ➕ Create
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
                  <th className="text-left p-3">Code</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Phone</th>
                  <th className="text-left p-3">Email</th>
                  <th className="text-left p-3">Country</th>
                  <th className="text-left p-3">City</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier) => (
                  <tr key={supplier.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input type="checkbox" />
                    </td>
                    <td className="p-3">{supplier.code}</td>
                    <td className="p-3">{supplier.name}</td>
                    <td className="p-3">{supplier.phone}</td>
                    <td className="p-3">{supplier.email}</td>
                    <td className="p-3">{supplier.country}</td>
                    <td className="p-3">{supplier.city}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-blue-600">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-green-600">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - 4 of 4 | prev next</div>
          </div>
        </div>

        {/* Create Supplier Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label className="text-sm font-medium">Supplier Name *</label>
                <Input
                  placeholder="Supplier Name"
                  value={supplierName}
                  onChange={(e) => setSupplierName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email *</label>
                <Input
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Country</label>
                <Input
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">City</label>
                <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="mt-1" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Address</label>
                <Input
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSubmit}>
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
