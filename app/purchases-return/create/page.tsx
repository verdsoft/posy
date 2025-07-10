"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search } from "lucide-react"

export default function CreatePurchaseReturn() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Purchase Return List</span>
            <span>|</span>
            <span>Create Purchase Return</span>
          </div>
          <h1 className="text-2xl font-bold">Create Purchase Return</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input type="date" defaultValue="2025-07-01" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Supplier *</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier1">Supplier 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Warehouse *</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="karigamombe">Karigamombe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium">Product</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Scan/Search Product by Code Name" className="pl-10" />
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Order Items *</h3>
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 border">#</th>
                    <th className="text-left p-3 border">Product</th>
                    <th className="text-left p-3 border">Net Unit Cost</th>
                    <th className="text-left p-3 border">Stock</th>
                    <th className="text-left p-3 border">Qty</th>
                    <th className="text-left p-3 border">Discount</th>
                    <th className="text-left p-3 border">Tax</th>
                    <th className="text-left p-3 border">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500 border">
                      No data Available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Order Tax</label>
                  <div className="flex mt-1">
                    <Input placeholder="0" className="rounded-r-none" />
                    <Button variant="outline" className="rounded-l-none px-3 bg-transparent">
                      %
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Discount</label>
                  <div className="flex mt-1">
                    <Input placeholder="0" className="rounded-r-none" />
                    <Button variant="outline" className="rounded-l-none px-3 bg-transparent">
                      $
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Shipping</label>
                  <div className="flex mt-1">
                    <Input placeholder="0" className="rounded-r-none" />
                    <Button variant="outline" className="rounded-l-none px-3 bg-transparent">
                      $
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status *</label>
                <Select defaultValue="received">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Note</label>
                <Textarea placeholder="A few words ..." className="mt-1" rows={4} />
              </div>

              <Button className="bg-purple-600 hover:bg-purple-700">Submit</Button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Order Tax</span>
                    <span>$ 0.00 (0.00 %)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>$ 0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>$ 0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Grand Total</span>
                    <span>$ 0.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
