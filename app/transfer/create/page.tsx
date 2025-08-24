"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Trash2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useCreateTransferMutation } from "@/lib/slices/transfersApi"

interface TransferItem {
  id: string
  productName: string
  netUnitCost: number
  stock: number
  quantity: number
  discount: number
  tax: number
  subtotal: number
}

export default function CreateTransferPage() {
  const [createTransfer, { isLoading }] = useCreateTransferMutation()
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    fromWarehouse: "",
    toWarehouse: "",
    orderTax: 0,
    discount: 0,
    shipping: 0,
    status: "completed",
    note: "",
  })

  const [items, setItems] = useState<TransferItem[]>([])
  const [productSearch, setProductSearch] = useState("")

  const warehouses = ["Main Warehouse", "Karigamombe", "Default Warehouse", "Secondary Warehouse"]

  const mockProducts = [
    { id: "1", name: "Laptop Dell Inspiron", cost: 800, stock: 15 },
    { id: "2", name: "Office Chair", cost: 150, stock: 8 },
    { id: "3", name: "Wireless Mouse", cost: 25, stock: 50 },
  ]

  const addProduct = (product: any) => {
    const newItem: TransferItem = {
      id: Date.now().toString(),
      productName: product.name,
      netUnitCost: product.cost,
      stock: product.stock,
      quantity: 1,
      discount: 0,
      tax: 0,
      subtotal: product.cost,
    }
    setItems([...items, newItem])
    setProductSearch("")
  }

  const updateItem = (id: string, field: keyof TransferItem, value: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "discount" || field === "tax") {
            const subtotal = updated.netUnitCost * updated.quantity - updated.discount + updated.tax
            updated.subtotal = subtotal
          }
          return updated
        }
        return item
      }),
    )
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)
    const total = subtotal + formData.orderTax - formData.discount + formData.shipping
    return { subtotal, total }
  }

  const { subtotal, total } = calculateTotals()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      date: formData.date,
      from_warehouse_id: formData.fromWarehouse,
      to_warehouse_id: formData.toWarehouse,
      status: formData.status,
      notes: formData.note,
      items: items.map((it) => ({ product_id: it.id, quantity: it.quantity, cost: it.netUnitCost })),
    }
    try {
      await createTransfer(payload).unwrap()
      // Ideally route to list or show toast; keeping simple
    } catch (err) {
      // swallow error to avoid crash
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <nav className="text-sm text-gray-600 mb-2">Transfer &gt; Create Transfer</nav>
          <h1 className="text-2xl font-bold">Create Transfer</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fromWarehouse">From Warehouse *</Label>
                  <Select
                    value={formData.fromWarehouse}
                    onValueChange={(value) => setFormData({ ...formData, fromWarehouse: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse} value={warehouse}>
                          {warehouse}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="toWarehouse">To Warehouse *</Label>
                  <Select
                    value={formData.toWarehouse}
                    onValueChange={(value) => setFormData({ ...formData, toWarehouse: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse} value={warehouse}>
                          {warehouse}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Label htmlFor="productSearch">Product</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="productSearch"
                    placeholder="Scan/Search Product by Code Name"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {productSearch && (
                  <div className="mt-2 border rounded-md bg-white shadow-sm">
                    {mockProducts
                      .filter((product) => product.name.toLowerCase().includes(productSearch.toLowerCase()))
                      .map((product) => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                          onClick={() => addProduct(product)}
                        >
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-500">
                            Cost: ${product.cost} | Stock: {product.stock}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">#</th>
                      <th className="border border-gray-200 p-2 text-left">Product</th>
                      <th className="border border-gray-200 p-2 text-left">Net Unit Cost</th>
                      <th className="border border-gray-200 p-2 text-left">Stock</th>
                      <th className="border border-gray-200 p-2 text-left">Qty</th>
                      <th className="border border-gray-200 p-2 text-left">Discount</th>
                      <th className="border border-gray-200 p-2 text-left">Tax</th>
                      <th className="border border-gray-200 p-2 text-left">Subtotal</th>
                      <th className="border border-gray-200 p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="border border-gray-200 p-4 text-center text-gray-500">
                          No data Available
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="border border-gray-200 p-2">{index + 1}</td>
                          <td className="border border-gray-200 p-2">{item.productName}</td>
                          <td className="border border-gray-200 p-2">${item.netUnitCost}</td>
                          <td className="border border-gray-200 p-2">{item.stock}</td>
                          <td className="border border-gray-200 p-2">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                              className="w-20"
                              min="1"
                            />
                          </td>
                          <td className="border border-gray-200 p-2">
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, "discount", Number.parseFloat(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="border border-gray-200 p-2">
                            <Input
                              type="number"
                              value={item.tax}
                              onChange={(e) => updateItem(item.id, "tax", Number.parseFloat(e.target.value) || 0)}
                              className="w-20"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="border border-gray-200 p-2">${item.subtotal}</td>
                          <td className="border border-gray-200 p-2">
                            <Button type="button" variant="destructive" size="sm" onClick={() => removeItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="orderTax">Order Tax</Label>
                      <div className="relative">
                        <Input
                          id="orderTax"
                          type="number"
                          value={formData.orderTax}
                          onChange={(e) =>
                            setFormData({ ...formData, orderTax: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="pr-8"
                          step="0.01"
                        />
                        <span className="absolute right-3 top-3 text-gray-400">%</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="discount">Discount</Label>
                      <div className="relative">
                        <Input
                          id="discount"
                          type="number"
                          value={formData.discount}
                          onChange={(e) =>
                            setFormData({ ...formData, discount: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="pr-8"
                          step="0.01"
                        />
                        <span className="absolute right-3 top-3 text-gray-400">$</span>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="shipping">Shipping</Label>
                      <div className="relative">
                        <Input
                          id="shipping"
                          type="number"
                          value={formData.shipping}
                          onChange={(e) =>
                            setFormData({ ...formData, shipping: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="pr-8"
                          step="0.01"
                        />
                        <span className="absolute right-3 top-3 text-gray-400">$</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="note">Note</Label>
                    <Textarea
                      id="note"
                      placeholder="A few words..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      rows={4}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span>Order Tax</span>
                      <span>
                        ${formData.orderTax} ({((formData.orderTax / 100) * subtotal)} %)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>$ {formData.discount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>$ {formData.shipping}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Grand Total</span>
                      <span>$ {total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
              {isLoading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
