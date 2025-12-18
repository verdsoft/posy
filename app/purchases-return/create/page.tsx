"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, X, Minus, Plus, Check, ChevronsUpDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type React from "react"
import { useGetSuppliersQuery } from "@/lib/slices/suppliersApi"
import { useGetWarehousesQuery } from "@/lib/slices/warehousesApi"
import { useGetPurchasesQuery, useGetPurchaseByIdQuery } from "@/lib/slices/purchasesApi"
import { useCreatePurchaseReturnMutation } from "@/lib/slices/returnsApi"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Product {
  id: string
  name: string
  code: string
  cost: number
  quantity: number
}

interface CartItem {
  id: string
  product_id: string
  purchase_item_id?: string
  name: string
  cost: number
  quantity: number
  discount: number
  tax: number
  subtotal: number
  maxQuantity: number
}

export default function CreatePurchaseReturn() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSupplier, setSelectedSupplier] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState("")
  const [selectedPurchase, setSelectedPurchase] = useState("")
  const [openPurchase, setOpenPurchase] = useState(false)
  const [taxRate, setTaxRate] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [status, setStatus] = useState("completed")
  const [notes, setNotes] = useState("")
  const [purchaseItems, setPurchaseItems] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([]) // Added missing state
  const [isLoading, setIsLoading] = useState(false) // Added missing state

  // RTK Query hooks
  const { data: suppliersData } = useGetSuppliersQuery({ page: 1, limit: 1000, search: "" })
  const { data: warehousesData } = useGetWarehousesQuery()
  const { data: purchasesData, isLoading: isPurchasesLoading } = useGetPurchasesQuery({ page: 1, limit: 100, search: "" })
  const { data: purchaseData } = useGetPurchaseByIdQuery(selectedPurchase, { skip: !selectedPurchase })
  const [createPurchaseReturn, { isLoading: isCreatingReturn }] = useCreatePurchaseReturnMutation()

  const suppliers = suppliersData?.data || []
  const warehouses = warehousesData || []
  const purchases = purchasesData?.data || []

  // Load purchase items when purchase is selected
  useEffect(() => {
    if (purchaseData) {
      const items = purchaseData.purchase_items || []
      setPurchaseItems(items)
      setSelectedSupplier(String(purchaseData.supplier_id || ""))
      setSelectedWarehouse(String(purchaseData.warehouse_id || ""))
      setTaxRate(Number(purchaseData.tax_rate) || 0)
      setDiscount(Number(purchaseData.discount) || 0)
      setShipping(Number(purchaseData.shipping) || 0)

      // Clear cart when purchase changes
      setCartItems([])
    }
  }, [purchaseData])

  // Show warning if no purchases available
  useEffect(() => {
    if (!isPurchasesLoading && purchases.length === 0) {
      toast.error("No purchases found. Please create some purchases first.")
    }
  }, [purchases, isPurchasesLoading])

  // Search products - FIXED: Use purchase items instead of external API
  useEffect(() => {
    const searchProducts = () => {
      if (searchTerm.trim() && purchaseItems.length > 0) {
        const filtered = purchaseItems.filter(item =>
          item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
        ).map(item => ({
          id: item.product_id,
          name: item.product_name || `Product ${item.product_id}`,
          code: item.product_code || 'N/A',
          cost: Number(item.unit_cost) || 0,
          quantity: Number(item.quantity) || 0
        }))
        setProducts(filtered)
      } else {
        setProducts([])
      }
    }

    const timer = setTimeout(searchProducts, 300)
    return () => clearTimeout(timer)
  }, [searchTerm, purchaseItems])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount + shipping - discount

  // Cart functions
  const addToCart = (product: Product) => {
    // Find if this product exists in the original purchase
    const purchaseItem = purchaseItems.find(item => item.product_id === product.id)
    const maxQty = purchaseItem ? purchaseItem.quantity : 0

    // Check if we've already returned the maximum quantity
    const existingItem = cartItems.find(item => item.product_id === product.id)
    const alreadyReturnedQty = existingItem ? existingItem.quantity : 0

    if (alreadyReturnedQty >= maxQty) {
      toast.error(`Maximum return quantity (${maxQty}) reached for this product`)
      return
    }

    setCartItems(prev => {
      const existingItem = prev.find(item => item.product_id === product.id)
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + 1, maxQty)
        return prev.map(item =>
          item.product_id === product.id
            ? {
              ...item,
              quantity: newQty,
              subtotal: newQty * item.cost
            }
            : item
        )
      } else {
        return [
          ...prev,
          {
            id: Date.now().toString(),
            product_id: product.id,
            purchase_item_id: purchaseItem?.id,
            name: product.name,
            cost: product.cost,
            quantity: 1,
            discount: 0,
            tax: 0,
            subtotal: product.cost,
            maxQuantity: maxQty
          }
        ]
      }
    })

    // Clear search after adding
    setSearchTerm("")
    setProducts([])
  }

  const updateQuantity = (id: string, quantity: number) => {
    const item = cartItems.find(item => item.id === id)
    if (!item) return

    quantity = Math.max(0, Math.min(quantity, item.maxQuantity))

    if (quantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id))
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id
          ? {
            ...item,
            quantity,
            subtotal: quantity * item.cost
          }
          : item
      ))
    }
  }

  const updateItemCost = (id: string, cost: number) => {
    setCartItems(cartItems.map(item =>
      item.id === id
        ? {
          ...item,
          cost,
          subtotal: item.quantity * cost
        }
        : item
    ))
  }

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  // Submit form
  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      toast.error("Please add at least one product")
      return
    }

    if (!selectedSupplier || !selectedWarehouse || !selectedPurchase) {
      toast.error("Please select supplier, warehouse and purchase")
      return
    }

    setIsLoading(true)

    try {
      const returnData = {
        purchase_id: selectedPurchase,
        supplier_id: selectedSupplier,
        warehouse_id: selectedWarehouse,
        date: new Date().toISOString().slice(0, 10),
        subtotal,
        tax_rate: taxRate,
        tax_amount: taxAmount,
        discount,
        shipping,
        total,
        status,
        notes,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          purchase_item_id: item.purchase_item_id,
          quantity: item.quantity,
          unit_cost: item.cost,
          discount: item.discount,
          tax: item.tax,
          subtotal: item.subtotal
        }))
      }

      await createPurchaseReturn(returnData).unwrap()
      toast.success("Purchase return created successfully")
      router.push('/purchases-return/list')
    } catch (error: any) {
      const message = error?.data?.error || "Failed to create purchase return"
      toast.error(message)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

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
              <Input
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Purchase Reference *</label>
              <Popover open={openPurchase} onOpenChange={setOpenPurchase}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openPurchase}
                    className={cn(
                      "w-full justify-between mt-1",
                      !selectedPurchase && "text-muted-foreground"
                    )}
                    disabled={purchases.length === 0}
                  >
                    {selectedPurchase
                      ? purchases.find((purchase) => purchase.id === selectedPurchase)?.reference
                      : purchases.length === 0 ? "No purchases available" : "Select Purchase"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search purchase reference..." />
                    <CommandList>
                      <CommandEmpty>No purchase found.</CommandEmpty>
                      <CommandGroup>
                        {purchases.map((purchase) => (
                          <CommandItem
                            key={purchase.id}
                            value={purchase.reference}
                            onSelect={() => {
                              setSelectedPurchase(purchase.id === selectedPurchase ? "" : purchase.id)
                              setOpenPurchase(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedPurchase === purchase.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {purchase.reference}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {purchases.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  No purchases found. Please create some purchases first to create purchase returns.
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium">Supplier *</label>
              <Select
                value={selectedSupplier}
                onValueChange={setSelectedSupplier}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Warehouse *</label>
              <Select
                value={selectedWarehouse}
                onValueChange={setSelectedWarehouse}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium">Product</label>
            <div className="relative mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Scan/Search Product by Code Name"
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={!selectedPurchase}
              />
            </div>

            {!selectedPurchase && (
              <p className="text-sm text-gray-500 mt-1">
                Please select a purchase first to search products
              </p>
            )}

            {/* Product search results */}
            {searchTerm && products.length > 0 && (
              <div className="mt-2 border rounded-md max-h-60 overflow-auto">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="p-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b"
                    onClick={() => addToCart(product)}
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.code}</div>
                    </div>
                    <div className="text-sm font-semibold">
                      ${product.cost}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Return Items *</h3>
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 border">#</th>
                    <th className="text-left p-3 border">Product</th>
                    <th className="text-left p-3 border">Net Unit Cost</th>
                    <th className="text-left p-3 border">Max Qty</th>
                    <th className="text-left p-3 border">Qty</th>
                    <th className="text-left p-3 border">Subtotal</th>
                    <th className="text-left p-3 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-gray-500 border">
                        No items added
                      </td>
                    </tr>
                  ) : (
                    cartItems.map((item, index) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-3 border">{index + 1}</td>
                        <td className="p-3 border">
                          <div className="font-medium">{item.name}</div>
                        </td>
                        <td className="p-3 border">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.cost}
                            onChange={(e) => updateItemCost(item.id, parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </td>
                        <td className="p-3 border text-center">
                          {item.maxQuantity}
                        </td>
                        <td className="p-3 border">
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              max={item.maxQuantity}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                              className="w-16 text-center"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                        <td className="p-3 border">${item.subtotal.toFixed(2)}</td>
                        <td className="p-3 border">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                          >
                            <X className="h-4 w-4 text-red-500" />
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
                  <label className="text-sm font-medium">Order Tax</label>
                  <div className="flex mt-1">
                    <Input
                      placeholder="0"
                      className="rounded-r-none"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    />
                    <Button variant="outline" className="rounded-l-none px-3 bg-transparent">
                      %
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Discount</label>
                  <div className="flex mt-1">
                    <Input
                      placeholder="0"
                      className="rounded-r-none"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    />
                    <Button variant="outline" className="rounded-l-none px-3 bg-transparent">
                      $
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Shipping</label>
                  <div className="flex mt-1">
                    <Input
                      placeholder="0"
                      className="rounded-r-none"
                      value={shipping}
                      onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                    />
                    <Button variant="outline" className="rounded-l-none px-3 bg-transparent">
                      $
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status *</label>
                <Select
                  value={status}
                  onValueChange={setStatus}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Note</label>
                <Textarea
                  placeholder="A few words ..."
                  className="mt-1"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                className="bg-[#1a237e] hover:bg-purple-700"
                onClick={handleSubmit}
                disabled={isLoading || isCreatingReturn}
              >
                {(isLoading || isCreatingReturn) ? "Processing..." : "Submit"}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Tax</span>
                    <span>${taxAmount.toFixed(2)} = (${taxRate}%)</span>
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
                    <span>${total.toFixed(2)}</span>
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