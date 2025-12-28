"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "sonner"
import { useGetWarehousesQuery } from "@/lib/slices/warehousesApi"
import { useGetProductsQuery } from "@/lib/slices/productsApi"
import { useCreateStockTakeMutation } from "@/lib/slices/stockTakesApi"
import { Loader2, Plus, Trash2 } from "lucide-react"

export default function CreateStockTakePage() {
    const router = useRouter()
    const [warehouseId, setWarehouseId] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState("")
    const [items, setItems] = useState<any[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)

    const { data: warehousesData } = useGetWarehousesQuery()
    const { data: productsData } = useGetProductsQuery({
        page: 1,
        limit: 1000,
        warehouse_id: warehouseId
    }, { skip: !warehouseId })

    const [createStockTake, { isLoading }] = useCreateStockTakeMutation()

    const handleLoadProducts = () => {
        if (!warehouseId) {
            toast.error("Please select a warehouse first")
            return
        }

        setLoadingProducts(true)
        const products = productsData?.data || []
        const loadedItems = products.map((p: any) => ({
            product_id: p.id,
            product_name: p.name,
            product_code: p.code,
            expected_qty: parseFloat(p.stock || 0),
            counted_qty: "",
            variance: 0,
            notes: ""
        }))

        setItems(loadedItems)
        setLoadingProducts(false)
        toast.success(`Loaded ${loadedItems.length} products`)
    }

    const handleCountedQtyChange = (index: number, value: string) => {
        const newItems = [...items]
        const countedQty = value === "" ? null : parseFloat(value)
        newItems[index].counted_qty = value
        newItems[index].variance = countedQty !== null ? countedQty - newItems[index].expected_qty : 0
        setItems(newItems)
    }

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index))
    }

    const handleSubmit = async (status: string) => {
        if (!warehouseId) {
            toast.error("Please select a warehouse")
            return
        }

        if (items.length === 0) {
            toast.error("Please load products or add items")
            return
        }

        try {
            const stockTakeData = {
                warehouse_id: warehouseId,
                date,
                status,
                notes,
                items: items.map(item => ({
                    product_id: item.product_id,
                    expected_qty: item.expected_qty,
                    counted_qty: item.counted_qty === "" ? null : parseFloat(item.counted_qty),
                    notes: item.notes
                }))
            }

            await createStockTake(stockTakeData).unwrap()
            toast.success("Stock take created successfully")
            router.push("/stock-take/list")
        } catch (error: any) {
            toast.error(error.data?.error || "Failed to create stock take")
        }
    }

    return (
        <DashboardLayout>
            <div className="p-4 md:p-6">
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>Inventory</span>
                        <span>|</span>
                        <span>Stock Take</span>
                        <span>|</span>
                        <span>Create</span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Create Stock Take</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Header Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="warehouse">Warehouse *</Label>
                                <Select value={warehouseId} onValueChange={setWarehouseId}>
                                    <SelectTrigger id="warehouse">
                                        <SelectValue placeholder="Select warehouse" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehousesData?.map((warehouse: any) => (
                                            <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                                {warehouse.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2 flex items-end">
                                <Button
                                    onClick={handleLoadProducts}
                                    disabled={!warehouseId || loadingProducts}
                                    className="w-full"
                                    variant="outline"
                                >
                                    {loadingProducts ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Load All Products
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div>
                            <Label>Products to Count ({items.length})</Label>
                            <div className="border rounded-md mt-2 max-h-96 overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Code</TableHead>
                                            <TableHead className="text-right">Expected Qty</TableHead>
                                            <TableHead className="text-right">Counted Qty</TableHead>
                                            <TableHead className="text-right">Variance</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center text-muted-foreground">
                                                    No products loaded. Click "Load All Products" to begin.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            items.map((item, index) => (
                                                <TableRow key={index}>
                                                    <TableCell className="font-medium">{item.product_name}</TableCell>
                                                    <TableCell>{item.product_code}</TableCell>
                                                    <TableCell className="text-right">{item.expected_qty}</TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={item.counted_qty}
                                                            onChange={(e) => handleCountedQtyChange(index, e.target.value)}
                                                            className="w-24 text-right"
                                                            placeholder="0.00"
                                                        />
                                                    </TableCell>
                                                    <TableCell className={`text-right font-medium ${item.variance > 0 ? 'text-green-600' : item.variance < 0 ? 'text-red-600' : ''
                                                        }`}>
                                                        {item.variance > 0 ? '+' : ''}{item.variance.toFixed(2)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={item.notes}
                                                            onChange={(e) => {
                                                                const newItems = [...items]
                                                                newItems[index].notes = e.target.value
                                                                setItems(newItems)
                                                            }}
                                                            placeholder="Notes"
                                                            className="w-32"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRemoveItem(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add any notes about this stock take..."
                                rows={3}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/stock-take/list")}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => handleSubmit("pending")}
                                disabled={isLoading}
                            >
                                Save as Draft
                            </Button>
                            <Button
                                onClick={() => handleSubmit("completed")}
                                disabled={isLoading}
                                className="bg-[#1a237e] hover:bg-[#23308c]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Complete Stock Take"
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
