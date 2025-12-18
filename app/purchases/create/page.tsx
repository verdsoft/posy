"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X } from "lucide-react"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { toast } from "sonner"

import type React from "react"
import { useCreatePurchaseMutation } from "@/lib/slices/purchasesApi"
import { useGetSuppliersQuery } from "@/lib/slices/suppliersApi"
import { useGetWarehousesQuery } from "@/lib/slices/warehousesApi"
import { useGetProductsQuery } from "@/lib/slices/productsApi"
import { PurchaseStatus } from "@/lib/types/prisma"

interface Product {
  id: string
  name: string
  code: string
  cost: number
  stock: number
}

interface PurchaseItem {
  id: string
  product_id: string
  product_name: string
  product_code: string
  quantity: number
  unit_cost: number
  discount: number
  tax: number
  subtotal: number

}

interface FormValues {
  date: string
  supplier_id: string
  warehouse_id: string
  tax_rate: number
  discount: number
  shipping: number
  status: string
  payment_status: string
  notes: string
  created_by: string
}

export default function CreatePurchase() {

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProducts, setSelectedProducts] = useState<PurchaseItem[]>([])

  // RTK Query hooks
  const { data: suppliersData } = useGetSuppliersQuery({ page: 1, limit: 1000, search: "" })
  const { data: warehousesData } = useGetWarehousesQuery()
  const { data: productsData } = useGetProductsQuery({ page: 1, limit: 10, search: searchQuery }, { skip: searchQuery.length < 2 })
  const [createPurchase, { isLoading }] = useCreatePurchaseMutation()

  const suppliers = suppliersData?.data || []
  const warehouses = warehousesData || []
  const filteredProducts = searchQuery.length >= 2
    ? (productsData?.data?.filter(p => !selectedProducts.some(sp => sp.product_id === String(p.id))).slice(0, 5) || [])
    : []

  const {
    register,
    handleSubmit,
    control,
    watch,

    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      supplier_id: "",
      warehouse_id: "",
      tax_rate: 0,
      discount: 0,
      shipping: 0,
      status: "received",
      payment_status: "unpaid",
      notes: "",
      created_by: "1",
    }
  })


  // Calculate totals
  const subtotal = selectedProducts.reduce((sum, item) => sum + item.subtotal, 0)
  const tax_rate = watch("tax_rate")
  const discount = watch("discount")
  const shipping = watch("shipping")

  const tax_amount = subtotal * (tax_rate / 100)
  const total = Number(subtotal) + Number(tax_amount) + Number(shipping) - Number(discount) // shipping - discount


  // Add product to purchase items
  const addProduct = (product: any) => {
    const existingItem = selectedProducts.find(item => item.product_id === String(product.id))

    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1)
    } else {
      const newItem: PurchaseItem = {
        id: Date.now().toString(),
        product_id: String(product.id),
        product_name: product.name,
        product_code: product.code,
        quantity: 1,
        unit_cost: Number(product.cost) || 0,
        discount: 0,
        tax: 0,
        subtotal: Number(product.cost) || 0

      }
      setSelectedProducts([...selectedProducts, newItem])
    }

    setSearchQuery("")
  }

  // Remove item from purchase
  const removeItem = (id: string) => {
    setSelectedProducts(selectedProducts.filter(item => item.id !== id))
  }

  // Update item quantity
  const updateItemQuantity = (id: string, quantity: number) => {
    setSelectedProducts(selectedProducts.map(item => {
      if (item.id === id) {
        const newQuantity = isNaN(quantity) ? 1 : Math.max(1, quantity)
        const newSubtotal = newQuantity * item.unit_cost
        return {
          ...item,
          quantity: newQuantity,
          subtotal: newSubtotal
        }
      }
      return item
    }))
  }

  // Update item unit cost
  const updateItemCost = (id: string, cost: number) => {
    setSelectedProducts(selectedProducts.map(item => {
      if (item.id === id) {
        const newCost = isNaN(cost) ? 0 : Math.max(0, cost)
        const newSubtotal = item.quantity * newCost
        return {
          ...item,
          unit_cost: newCost,
          subtotal: newSubtotal
        }
      }
      return item
    }))
  }

  // Submit form
  const onSubmit = async (data: FormValues) => {
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product")
      return
    }

    const user_id = localStorage.getItem('UserId');
    if (!user_id) {
      toast.error("User authentication required")
      return
    }

    try {
      const payload = {
        ...data,
        supplier_id: Number(data.supplier_id),
        warehouse_id: Number(data.warehouse_id),
        subtotal: Number(subtotal),
        tax_amount: Number(tax_amount),
        total: Number(total),
        paid: 0,
        due: Number(total),
        items: selectedProducts.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_cost: Number(item.unit_cost),
          discount: Number(item.discount),
          tax: Number(item.tax),
          subtotal: Number(item.subtotal)
        })),
        status: data.status as PurchaseStatus,
        payment_status: data.payment_status as any, // Cast payment_status as well just in case
        created_by: Number(user_id),
      }

      await createPurchase(payload).unwrap()
      toast.success("Purchase created successfully")
    } catch (error: any) {
      const message = error?.data?.error || "Failed to create purchase"
      toast.error(message)
      console.error(error)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Purchases</span>
            <span>|</span>
            <span>Create Purchase</span>
          </div>
          <h1 className="text-xl font-semibold">Create Purchase</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">Purchase Information</CardTitle>
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
                    <label className="text-xs font-medium">Supplier *</label>
                    <Controller
                      name="supplier_id"
                      control={control}
                      rules={{ required: "Supplier is required" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="mt-1 h-9 text-sm">
                            <SelectValue placeholder="Choose Supplier" />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map(supplier => (
                              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.supplier_id && (
                      <span className="text-red-500 text-xs">{errors.supplier_id.message}</span>
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
                        onClick={() => addProduct(product)}
                      >
                        <div>
                          <div className="font-medium text-sm">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.code}</div>
                        </div>
                        <div className="text-sm">
                          ${product.cost}
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
                        <th className="text-left p-3 border text-xs font-medium">Net Unit Cost</th>
                        <th className="text-left p-3 border text-xs font-medium">Qty</th>
                        <th className="text-left p-3 border text-xs font-medium">Subtotal</th>
                        <th className="text-left p-3 border text-xs font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-8 text-muted-foreground border">
                            No items added
                          </td>
                        </tr>
                      ) : (
                        selectedProducts.map((item, index) => (
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
                                value={item.unit_cost}
                                onChange={(e) => updateItemCost(item.id, parseFloat(e.target.value))}
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
                            <td className="p-3 border text-sm">${Number(item.subtotal)}</td>
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
                          <SelectItem value="received">Received</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
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
                      <span>${Number(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order Tax</span>
                      <span>${Number(tax_amount)} ({tax_rate}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount</span>
                      <span>${Number(discount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${Number(shipping)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Grand Total</span>
                      <span>${Number(total)}</span>
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