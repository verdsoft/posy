"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Minus, Plus, X } from "lucide-react"
import { useState, useEffect } from "react"
import { fetchWarehouses, searchProducts } from "@/lib/api"
import { toast } from "sonner"
import type React from "react"

interface QuotationItem {
  id: string
  name: string
  code: string
  price: number
  stock: number
  quantity: number
  discount: number
  tax: number
  subtotal: number
}

interface Warehouse {
  id: string
  name: string
}

interface Customer {
  id: string
  name: string
}

export default function CreateQuotation() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [warehouseId, setWarehouseId] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<QuotationItem[]>([])
  const [items, setItems] = useState<QuotationItem[]>([])
  const [orderTax, setOrderTax] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [status, setStatus] = useState("pending")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch warehouses and customers on mount
  useEffect(() => {
    fetchWarehouses().then(setWarehouses)
    fetch("/api/customers")
      .then(res => res.json())
      .then(setCustomers)
      .catch(() => setCustomers([]))
  }, [])

  // Product search
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    try {
      const results = await searchProducts(searchQuery)
      setSearchResults(results.map((p: any) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        price: p.price,
        stock: p.stock,
        quantity: 1,
        discount: 0,
        tax: 0,
        subtotal: p.price,
      })))
      if (results.length === 0) toast.info("No products found")
    } catch (err: any) {
      toast.error(err.message || "Failed to search products")
    }
  }

  // Add product to quotation
  const addProduct = (product: QuotationItem) => {
    if (items.some(i => i.id === product.id)) {
      toast.error("Product already added")
      return
    }
    setItems([...items, product])
    setSearchQuery("")
    setSearchResults([])
  }

  // Update item quantity, discount, tax
  const updateItem = (id: string, field: keyof QuotationItem, value: number) => {
    setItems(items =>
      items.map(item =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              subtotal:
                (field === "quantity" || field === "discount" || field === "tax")
                  ? (item.price * (field === "quantity" ? value : item.quantity)) -
                    (field === "discount" ? value : item.discount) +
                    (field === "tax" ? value : item.tax)
                  : item.subtotal,
            }
          : item
      )
    )
  }

  // Remove item
  const removeItem = (id: string) => setItems(items => items.filter(i => i.id !== id))

  // Calculate totals
  const itemsSubtotal = items.reduce(
    (sum, item) => sum + (item.price * item.quantity - item.discount + item.tax),
    0
  )
  const taxAmount = orderTax ? (itemsSubtotal * orderTax) / 100 : 0
  const grandTotal = itemsSubtotal + taxAmount - discount + shipping

  // Submit quotation
  const handleSubmit = async () => {
    if (!date || !warehouseId || !customerId || items.length === 0) {
      toast.error("Please fill all required fields and add at least one product")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          warehouse_id: warehouseId,
          customer_id: customerId,
          items,
          order_tax: orderTax,
          discount,
          shipping,
          status,
          note,
        }),
      })
      if (!res.ok) throw new Error("Failed to create quotation")
      toast.success("Quotation created successfully")
      // Optionally redirect or reset form
    } catch (err: any) {
      toast.error(err.message || "Failed to create quotation")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Quotation List</span>
            <span>|</span>
            <span>Create Quotation</span>
          </div>
          <h1 className="text-2xl font-bold">Create Quotation</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Customer *</label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Warehouse *</label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium">Product</label>
            <div className="relative mt-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Scan/Search Product by Code Name"
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button type="button" variant="outline" onClick={handleSearch}>
                Search
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="bg-gray-50 border rounded mt-2 max-h-40 overflow-auto">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="px-4 py-2 hover:bg-purple-100 cursor-pointer flex justify-between items-center"
                    onClick={() => addProduct(product)}
                  >
                    <span>{product.code} - {product.name}</span>
                    <span className="text-xs text-gray-500">${product.price}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Order items *</h3>
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 border">#</th>
                    <th className="text-left p-3 border">Product</th>
                    <th className="text-left p-3 border">Net Unit Price</th>
                    <th className="text-left p-3 border">Stock</th>
                    <th className="text-left p-3 border">Qty</th>
                    <th className="text-left p-3 border">Discount</th>
                    <th className="text-left p-3 border">Tax</th>
                    <th className="text-left p-3 border">Subtotal</th>
                    <th className="text-left p-3 border"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-8 text-gray-500 border">
                        No data Available
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={item.id}>
                        <td className="p-3 border">{idx + 1}</td>
                        <td className="p-3 border">{item.name}</td>
                        <td className="p-3 border">${item.price}</td>
                        <td className="p-3 border">{item.stock}</td>
                        <td className="p-3 border">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => updateItem(item.id, "quantity", Math.max(1, item.quantity - 1))}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="mx-2 text-sm w-6 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => updateItem(item.id, "quantity", item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-3 border">
                          <Input
                            type="number"
                            min={0}
                            value={item.discount}
                            onChange={e => updateItem(item.id, "discount", Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                        <td className="p-3 border">
                          <Input
                            type="number"
                            min={0}
                            value={item.tax}
                            onChange={e => updateItem(item.id, "tax", Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                        <td className="p-3 border">${(item.price * item.quantity - item.discount + item.tax).toFixed(2)}</td>
                        <td className="p-3 border">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-500"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Order Tax (%)</label>
                  <Input
                    type="number"
                    min={0}
                    value={orderTax}
                    onChange={e => setOrderTax(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Discount</label>
                  <Input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Shipping</label>
                  <Input
                    type="number"
                    min={0}
                    value={shipping}
                    onChange={e => setShipping(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status *</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Note</label>
                <Textarea
                  placeholder="A few words ..."
                  className="mt-1"
                  rows={4}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              <Button
                className="bg-[#1a237e] hover:bg-[#23308c] text-white"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Order Tax</span>
                    <span>
                      ${taxAmount.toFixed(2)} ({orderTax.toFixed(2)} %)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>${discount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Grand Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
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