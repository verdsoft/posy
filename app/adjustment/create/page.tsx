"use client"

import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Minus, Plus, X } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { fetchWarehouses, searchProducts, createAdjustment } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"
import type React from "react"
import { Loader2 } from "lucide-react"
import AuthGuard from "@/components/AuthGuard"


interface AdjustmentProduct {
  id: string
  product_id: string
  code: string
  name: string
  currentStock: number
  quantity: number
  type: 'addition' | 'subtraction'
}

export default function CreateAdjustment() {
  const router = useRouter()
  const [warehouse_id, setWarehouseId] = useState<string | null>(null)
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [type, setType] = useState<'addition' | 'subtraction'>('addition')
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [products, setProducts] = useState<AdjustmentProduct[]>([])
  const [notes, setNotes] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
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
    } catch (error) {
      console.error("Search error:", error)
      toast.error(error.message || "Failed to search products")
    } finally {
      setIsSearching(false)
    }
  }

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses'],
    queryFn: fetchWarehouses,
  })

  const handleAddProduct = (product: ProductSearchResult) => {
    // Check if product already exists in the list
    if (products.some(p => p.product_id === product.id)) {
      toast.warning("Product already added to adjustment")
      return
    }

    const newProduct: AdjustmentProduct = {
      id: Date.now().toString(),
      product_id: product.id,
      code: product.code,
      name: product.name,
      currentStock: product.stock,
      quantity: 1,
      type: type // Use the global adjustment type
    }

    setProducts([...products, newProduct])
    toast.success(`${product.name} added to adjustment`)
  }


  const updateQuantity = (id: string, change: number) => {
    setProducts(products.map(product =>
      product.id === id
        ? { ...product, quantity: Math.max(1, product.quantity + change) }
        : product
    ))
  }

  const updateType = (id: string, newType: 'addition' | 'subtraction') => {
    setProducts(products.map(product =>
      product.id === id ? { ...product, type: newType } : product
    ))
  }

  const removeProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id))
  }

  const handleSubmit = async () => {
    if (!warehouse_id) {
      toast.error("Please select a warehouse")
      return
    }
    if (products.length === 0) {
      toast.error("Please add at least one product")
      return
    }
    setIsSubmitting(true)
    try {
      const { adjustment_id, reference } = await createAdjustment({
        warehouse_id,
        date,
        type,
        items: products.map(p => ({
          product_id: p.product_id,
          quantity: p.quantity,
          type: p.type
        })),
        notes
      })
      console.log("warehouse_id being inserted:", warehouse_id)
      toast.success(`Adjustment ${reference} created successfully`)
      
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create adjustment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (

<AuthGuard>
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Adjustment List</span>
            <span>|</span>
            <span>Create Adjustment</span>
          </div>
          <h1 className="text-2xl font-bold">Create Adjustment</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium">Warehouse *</label>
              <Select
                value={warehouse_id || ""}
                onValueChange={setWarehouseId}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses?.map(warehouse => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Adjustment Type *</label>
              <Select
                value={type}
                onValueChange={(value: 'addition' | 'subtraction') => setType(value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="addition">Addition</SelectItem>
                  <SelectItem value="subtraction">Subtraction</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-6">
            <label className="text-sm font-medium">Product</label>
            <div className="relative mt-1 flex gap-2">
              <div className="relative">
                <div className="relative mt-1">
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
                          handleAddProduct(product)
                          setSearchResults([])
                          setSearchQuery("")
                        }}
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          {product.code} • Stock: {product.stock} {product.unit_name || ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button type="button" variant="outline" onClick={handleSearch}>
                Search
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="bg-gray-50 border rounded mt-2 max-h-40 overflow-auto">
                {searchResults.map(product => (
                  <div
                    key={product.id}
                    className="px-4 py-2 hover:bg-purple-100 cursor-pointer flex justify-between items-center"
                    onClick={() => handleAddProduct(product)}
                  >
                    <span>{product.code} - {product.name}</span>
                    <span className="text-xs text-gray-500">{product.stock} in stock</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 border">#</th>
                  <th className="text-left p-3 border">Code Product</th>
                  <th className="text-left p-3 border">Product</th>
                  <th className="text-left p-3 border">Stock</th>
                  <th className="text-left p-3 border">Qty</th>
                  <th className="text-left p-3 border">Type</th>
                  <th className="text-left p-3 border"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => (
                  <tr key={item.id}>
                    <td className="p-3 border">{index + 1}</td>
                    <td className="p-3 border">{item.code}</td>
                    <td className="p-3 border">{item.name}</td>
                    <td className="p-3 border">
                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                        {item.currentStock} Pcs
                      </span>
                    </td>
                    <td className="p-3 border">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 bg-purple-600 text-white"
                          onClick={() => updateQuantity(item.id, -1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 text-sm w-6 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 w-6 p-0 bg-purple-600 text-white"
                          onClick={() => updateQuantity(item.id, 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                    <td className="p-3 border">
                      <Select
                        value={item.type}
                        onValueChange={(value: "addition" | "subtraction") => updateType(item.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="addition">Addition</SelectItem>
                          <SelectItem value="subtraction">Subtraction</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3 border">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500"
                        onClick={() => removeProduct(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-500">
                      No products added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mb-6">
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
            disabled={products.length === 0 || isSubmitting}
          >
            Submit
          </Button>
        </div>
      </div>
    </DashboardLayout>
</AuthGuard>
  )
}