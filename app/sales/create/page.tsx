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
import { useGetCustomersQuery } from "@/lib/slices/customersApi"
import { useGetWarehousesQuery } from "@/lib/slices/warehousesApi"

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
  // Use passed search query for server-side filtering, skip if too short
  const { data: productsResponse, isLoading: isProductsLoading } = useGetProductsQuery(
    { page: 1, limit: 10, search: searchQuery },
    { skip: searchQuery.length < 2 }
  )
  const { data: customersResponse } = useGetCustomersQuery({ page: 1, limit: 1000 })
  const { data: warehousesData } = useGetWarehousesQuery()

  const customers = customersResponse?.data || []
  const warehouses = warehousesData || []

  // Filter out items already in cart from server results
  const filteredProducts = searchQuery.length >= 2
    ? (productsResponse?.data?.filter(p => !cartItems.some(item => item.product_id === String(p.id))).slice(0, 5) || [])
    : []

  const addToCart = (product: Product) => {
    // Check if exists (shouldn't happen with filtering, but good for safety)
    const existingItem = cartItems.find(item => item.product_id === String(product.id))

    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      const newItem: CartItem = {
        id: Date.now().toString(),
        product_id: String(product.id),
        product_name: product.name,
        product_code: product.code,
        price: Number(product.price),
        quantity: 1,
        discount: 0,
        tax: 0,
        subtotal: Number(product.price)
      }
      setCartItems([...cartItems, newItem])
    }

    setSearchQuery("")
  }

  const updateItemQuantity = (id: string, quantity: number) => {
    setCartItems(cartItems.map(item => {
      if (item.id === id) {
        const newQuantity = isNaN(quantity) ? 1 : Math.max(1, quantity)
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
        const newPrice = isNaN(price) ? 0 : Math.max(0, price)
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
      const subtotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal), 0)
      const taxAmount = subtotal * (Number(data.tax_rate) / 100)
      const total = subtotal + taxAmount + Number(data.shipping) - Number(data.discount)

      const saleData = {
        ...data,
        customer_id: Number(data.customer_id),
        warehouse_id: Number(data.warehouse_id),
        subtotal: Number(subtotal),
        tax_amount: Number(taxAmount),
        total: Number(total),
        paid: 0,
        due: Number(total),
        items: cartItems.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          price: Number(item.price), // backend might expect unit_price or price
          unit_price: Number(item.price),
          subtotal: Number(item.subtotal),
          discount: 0,
          tax: 0
        })),
      }

      const result = await createSale(saleData).unwrap()
      toast.success(`Sale created successfully`)
      router.push('/sales/list')
    } catch (error) {
      console.error('Error creating sale:', error)
      toast.error('Failed to create sale')
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal), 0)
  const tax_rate = watch("tax_rate") || 0
  const discount = watch("discount") || 0
  const shipping = watch("shipping") || 0

  const tax_amount = subtotal * (Number(tax_rate) / 100)
  const total = subtotal + tax_amount + Number(shipping) - Number(discount)

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Sales</span>
            <span>|</span>
            <span>Create Sale</span>
          </div>
          {/* <h1 className="text-xl font-semibold">Create Sale</h1> */}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left Column - Main Form */}
            <div className="lg:col-span-2 space-y-6">

              {/* 1. General Info & Customer */}
              <Card>
                <CardHeader className="p-4 pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Sale Details</CardTitle>
                    <span className="text-xs text-muted-foreground">step 1 of 3</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-gray-700">Date *</label>
                      <Input
                        type="date"
                        className="mt-1 h-9 text-sm"
                        {...register("date", { required: "Date is required" })}
                      />
                      {errors.date && <span className="text-red-500 text-xs">{errors.date.message}</span>}
                    </div>

                    <div>
                      <label className="text-xs font-medium text-gray-700">Customer *</label>
                      <Controller
                        name="customer_id"
                        control={control}
                        rules={{ required: "Customer is required" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-1 h-9 text-sm">
                              <SelectValue placeholder="Select Customer" />
                            </SelectTrigger>
                            <SelectContent>
                              {customers.map(customer => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
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
                      <label className="text-xs font-medium text-gray-700">Warehouse *</label>
                      <Controller
                        name="warehouse_id"
                        control={control}
                        rules={{ required: "Warehouse is required" }}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-1 h-9 text-sm">
                              <SelectValue placeholder="Select Warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                              {warehouses.map(warehouse => (
                                <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
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

              {/* 2. Product Search & Table */}
              <Card>
                <CardHeader className="p-4 pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Items</CardTitle>
                    <span className="text-xs text-muted-foreground">step 2 of 3</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Scan barcode or type product name..."
                      className="pl-10 h-10 text-sm bg-gray-50 focus:bg-white transition-colors"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {/* Search results dropdown */}
                    {filteredProducts.length > 0 && (
                      <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                        {filteredProducts.map(product => (
                          <div
                            key={product.id}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center border-b last:border-0"
                            onClick={() => addToCart(product)}
                          >
                            <div>
                              <div className="font-medium text-sm text-gray-900">{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.code}</div>
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                              ${Number(product.price).toFixed(2)}
                              <span className="ml-2 text-xs text-gray-400 font-normal">In Stock: {product.stock}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#f8f9fa] border-b">
                        <tr>
                          <th className="text-left p-3 font-medium text-xs text-gray-500">Product</th>
                          <th className="text-center p-3 font-medium text-xs text-gray-500 w-24">Price</th>
                          <th className="text-center p-3 font-medium text-xs text-gray-500 w-24">Qty</th>
                          <th className="text-right p-3 font-medium text-xs text-gray-500 w-24">Subtotal</th>
                          <th className="text-center p-3 font-medium text-xs text-gray-500 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartItems.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-8 text-muted-foreground text-xs italic">
                              Start searching to add products...
                            </td>
                          </tr>
                        ) : (
                          cartItems.map((item) => (
                            <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                              <td className="p-3">
                                <div className="font-medium text-sm text-gray-900">{item.product_name}</div>
                                <div className="text-xs text-muted-foreground">{item.product_code}</div>
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.price}
                                  onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value))}
                                  className="w-full h-7 text-xs text-center"
                                />
                              </td>
                              <td className="p-3">
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value))}
                                  className="w-full h-7 text-xs text-center"
                                />
                              </td>
                              <td className="p-3 text-right font-medium">
                                ${Number(item.subtotal).toFixed(2)}
                              </td>
                              <td className="p-3 text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(item.id)}
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <X className="h-3 w-3" />
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

              {/* 3. Notes */}
              <Card>
                <CardContent className="p-4">
                  <label className="text-xs font-medium text-gray-700 mb-2 block">Order Notes</label>
                  <Textarea
                    placeholder="Add any additional notes here..."
                    className="resize-none"
                    rows={3}
                    {...register("notes")}
                  />
                </CardContent>
              </Card>

            </div>

            {/* Right Column - Totals & Submit */}
            <div className="space-y-6">

              <Card>
                <CardHeader className="p-4 pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Order Summary</CardTitle>
                    <span className="text-xs text-muted-foreground">step 3 of 3</span>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Order Tax (%)</label>
                    <div className="flex mt-1">
                      <Input
                        placeholder="0"
                        className="rounded-r-none h-9 text-right"
                        {...register("tax_rate", { min: 0, max: 100, valueAsNumber: true })}
                      />
                      <div className="bg-gray-100 border border-l-0 px-3 flex items-center rounded-r-md text-gray-500 text-xs box-border">
                        %
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700">Discount ($)</label>
                    <div className="flex mt-1">
                      <Input
                        placeholder="0.00"
                        className="rounded-r-none h-9 text-right"
                        {...register("discount", { min: 0, valueAsNumber: true })}
                      />
                      <div className="bg-gray-100 border border-l-0 px-3 flex items-center rounded-r-md text-gray-500 text-xs box-border">
                        $
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-700">Shipping ($)</label>
                    <div className="flex mt-1">
                      <Input
                        placeholder="0.00"
                        className="rounded-r-none h-9 text-right"
                        {...register("shipping", { min: 0, valueAsNumber: true })}
                      />
                      <div className="bg-gray-100 border border-l-0 px-3 flex items-center rounded-r-md text-gray-500 text-xs box-border">
                        $
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="font-medium">${Number(subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tax</span>
                      <span className="font-medium text-red-600">+${Number(tax_amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Shipping</span>
                      <span className="font-medium">+${Number(shipping).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="font-medium text-green-600">-${Number(discount).toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-base font-bold pt-2 border-t mt-2">
                      <span>Grand Total</span>
                      <span className="text-[#1a237e]">${Number(total).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700">Status</label>
                      <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-1 h-9 text-sm">
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
                      <label className="text-xs font-medium text-gray-700">Payment</label>
                      <Controller
                        name="payment_status"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="mt-1 h-9 text-sm">
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
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#1a237e] hover:bg-purple-700 mt-4"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : "Create Sale"}
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
