"use client"

import { useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit, Eye } from "lucide-react"

const customers = [
  {
    id: 15,
    code: "15",
    name: "shamiso",
    phone: "",
    email: "mabokari@staff.msu.ac.zw",
    country: "Zimbabwe",
    city: "Harare",
  },
  {
    id: 14,
    code: "14",
    name: "midlands state university",
    phone: "0775549534",
    email: "mudianda@gmail.com",
    country: "zimbabwe",
    city: "bulawayo",
  },
  {
    id: 13,
    code: "13",
    name: "UZ",
    phone: "0775786987",
    email: "verdsoft@gmail.com",
    country: "Zimbabwe",
    city: "harare",
  },
  {
    id: 12,
    code: "12",
    name: "Probottlers Zimbabwe",
    phone: "+263 715 320 318",
    email: "sales@probottlers.co.zw",
    country: "Zimbabwe",
    city: "Ruwa",
  },
  {
    id: 11,
    code: "11",
    name: "ZCHPC",
    phone: "334895",
    email: "procurement@zchpc.ac.zw",
    country: "Zimbabwe",
    city: "HARARE",
  },
  {
    id: 10,
    code: "10",
    name: "Ada",
    phone: "0783225949",
    email: "ada@gmail.com",
    country: "Zimbabwe",
    city: "HARARE",
  },
  {
    id: 9,
    code: "9",
    name: "Munyaradzi Mareya",
    phone: "0771944797",
    email: "munyaradzimareya@gmail.com",
    country: "Zimbabwe",
    city: "HARARE",
  },
  {
    id: 8,
    code: "8",
    name: "Trust Academy",
    phone: "+263711347117",
    email: "admin@trustacademy.co.zw",
    country: "Zimbabwe",
    city: "HARARE",
  },
  {
    id: 7,
    code: "7",
    name: "Tafadzwa Mukuvuma",
    phone: "0773428816",
    email: "tafadzwamukuvuma@gmail.com",
    country: "Zimbabwe",
    city: "Harare",
  },
  {
    id: 6,
    code: "6",
    name: "SIRDC",
    phone: "0772967507",
    email: "smugunhidzi@sirdc.ac.zw",
    country: "Zimbabwe",
    city: "Harare",
  },
]

export default function CustomerList() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [country, setCountry] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")

  const handleSubmit = () => {
    // Handle form submission
    setShowCreateModal(false)
    // Reset form
    setCustomerName("")
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
            <span>Customer List</span>
            <span>|</span>
            <span>Customer Management</span>
          </div>
          <h1 className="text-2xl font-bold">Customer Management</h1>
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
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <input type="checkbox" />
                    </td>
                    <td className="p-3">{customer.code}</td>
                    <td className="p-3">{customer.name}</td>
                    <td className="p-3">{customer.phone}</td>
                    <td className="p-3">{customer.email}</td>
                    <td className="p-3">{customer.country}</td>
                    <td className="p-3">{customer.city}</td>
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
            <div className="text-sm text-gray-600">1 - 10 of 15 | prev next</div>
          </div>
        </div>

        {/* Create Customer Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label className="text-sm font-medium">Customer Name *</label>
                <Input
                  placeholder="Customer Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
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
