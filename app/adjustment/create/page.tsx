"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Minus, Plus, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import AuthGuard from "@/components/AuthGuard"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useCreateAdjustmentMutation } from "@/lib/slices/adjustmentsApi"
import { useGetProductsQuery } from "@/lib/slices/productsApi"

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
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [products, setProducts] = useState<AdjustmentProduct[]>([])
  const [notes, setNotes] = useState<string>("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // RTK Query hooks
  const [createAdjustment, { isLoading: isCreating }] = useCreateAdjustmentMutation()
  const [warehouses, setWarehouses] = useState<any[]>([])

  // Fetch warehouses on component mount
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await fetch('/api/settings/warehouses')
        const data = await response.json()
        setWarehouses(data)
      } catch (error) {
        console.error('Failed to fetch warehouses:', error)
      }
    }
    fetchWarehouses()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search term")
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
      const results = await response.json()
      setSearchResults(results)
      if (results.length === 0) {
        toast.info("No products found matching your search")
      }
    } catch (error) {
      console.error("Search error:", error)
      toast.error("Failed to search products")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddProduct = (product: any) => {
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
      type: 'addition'
    }

    setProducts([...products, newProduct])
    setSearchResults([])
    setSearchQuery("")
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
    
    try {
      const result = await createAdjustment({
        warehouse_id,
        date,
        items: products.map(p => ({
          product_id: p.product_id,
          quantity: p.quantity,
          type: p.type
        })),
        notes
      }).unwrap()
      
      toast.success(`Adjustment ${result.reference} created successfully`)
      router.push("/adjustment/list")
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create adjustment')
    }
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="p-4 md:p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>Adjustments</span>
              <span>|</span>
              <span>Create Adjustment</span>
            </div>
            <h1 className="text-xl font-semibold">Create Adjustment</h1>
          </div>

          <Card>
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-base">Adjustment Details</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="text-xs font-medium block mb-1">
                    Warehouse <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={warehouse_id || ""}
                    onValueChange={setWarehouseId}
                  >
                    <SelectTrigger>
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
                  <label className="text-xs font-medium block mb-1">
                    Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-medium block mb-1">Add Products</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by product code or name"
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      disabled={isSearching}
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    Search
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 border rounded-md overflow-hidden">
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className="p-3 hover:bg-muted cursor-pointer border-b flex justify-between items-center"
                        onClick={() => handleAddProduct(product)}
                      >
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {product.code} • Stock: {product.stock} {product.unit_name || ''}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-primary" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="text-xs font-medium mb-2">Selected Products</div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">#</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{item.code}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {item.currentStock} pcs
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.id, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.type}
                              onValueChange={(value: "addition" | "subtraction") => updateType(item.id, value)}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="addition">Addition</SelectItem>
                                <SelectItem value="subtraction">Subtraction</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removeProduct(item.id)}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {products.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                            No products added yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-medium block mb-1">Notes</label>
                <Textarea
                  placeholder="Add any notes about this adjustment..."
                  className="min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push("/adjustment/list")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={products.length === 0 || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : "Create Adjustment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}