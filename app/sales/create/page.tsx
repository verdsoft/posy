"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type React from "react"
import { useForm, Controller } from "react-hook-form"
import { useCreateSaleMutation } from "@/lib/slices/salesApi"
import { useGetProductsQuery } from "@/lib/slices/productsApi"

interface Product {
  id: string
  name: string
  code: string
  price: number
  stock: number
}

interface CartItem {
  id: string
  product_id: string
  product_name: string
  product_code: string
  quantity: number
  price: number
  discount: number
  tax: number
  subtotal: number
}

interface FormValues {
  date: string
  customer_id: string
  warehouse_id: string
  tax_rate: number
  discount: number
  shipping: number
  status: string
  payment_status: string
  notes: string
}

export default function CreateSale() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customers, setCustomers] = useState<{id: string, name: string}[]>([])
  const [warehouses, setWarehouses] = useState<{id: string, name: string}[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      customer_id: "",
      warehouse_id: "",
      tax_rate: 0,
      discount: 0,
      shipping: 0,
      status: "completed",
      payment_status: "pending",
      notes: "",
    }
  })

  // RTK Query hooks
  const [createSale, { isLoading: isCreating }] = useCreateSaleMutation()
  const { data: products = [], isLoading: isProductsLoading } = useGetProductsQuery()

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customers
        const customersRes = await fetch('/api/customers')
        const customersData = await customersRes.json()
        setCustomers(customersData)
        
        // Fetch warehouses
        const warehousesRes = await fetch('/api/settings/warehouses')
        const warehousesData = await warehousesRes.json()
        setWarehouses(warehousesData)
      } catch (error) {
        toast.error("Failed to load initial data")
        console.error(error)
      }
    }
    
    fetchData()
  }, [])

  // Filter products based on search query
  const filteredProducts = searchQuery.length > 0 
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        product.code.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : []

  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.product_id === product.id)
    
    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        product_id: product.id,
        product_name: product.name,
        product_code: product.code,
        price: product.price,
        quantity: 1,
        discount: 0,
        tax: 0,
        subtotal: product.price
      }
      setCartItems([...cartItems, newItem])
    }
    
    setSearchQuery("")
  }

  const updateItemQuantity = (id: string, quantity: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = Math.max(1, quantity)
        const newSubtotal = newQuantity * item.price
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newSubtotal
        }
      }
      return item
    }))
  }

  const updateItemPrice = (id: string, price: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newPrice = Math.max(0, price)
        const newSubtotal = item.quantity * newPrice
        return {
          ...item,
          price: newPrice,
          subtotal: newSubtotal
        }
      }
      return item
    }))
  }

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id))
  }

  const onSubmit = async (data: FormValues) => {
    if (cartItems.length === 0) {
      toast.error("Please add at least one product")
      return
    }

    try {
      const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
      const taxAmount = subtotal * (data.tax_rate / 100)
      const total = subtotal + taxAmount + data.shipping - data.discount

      const saleData = {
        ...data,
        subtotal,
        tax_amount: taxAmount,
        total,
        paid: 0,
        due: total,
        items: cartItems,
      }

      const result = await createSale(saleData).unwrap()
      toast.success(`Sale ${result.reference} created successfully`)
      router.push('/sales')
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error('Failed to create sale')
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  const tax_rate = watch("tax_rate")
  const discount = watch("discount")
  const shipping = watch("shipping")
  
  const tax_amount = subtotal * (tax_rate / 100)
  const total = subtotal + tax_amount + shipping - discount

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Sales</span>
            <span>|</span>
            <span>Create Sale</span>
          </div>
          <h1 className="text-xl font-semibold">Create Sale</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Sale Information</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium">Date *</label>
                    <Input 
                      type="date" 
                      className="mt-1 h-9 text-sm" 
                      {...register("date", { required: "Date is required" })}
                    />
                    {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Customer *</label>
                    <Controller
                      name="customer_id"
                      control={control}
                      rules={{ required: "Customer is required" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-1 h-9 text-sm">
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
                      )}
                    />
                    {errors.customer_id && (
                      <span className="text-red-500 text-xs">{errors.customer_id.message}</span>
                    )}
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium">Warehouse *</label>
                    <Controller
                      name="warehouse_id"
                      control={control}
                      rules={{ required: "Warehouse is required" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-1 h-9 text-sm">
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
                      )}
                    />
                    {errors.warehouse_id && (
                      <span className="text-red-500 text-xs">{errors.warehouse_id.message}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Product Search</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Scan/Search Product by Code Name" 
                    className="pl-10 h-9 text-sm" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                {/* Search results dropdown */}
                {filteredProducts.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredProducts.map(product => (
                      <div 
                        key={product.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                        onClick={() => addToCart(product)}
                      >
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.code}</div>
                        </div>
                        <div className="text-sm">
                          ${product.price}
                          <span className="ml-2 text-gray-500">Stock: {product.stock}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Order Items *</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="overflow-x-auto">
                  <table className="w-full border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 border text-xs font-medium">#</th>
                        <th className="text-left p-3 border text-xs font-medium">Product</th>
                        <th className="text-left p-3 border text-xs font-medium">Unit Price</th>
                        <th className="text-left p-3 border text-xs font-medium">Qty</th>
                        <th className="text-left p-3 border text-xs font-medium">Subtotal</th>
                        <th className="text-left p-3 border text-xs font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-muted-foreground border">
                            No items added
                          </td>
                        </tr>
                      ) : (
                        cartItems.map((item, index) => (
                          <tr key={item.id} className="border-b">
                            <td className="p-3 border text-sm">{index + 1}</td>
                            <td className="p-3 border">
                              <div className="font-medium text-sm">{item.product_name}</div>
                              <div className="text-xs text-muted-foreground">{item.product_code}</div>
                            </td>
                            <td className="p-3 border">
                              <Input 
                                type="number" 
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value))}
                                className="w-24 h-8 text-sm"
                              />
                            </td>
                            <td className="p-3 border">
                              <Input 
                                type="number" 
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                                className="w-20 h-8 text-sm"
                              />
                            </td>
                            <td className="p-3 border text-sm">${Number(item.subtotal) }</td>
                            <td className="p-3 border">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                className="text-destructive hover:text-destructive/80"
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
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Order Tax</label>
                    <div className="flex mt-1">
                      <Input 
                        placeholder="0" 
                        className="rounded-r-none" 
                        {...register("tax_rate", { 
                          min: 0, 
                          max: 100,
                          valueAsNumber: true
                        })}
                      />
                      <Button 
                        variant="outline" 
                        className="rounded-l-none px-3 bg-transparent"
                        type="button"
                      >
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
                        {...register("discount", { 
                          min: 0,
                          valueAsNumber: true
                        })}
                      />
                      <Button 
                        variant="outline" 
                        className="rounded-l-none px-3 bg-transparent"
                        type="button"
                      >
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
                        {...register("shipping", { 
                          min: 0,
                          valueAsNumber: true
                        })}
                      />
                      <Button 
                        variant="outline" 
                        className="rounded-l-none px-3 bg-transparent"
                        type="button"
                      >
                        $
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Status *</label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Payment Status *</label>
                  <Controller
                    name="payment_status"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="partial">Partial</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Note</label>
                  <Textarea 
                    placeholder="A few words ..." 
                    className="mt-1" 
                    rows={4} 
                    {...register("notes")}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="bg-[#1a237e] hover:bg-purple-700"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : "Submit"}
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${Number(subtotal) }</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Tax</span>
                      <span>${Number(tax_amount) } ({tax_rate}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>${Number(discount) }</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${Number(shipping) }</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Grand Total</span>
                      <span>${Number(total) }</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}