"use client"

import DashboardLayout from "../../../components/dashboard-layout"
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
  name: string
  price: number
  quantity: number
  discount: number
  tax: number
  subtotal: number
}

export default function CreateSale() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<{id: string, name: string}[]>([])
  const [warehouses, setWarehouses] = useState<{id: string, name: string}[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState("")
  const [taxRate, setTaxRate] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [status, setStatus] = useState("completed")
  const [paymentStatus, setPaymentStatus] = useState("pending")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch customers
        const customersRes = await fetch('/api/customers')
        const customersData = await customersRes.json()
        setCustomers(customersData)
        if (customersData.length > 0) setSelectedCustomer(customersData[0].id)
        
        // Fetch warehouses
        const warehousesRes = await fetch('/api/settings/warehouses')
        const warehousesData = await warehousesRes.json()
        setWarehouses(warehousesData)
        if (warehousesData.length > 0) setSelectedWarehouse(warehousesData[0].id)
        
        // Fetch products if no search term
        if (!searchTerm.trim()) {
          const productsRes = await fetch('/api/products')
          const productsData = await productsRes.json()
          setProducts(productsData)
        }
      } catch (error) {
        toast.error("Failed to load initial data")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

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
  const taxAmount = Number(subtotal) * (taxRate / 100)
  const total = Number(subtotal) + Number(taxAmount) + Number(shipping) - Number(discount) // shipping - discount

  // Cart functions
  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product_id === product.id)
      if (existingItem) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price
              } 
            : item
        )
      } else {
        return [
          ...prev,
          {
            id: Date.now().toString(),
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            discount: 0,
            tax: 0,
            subtotal: product.price
          }
        ]
      }
    })
  }

  const updateQuantity = (id: string, quantity: number) => {
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

    if (!selectedCustomer || !selectedWarehouse) {
      toast.error("Please select customer and warehouse")
      return
    }

    setIsLoading(true)
    
    try {
      const saleData = {
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
        payment_status: paymentStatus,
        notes,
        items: cartItems.map(item => ({
        product_id: item.product_id,  
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        tax: item.tax,
        subtotal: item.subtotal
      }))
      }

      const response = await fetch('/api/pos/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData)
      })

      if (!response.ok) {
        throw new Error('Failed to create sale')
      }

      toast.success("Sale created successfully")
      router.push('/sales/list')
    } catch (error) {
      toast.error("Failed to create sale")
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
            <span>Sale List</span>
            <span>|</span>
            <span>Create Sale</span>
          </div>
          <h1 className="text-2xl font-bold">Create Sale</h1>
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
                      <span className="ml-2 text-gray-500">Stock: {product.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3">Order Items *</h3>
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 border">#</th>
                    <th className="text-left p-3 border">Product</th>
                    <th className="text-left p-3 border">Net Unit Price</th>
                    <th className="text-left p-3 border">Qty</th>
                    <th className="text-left p-3 border">Subtotal</th>
                    <th className="text-left p-3 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 border">
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
                        <td className="p-3 border">${item.subtotal}</td>
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

              <div className="grid grid-cols-2 gap-4">
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
                  <label className="text-sm font-medium">Payment Status</label>
                  <Select
                    value={paymentStatus}
                    onValueChange={setPaymentStatus}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    <span>${subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order Tax</span>
                    <span>${Number(taxAmount)} = ${taxAmount} ({taxRate}%)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discount</span>
                    <span>${discount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${shipping}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Grand Total</span>
                    <span>${total}</span>
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