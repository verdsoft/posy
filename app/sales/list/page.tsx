"use client"

import { useEffect, useState } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Eye, Edit, CreditCard, FileText, Download, Mail, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type React from "react"
import  {Sale} from "@/lib/types/api"


export default function SaleList() {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  // Fetch sales from API
  useEffect(() => {
    fetch("/api/pos/sales")
      .then(res => res.json())
      .then(data => {
        setSales(data)
        setLoading(false)
      })
  }, [])

  // Filtered sales
  const filteredSales = sales.filter(sale =>
    sale.reference?.toLowerCase().includes(search.toLowerCase()) ||
    sale.customer_id?.toString().toLowerCase().includes(search.toLowerCase())
 ||
    sale.status?.toLowerCase().includes(search.toLowerCase())
  )

  // Delete sale
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sale?")) return
    const res = await fetch(`/api/pos/sales?id=${id}`, { method: "DELETE" })
    if (res.ok) {
      setSales(sales.filter(sale => sale.id.toString() !== id))
    } else {
      alert("Failed to delete sale")
    }
  }

  // PDF/Excel export stubs
  const handleExportPDF = () => {
    alert("PDF export not implemented yet.")
  }
  const handleExportExcel = () => {
    alert("Excel export not implemented yet.")
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Sales</span>
            <span>|</span>
            <span>Sale List</span>
          </div>
          <h1 className="text-2xl font-bold">Sale List</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  placeholder="Search this table..."
                  className="w-64"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="text-blue-600 bg-transparent">
                🔍 Filter
              </Button>
              <Button
                variant="outline"
                className="text-green-600 bg-transparent"
                onClick={handleExportPDF}
              >
                📄 PDF
              </Button>
              <Button
                variant="outline"
                className="text-orange-600 bg-transparent"
                onClick={handleExportExcel}
              >
                📊 EXCEL
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">➕ Create</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3">
                    <input type="checkbox" />
                  </th>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Reference</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Warehouse</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Grand Total</th>
                  <th className="text-left p-3">Paid</th>
                  <th className="text-left p-3">Due</th>
                  <th className="text-left p-3">Payment Status</th>
                  <th className="text-left p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={11} className="text-center p-6">Loading...</td>
                  </tr>
                ) : filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center p-6">No sales found.</td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <input type="checkbox" />
                      </td>
                      <td className="p-3">{sale.date}</td>
                      <td className="p-3">{sale.reference}</td>
                      <td className="p-3">{sale.customer_name}</td>
                      <td className="p-3">{sale.warehouse_name}</td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">{sale.status}</span>
                      </td>
                      <td className="p-3">{Number(sale.total).toFixed(2)}</td>
                      <td className="p-3">{Number(sale.paid).toFixed(2)}</td>
                      <td className="p-3">{Number(sale.due).toFixed(2)}</td>
                      <td className="p-3">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {sale.payment_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Sale Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Sale
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Show
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Create Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="h-4 w-4 mr-2" />
                              Invoice POS
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download Pdf
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Sale on Email
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(sale.id.toString())}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - {filteredSales.length} of {sales.length} | prev next</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}