"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, X, Minus, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type React from "react"

interface Product {
  id: string
  name: string
  code: string
  price: number
  quantity: number
}

interface CartItem {
  id: string
  product_id: string
  sale_item_id?: string
  name: string
  price: number
  quantity: number
  discount: number
  tax: number
  subtotal: number
  maxQuantity: number
}

export default function CreateSalesReturn() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<{id: string, name: string}[]>([])
  const [warehouses, setWarehouses] = useState<{id: string, name: string}[]>([])
  const [sales, setSales] = useState<{id: string, reference: string}[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState("")
  const [selectedSale, setSelectedSale] = useState("")
  const [taxRate, setTaxRate] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [status, setStatus] = useState("completed")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [saleItems, setSaleItems] = useState<any[]>([])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch customers
        const customersRes = await fetch('/api/customers')
        const customersData = await customersRes.json()
        setCustomers(customersData)
        
        // Fetch warehouses
        const warehousesRes = await fetch('/api/settings/warehouses')
        const warehousesData = await warehousesRes.json()
        setWarehouses(warehousesData)
        
        // Fetch recent sales
        const salesRes = await fetch('/api/pos/sales?limit=50')
        const salesData = await salesRes.json()
        setSales(salesData.data || [])
        
      } catch (error) {
        toast.error("Failed to load initial data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Fetch sale items when sale is selected
  useEffect(() => {
    const fetchSaleItems = async () => {
      if (!selectedSale) return
      
      try {
        const res = await fetch(`/api/pos/sales/${selectedSale}`)
        if (!res.ok) throw new Error("Failed to fetch sale items")
        const data = await res.json()
        setSaleItems(data.items || [])
        
        // Set customer from sale
        if (data.customer_id) {
          setSelectedCustomer(data.customer_id)
        }
        
        // Set warehouse from sale
        if (data.warehouse_id) {
          setSelectedWarehouse(data.warehouse_id)
        }
        
      } catch (error) {
        toast.error("Failed to load sale items")
        console.error(error)
      }
    }
    
    fetchSaleItems()
  }, [selectedSale])

  // Search products
  useEffect(() => {
    const searchProducts = async () => {
      if (searchTerm.trim()) {
        try {
          const res = await fetch(`/api/products?search=${searchTerm}`)
          const data = await res.json()
          setProducts(data)
        } catch (error) {
          toast.error("Failed to search products")
          console.error(error)
        }
      }
    }
    
    const timer = setTimeout(searchProducts, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount + shipping - discount

  // Cart functions
  const addToCart = (product: Product) => {
    // Find if this product exists in the original sale
    const saleItem = saleItems.find(item => item.product_id === product.id)
    const maxQty = saleItem ? saleItem.quantity : 0
    
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product_id === product.id)
      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + 1, maxQty)
        return prev.map(item => 
          item.product_id === product.id 
            ? { 
                ...item, 
                quantity: newQty,
                subtotal: newQty * item.price
              } 
            : item
        )
      } else {
        return [
          ...prev,
          {
            id: Date.now().toString(),
            product_id: product.id,
            sale_item_id: saleItem?.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            discount: 0,
            tax: 0,
            subtotal: product.price,
            maxQuantity: maxQty
          }
        ]
      }
    })
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
              subtotal: quantity * item.price
            } 
          : item
      ))
    }
  }

  const updateItemPrice = (id: string, price: number) => {
    setCartItems(cartItems.map(item => 
      item.id === id 
        ? { 
            ...item, 
            price,
            subtotal: item.quantity * price
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

    if (!selectedCustomer || !selectedWarehouse || !selectedSale) {
      toast.error("Please select customer, warehouse and sale")
      return
    }

    setIsLoading(true)
    
    try {
      const returnData = {
        sale_id: selectedSale,
        customer_id: selectedCustomer,
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
          sale_item_id: item.sale_item_id,
          quantity: item.quantity,
          unit_price: item.price,
          discount: item.discount,
          tax: item.tax,
          subtotal: item.subtotal
        }))
      }

      const response = await fetch('/api/sales-returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(returnData)
      })

      if (!response.ok) {
        throw new Error('Failed to create sales return')
      }

      toast.success("Sales return created successfully")
      router.push('/sales-returns/list')
    } catch (error) {
      toast.error("Failed to create sales return")
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
            <span>Sales Return List</span>
            <span>|</span>
            <span>Create Sales Return</span>
          </div>
          <h1 className="text-2xl font-bold">Create Sales Return</h1>
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
              <label className="text-sm font-medium">Sale Reference *</label>
              <Select 
                value={selectedSale}
                onValueChange={setSelectedSale}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Sale" />
                </SelectTrigger>
                <SelectContent>
                  {sales.map(sale => (
                    <SelectItem key={sale.id} value={sale.id}>
                      {sale.reference}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Customer *</label>
              <Select 
                value={selectedCustomer}
                onValueChange={setSelectedCustomer}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
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
              />
            </div>
            
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
                      ${product.price}
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
                    <th className="text-left p-3 border">Net Unit Price</th>
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
                            value={item.price}
                            onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value))}
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
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
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
                className="bg-purple-600 hover:bg-purple-700"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Submit"}
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