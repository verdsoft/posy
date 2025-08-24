"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "../../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Minus, Plus, X, Search, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { useUpdateAdjustmentMutation } from "@/lib/slices/adjustmentsApi"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type AdjustmentItem = {
  product_name: string
  product_code: string
  quantity: number
  type: string
}

type AdjustmentDetails = {
  id: string
  reference: string
  date: string
  warehouse_name: string
  type: string
  item_count: number
  notes?: string | null
  items: AdjustmentItem[]
}

export default function EditAdjustmentPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [details, setDetails] = useState<AdjustmentDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [warehouseId, setWarehouseId] = useState<string>("")
  const [date, setDate] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [items, setItems] = useState<Array<{ id: string; product_id: string; product_code: string; product_name: string; quantity: number; type: 'addition'|'subtraction' }>>([])
  const [updateAdjustment, { isLoading: isUpdating }] = useUpdateAdjustmentMutation()
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (!params?.id) return
        const res = await fetch(`/api/v2/adjustments/${params.id}`)
        if (!res.ok) throw new Error("Failed to load adjustment")
        const json = await res.json()
        setDetails(json)
        setWarehouseId(String(json.warehouse_id || ""))
        setDate(json.date?.slice(0,10) || "")
        setNotes(json.notes || "")
        setItems((json.items || []).map((it: any, idx: number) => ({
          id: String(idx + 1),
          product_id: String(it.product_id),
          product_code: it.product_code,
          product_name: it.product_name,
          quantity: Number(it.quantity) || 1,
          type: (it.type === 'subtraction' ? 'subtraction' : 'addition')
        })))
      } catch (e: any) {
        setError(e?.message || "Failed to load adjustment")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params?.id])

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await fetch('/api/settings/warehouses')
        const data = await response.json()
        setWarehouses(data)
      } catch {}
    }
    fetchWarehouses()
  }, [])

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p))
  }

  const updateType = (id: string, newType: 'addition'|'subtraction') => {
    setItems(prev => prev.map(p => p.id === id ? { ...p, type: newType } : p))
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(p => p.id !== id))
  }

  const handleSubmit = async () => {
    if (!params?.id) return
    if (!warehouseId) return
    if (items.length === 0) return
    try {
      await updateAdjustment({ id: params.id, body: {
        warehouse_id: warehouseId,
        date,
        type: (details?.type === 'subtraction' ? 'subtraction' : 'addition'),
        notes,
        items: items.map(i => ({ product_id: i.product_id, quantity: i.quantity, type: i.type }))
      }}).unwrap()
      router.push('/adjustment/list')
    } catch (e) {}
  }

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
    } catch {
      toast.error("Failed to search products")
    } finally {
      setIsSearching(false)
    }
  }

  const handleAddProduct = (product: any) => {
    if (items.some(p => p.product_id === String(product.id))) {
      toast.warning("Product already added to adjustment")
      return
    }
    const newItem = {
      id: Date.now().toString(),
      product_id: String(product.id),
      product_code: product.code,
      product_name: product.name,
      quantity: 1,
      type: 'addition' as const,
      currentStock: product.stock as number | undefined,
    } as any
    setItems(prev => [...prev, newItem])
    setSearchResults([])
    setSearchQuery("")
    toast.success(`${product.name} added to adjustment`)
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <span>Inventory</span>
              <span>|</span>
              <span>Adjustments</span>
              <span>|</span>
              <span>Edit</span>
            </div>
            <h1 className="text-xl font-semibold">Edit Adjustment</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>Back</Button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : details ? (
          <div className="space-y-6">
            <Card>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-base">Adjustment Details</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="text-xs font-medium block mb-1">Warehouse <span className="text-red-500">*</span></label>
                    <Select value={warehouseId} onValueChange={(v: string) => setWarehouseId(v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        {warehouses.map(w => (
                          <SelectItem key={w.id} value={String(w.id)}>{w.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium block mb-1">Date <span className="text-red-500">*</span></label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
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
                    <Button variant="outline" onClick={handleSearch} disabled={isSearching}>Search</Button>
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
                        {items.map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{item.product_code}</TableCell>
                            <TableCell>{item.product_name}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{(item as any).currentStock ?? '-'}{(item as any).currentStock ? ' pcs' : ''}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, -1)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, 1)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select value={item.type} onValueChange={(v: 'addition'|'subtraction') => updateType(item.id, v)}>
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
                              <Button size="icon" variant="ghost" onClick={() => removeItem(item.id)}>
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {items.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                              No products to adjust
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
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
                  <Button variant="outline" onClick={() => router.push('/adjustment/list')}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isUpdating || items.length === 0 || !warehouseId}>
                    {isUpdating ? 'Updating...' : 'Update Adjustment'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </DashboardLayout>
  )
}


