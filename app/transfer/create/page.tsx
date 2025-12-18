"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Trash2, Plus, Loader2 } from "lucide-react"
import DashboardLayout from "@/components/dashboard-layout"
import { useCreateTransferMutation } from "@/lib/slices/transfersApi"
import { useGetWarehousesQuery } from "@/lib/slices/warehousesApi"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import AuthGuard from "@/components/AuthGuard"

interface TransferItem {
  id: string
  product_id: string
  code: string
  name: string
  stock: number
  quantity: number
  cost: number
  discount: number
  tax: number
  subtotal: number
}

export default function CreateTransferPage() {
  const router = useRouter()
  const [createTransfer, { isLoading }] = useCreateTransferMutation()
  const { data: warehouses } = useGetWarehousesQuery()

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    from_warehouse_id: "",
    to_warehouse_id: "",
    shipping: 0,
    status: "completed",
    notes: "",
  })

  // We are not doing tax/discount on transfer level in the simplified schema, but if needed we can add.
  // The Prisma schema for Transfer usually has: date, reference, from_warehouse_id, to_warehouse_id, items, status, notes, grand_total.
  // We'll calculate grand_total from items + shipping.

  const [items, setItems] = useState<TransferItem[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!productSearch.trim()) return
    setIsSearching(true)
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(productSearch)}`)
      const data = await res.json()
      setSearchResults(data)
    } catch (err) {
      console.error(err)
      toast.error("Failed to search products")
    } finally {
      setIsSearching(false)
    }
  }

  const addProduct = (product: any) => {
    if (items.some((i) => i.product_id === product.id)) {
      toast.warning("Product already added")
      return
    }
    const newItem: TransferItem = {
      id: Date.now().toString(),
      product_id: product.id,
      code: product.code,
      name: product.name,
      stock: product.stock,
      quantity: 1,
      cost: Number(product.cost) || 0,
      discount: 0,
      tax: 0,
      subtotal: Number(product.cost) || 0,
    }
    setItems([...items, newItem])
    setProductSearch("")
    setSearchResults([])
  }

  const updateItem = (id: string, field: keyof TransferItem, value: number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "cost" || field === "tax" || field === "discount") {
            // Subtotal calculation: (Cost * Qty) + Tax - Discount
            const rawSubtotal = (updated.cost * updated.quantity) + updated.tax - updated.discount;
            updated.subtotal = rawSubtotal > 0 ? rawSubtotal : 0;
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
    const grand_total = subtotal + formData.shipping
    return { subtotal, grand_total }
  }

  const { subtotal, grand_total } = calculateTotals()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.from_warehouse_id || !formData.to_warehouse_id) {
      toast.error("Please select both source and destination warehouses")
      return;
    }
    if (formData.from_warehouse_id === formData.to_warehouse_id) {
      toast.error("Source and destination warehouses cannot be the same")
      return;
    }
    if (items.length === 0) {
      toast.error("Please add at least one product")
      return;
    }

    const payload = {
      ...formData,
      from_warehouse_id: parseInt(formData.from_warehouse_id),
      to_warehouse_id: parseInt(formData.to_warehouse_id),
      items: items.map((it) => ({
        product_id: parseInt(it.product_id),
        quantity: it.quantity,
        net_unit_cost: it.cost,
        discount: it.discount,
        tax: it.tax,
        subtotal: it.subtotal
      })),
      grand_total,
      items_count: items.reduce((acc, item) => acc + item.quantity, 0),
      reference: `TR-${Date.now()}`,
      user_id: localStorage.getItem('UserId')
    }

    try {
      await createTransfer(payload).unwrap()
      toast.success("Transfer created successfully")
      router.push("/transfer/list")
    } catch (err: any) {
      console.error("Failed to create transfer:", err)
      const message = err?.data?.error || "Failed to create transfer"
      toast.error(message)
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>Transfer</span>
              <span>|</span>
              <span>Create Transfer</span>
            </div>
            <h1 className="text-xl font-semibold">Create Transfer</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base">Transfer Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-xs">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="h-9"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromWarehouse" className="text-xs">From Warehouse *</Label>
                    <Select
                      value={formData.from_warehouse_id}
                      onValueChange={(value) => setFormData({ ...formData, from_warehouse_id: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choose Warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses?.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="toWarehouse" className="text-xs">To Warehouse *</Label>
                    <Select
                      value={formData.to_warehouse_id}
                      onValueChange={(value) => setFormData({ ...formData, to_warehouse_id: value })}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Choose Warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses?.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base">Products</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="mb-4">
                  <Label htmlFor="productSearch" className="text-xs">Product</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="productSearch"
                        placeholder="Scan/Search Product by Code or Name"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                        className="pl-10 h-9"
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9"
                      onClick={handleSearch}
                      disabled={isSearching}
                    >
                      Search
                    </Button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="mt-2 border rounded-md bg-white shadow-sm max-h-60 overflow-y-auto">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
                          onClick={() => addProduct(product)}
                        >
                          <div>
                            <div className="font-medium text-sm">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Code: {product.code} | Cost: ${product.cost} | Stock: {product.stock}
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-primary" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-[#f8f9fa]">
                      <tr>
                        <th className="p-2 text-left font-medium">#</th>
                        <th className="p-2 text-left font-medium">Product</th>
                        <th className="p-2 text-left font-medium">Net Unit Cost</th>
                        <th className="p-2 text-left font-medium">Stock</th>
                        <th className="p-2 text-left font-medium">Qty</th>
                        {/*   <th className="p-2 text-left font-medium">Discount</th>
                      <th className="p-2 text-left font-medium">Tax</th> */}
                        <th className="p-2 text-left font-medium">Subtotal</th>
                        <th className="p-2 text-left font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-8 text-center text-muted-foreground">
                            No products added yet
                          </td>
                        </tr>
                      ) : (
                        items.map((item, index) => (
                          <tr key={item.id}>
                            <td className="p-2">{index + 1}</td>
                            <td className="p-2">
                              <div>{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.code}</div>
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={item.cost}
                                onChange={(e) => updateItem(item.id, "cost", parseFloat(e.target.value) || 0)}
                                className="w-24 h-8 text-xs"
                                min="0"
                              />
                            </td>
                            <td className="p-2">{item.stock}</td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                                className="w-20 h-8 text-xs"
                                min="1"
                              />
                            </td>
                            {/*  <td className="p-2">
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateItem(item.id, "discount", parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-xs"
                              min="0"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={item.tax}
                              onChange={(e) => updateItem(item.id, "tax", parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-xs"
                              min="0"
                            />
                          </td> */}
                            <td className="p-2 font-medium">${item.subtotal.toFixed(2)}</td>
                            <td className="p-2">
                              <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
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
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="shipping" className="text-xs">Shipping</Label>
                        <div className="relative">
                          <Input
                            id="shipping"
                            type="number"
                            value={formData.shipping}
                            onChange={(e) =>
                              setFormData({ ...formData, shipping: parseFloat(e.target.value) || 0 })
                            }
                            className="pr-8 h-9"
                            step="0.01"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="status" className="text-xs">Status *</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="note" className="text-xs">Note</Label>
                      <Textarea
                        id="note"
                        placeholder="A few words..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>$ {formData.shipping.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <div className="flex justify-between font-bold text-lg">
                      <span>Grand Total</span>
                      <span>$ {grand_total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/transfer/list')}>Cancel</Button>
              <Button type="submit" className="bg-[#1a237e] hover:bg-purple-700" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : 'Submit'}
              </Button>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
