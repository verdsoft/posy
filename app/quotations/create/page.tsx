"use client"

import React, { useState, useEffect, useMemo } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Minus, X } from "lucide-react"
import { searchProducts } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface Product {
  id: string
  code: string
  name: string
  price: number
  stock: number
}

interface Customer {
  id: string
  name: string
}

interface Warehouse {
  id: string
  name: string
}

interface QuotationItem {
  id: string
  name: string
  code: string
  price: number
  stock: number
  quantity: number
  discount: number
  tax: number
}

export default function CreateQuotation() {
  
  const [ loading,setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [customerId, setCustomerId] = useState("")
  const [warehouseId, setWarehouseId] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [items, setItems] = useState<QuotationItem[]>([])
  const [status, setStatus] = useState("pending")
  const [note, setNote] = useState("")
  const [validUntil, setValidUntil] = useState<string>('');
  const [orderTax, setOrderTax] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(0);
  const [customers, setCustomers] = useState<Customer[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])


  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 0;
      return sum + (price * quantity);
    }, 0);
  }, [items]);

  const taxAmount = useMemo(() => {
    const taxRate = Number(orderTax) || 0;
    return subtotal * (taxRate / 100);
  }, [subtotal, orderTax]);

  const grandTotal = useMemo(() => {
    const discountValue = Number(discount) || 0;
    const shippingValue = Number(shipping) || 0;
    return subtotal + taxAmount - discountValue + shippingValue;
  }, [subtotal, taxAmount, discount, shipping]);

 
  // Modify your updateItem function to ensure numbers
  const updateItem = (id: string, field: string, value: number | string) => {
    const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, [field]: numValue } : item
      )
    );
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch customers
        const customersRes = await fetch('/api/customers')
        if (customersRes.ok) {
          const customersData = await customersRes.json()
          setCustomers(customersData)
        }

        // Fetch warehouses
        const warehousesRes = await fetch('/api/settings/warehouses')
        if (warehousesRes.ok) {
          const warehousesData = await warehousesRes.json()
          setWarehouses(warehousesData)
        }
      } catch (error) {
        console.error("Failed to load data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])



  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term")
      return
    }

    setIsSearching(true)
    try {
      const results = await searchProducts(searchQuery)
      setSearchResults(results)
      if (results.length === 0) {
        toast.info("No products found matching your search")
      }
    } catch (error: unknown) {
      console.error("Search error:", error)
      const message = error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(message || "Failed to search products")
    } finally {
      setIsSearching(false)
    }
  }

  // Add product to quotation
  const addProduct = (product: Product) => {
    setItems(prev => [
      ...prev,
      {
        id: product.id,
        name: product.name,
        code: product.code,
        price: product.price,
        stock: product.stock,
        quantity: 1,
        discount: 0,
        tax: 0
      }
    ])

    setSearchQuery("")
    setSearchResults([])
    console.log(items)
  }


  // Remove item
  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }


  // Update the handleSubmit function
const handleSubmit = async () => {
  console.log("1 - Start of handleSubmit");

  if (!customerId || !warehouseId || items.length === 0) {
    toast.error("Please fill all required fields and add at least one product");
    return;
  }

  try {
    console.log("2 - Before getting user_id");
    const user_id = localStorage.getItem('UserId');
    if (!user_id) throw new Error("User authentication required");

    console.log("3 - Before calculations");
    
    // Ensure all calculations use proper decimal formatting
    const subtotal = parseFloat(
  items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0)
    
);

const tax_amount = parseFloat(
  (subtotal * (Number(orderTax) / 100))
);

const total = parseFloat(
  (subtotal + tax_amount - Number(discount) + Number(shipping))
);

    console.log("4 - Before fetch", {
      customerId,
      warehouseId,
      subtotal,
      items
    });

    // Format all numbers to 2 decimal places before sending
    const payload = {
      reference: `QT-${Date.now().toString().slice(-6)}`,
      date,
      valid_until: validUntil || null,
      customer_id: customerId,
      warehouse_id: warehouseId,
      subtotal: Number(subtotal),
      tax_rate: Number(Number(orderTax)),
      tax_amount: Number(tax_amount),
      discount: Number(Number(discount)),
      shipping: Number(Number(shipping)),
      total: Number(total),
      status,
      notes: note || null,
      created_by: user_id,
      items: items.map(item => ({
        product_id: item.id,
        quantity: Number(Number(item.quantity)),
        unit_price: Number(Number(item.price)),
        discount: Number(Number(item.discount || 0)),
        tax: Number(Number(item.tax || 0)),
        subtotal: Number((
          Number(item.price) * Number(item.quantity) - 
          Number(item.discount || 0) + 
          Number(item.tax || 0)
        ))
      }))
    };

    console.log("Formatted Payload:", payload);

    const response = await fetch('/api/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log("5 - After fetch, before response check");

    if (!response.ok) {
      const errorText = await response.text();
      console.log("API Error Response:", errorText);
      
    }
 toast.success("Quotation created successfully");
    console.log("6 - After response check");
  
    console.log("API", response);
   

  } catch (error: unknown) {
    console.error("Full Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    toast.error(message);
  } finally {
    setIsSubmitting(false);
    console.log("7 - Final cleanup");
  }
};


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <Label className="text-sm font-medium">Date *</Label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Customer *</Label>
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
              <Label className="text-sm font-medium">Warehouse *</Label>
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
            <div>
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <Label className="text-sm font-medium">Product</Label>
            <div className="relative mt-1 flex gap-2">
              <div className="relative flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Scan/Search Product by Code Name"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    disabled={isSearching}
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="p-2 hover:bg-gray-50 cursor-pointer border-b"
                        onClick={() => {
                          addProduct(product)
                          setSearchResults([])
                          setSearchQuery("")
                        }}
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {subtotal}8
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button type="button" variant="outline" onClick={handleSearch} disabled={isSearching}>
                Search
              </Button>
            </div>
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
                            onChange={e => setDiscount(Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                        <td className="p-3 border">
                          <Input
                            type="number"
                            min={0}
                            value={item.tax}
                            onChange={e => setOrderTax(Number(e.target.value))}
                            className="w-20"
                          />
                        </td>
                        <td className="p-3 border">
                          ${((item.price * item.quantity) - (item.discount || 0) + (item.tax || 0))}
                        </td>
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
                  <Label className="text-sm font-medium">Order Tax (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={orderTax}
                    onChange={e => setOrderTax(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Discount</Label>
                  <Input
                    type="number"
                    min={0}
                    value={discount}
                    onChange={e => setDiscount(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Shipping</Label>
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
                <Label className="text-sm font-medium">Status *</Label>
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
                <Label className="text-sm font-medium">Note</Label>
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
                type='button'
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
                      ${taxAmount} ({orderTax} %)
                    </span>
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
                    <span>${grandTotal}</span>
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