"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, X, Minus, Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import type React from "react"
import { useGetSaleByIdQuery, useUpdateSaleMutation } from "@/lib/slices/salesApi"
import { useGetCustomersQuery } from "@/lib/slices/customersApi"
import { useGetWarehousesQuery } from "@/lib/slices/warehousesApi"
import { useGetProductsQuery } from "@/lib/slices/productsApi"

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

export default function EditSale() {
    const router = useRouter()
    const { id } = useParams()
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCustomer, setSelectedCustomer] = useState("")
    const [selectedWarehouse, setSelectedWarehouse] = useState("")
    const [taxRate, setTaxRate] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [shipping, setShipping] = useState(0)
    const [status, setStatus] = useState("completed")
    const [paymentStatus, setPaymentStatus] = useState("unpaid")
    const [notes, setNotes] = useState("")

    // RTK Query hooks
    const { data: saleData, isLoading: isSaleLoading } = useGetSaleByIdQuery(id as string, { skip: !id })
    const { data: customersData } = useGetCustomersQuery({ page: 1, limit: 1000, search: "" })
    const { data: warehousesData } = useGetWarehousesQuery()
    const { data: productsData } = useGetProductsQuery({ page: 1, limit: 100, search: searchTerm })
    const [updateSale, { isLoading: isUpdating }] = useUpdateSaleMutation()

    const customers = customersData?.data || []
    const warehouses = warehousesData || []
    const products = productsData?.data || []

    // Load sale data when it's fetched
    useEffect(() => {
        if (saleData) {
            setSelectedCustomer(String(saleData.customer_id || ""))
            setSelectedWarehouse(String(saleData.warehouse_id || ""))
            setTaxRate(Number(saleData.tax_rate) || 0)
            setDiscount(Number(saleData.discount) || 0)
            setShipping(Number(saleData.shipping) || 0)
            setStatus(saleData.status || "completed")
            setPaymentStatus(saleData.payment_status || "unpaid")
            setNotes(saleData.notes || "")

            // Convert sale items to cart items
            if (saleData.sale_items && Array.isArray(saleData.sale_items)) {
                const items = saleData.sale_items.map((item: any) => ({
                    id: String(item.id),
                    product_id: String(item.product_id),
                    name: item.products?.name || `Product ${item.product_id}`,
                    price: Number(item.price) || 0,
                    quantity: Number(item.quantity) || 0,
                    discount: Number(item.discount) || 0,
                    tax: Number(item.tax) || 0,
                    subtotal: Number(item.subtotal) || 0
                }))
                setCartItems(items)
            }
        }
    }, [saleData])

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
    const taxAmount = Number(subtotal) * (taxRate / 100)
    const total = Number(subtotal) + Number(taxAmount) + Number(shipping) - Number(discount)

    // Cart functions (same as create page)
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

        try {
            const updateData = {
                customer_id: Number(selectedCustomer),
                warehouse_id: Number(selectedWarehouse),
                date: new Date().toISOString().slice(0, 10),
                subtotal: Number(subtotal),
                tax_rate: Number(taxRate),
                tax_amount: Number(taxAmount),
                discount: Number(discount),
                shipping: Number(shipping),
                total: Number(total),
                status,
                payment_status: paymentStatus,
                notes,
                items: cartItems.map(item => ({
                    product_id: Number(item.product_id),
                    quantity: Number(item.quantity),
                    price: Number(item.price),
                    discount: Number(item.discount),
                    tax: Number(item.tax),
                    subtotal: Number(item.subtotal)
                }))
            }

            await updateSale({ id: id as string, data: updateData }).unwrap()
            toast.success("Sale updated successfully")
            router.push('/sales/list')
        } catch (error: any) {
            const message = error?.data?.error || "Failed to update sale"
            toast.error(message)
            console.error(error)
        }
    }

    if (isSaleLoading) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (!saleData) {
        return (
            <DashboardLayout>
                <div className="p-6">
                    <div className="text-center py-8">
                        <p className="text-red-500">Failed to load sale data</p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => router.push('/sales/list')}
                        >
                            Back to Sales List
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <span>Sale List</span>
                        <span>|</span>
                        <span>Edit Sale - {saleData.reference}</span>
                    </div>
                    <h1 className="text-2xl font-bold">Edit Sale</h1>
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
                                        <SelectItem key={customer.id} value={String(customer.id)}>
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
                                        <SelectItem key={warehouse.id} value={String(warehouse.id)}>
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
                                <tbody className="bg-white">
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
                                                        className="w-24 border-gray-300"
                                                    />
                                                </td>
                                                <td className="p-3 border">
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                                            className="w-16 text-center h-8 border-gray-300"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
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
                                        <div className="flex items-center justify-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r text-gray-500 text-sm">
                                            %
                                        </div>
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
                                        <div className="flex items-center justify-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r text-gray-500 text-sm">
                                            $
                                        </div>
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
                                        <div className="flex items-center justify-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r text-gray-500 text-sm">
                                            $
                                        </div>
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
                                        <SelectItem value="ordered">Ordered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Payment Status *</label>
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
                                        <SelectItem value="due">Due</SelectItem>
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
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded border border-gray-200">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">${Number(subtotal).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Order Tax ({taxRate}%)</span>
                                        <span className="font-medium">${Number(taxAmount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Discount</span>
                                        <span className="font-medium text-red-500">-${Number(discount).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Shipping</span>
                                        <span className="font-medium">${Number(shipping).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-lg border-t pt-3 mt-2">
                                        <span>Grand Total</span>
                                        <span className="text-purple-700">${Number(total).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    className="flex-1 bg-[#1a237e] hover:bg-purple-700 h-10 text-base"
                                    onClick={handleSubmit}
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? <span className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-white" />Updating...</span> : "Update Sale"}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-10 text-base"
                                    onClick={() => router.push('/sales/list')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    )
}