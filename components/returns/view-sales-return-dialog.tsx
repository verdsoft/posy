"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SalesReturn } from "@/lib/types" // Assuming SalesReturn is exported from types
import { format } from "date-fns"
import { useGetSalesReturnByIdQuery } from "@/lib/slices/returnsApi"
import { Loader2 } from "lucide-react"

interface ViewSalesReturnDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    salesReturn: SalesReturn | null
}

export function ViewSalesReturnDialog({ open, onOpenChange, salesReturn: initialReturn }: ViewSalesReturnDialogProps) {
    const { data: fetchResult, isLoading } = useGetSalesReturnByIdQuery(initialReturn?.id || '', {
        skip: !initialReturn?.id || !open
    })

    // API returns { success: true, data: ... } wrapped in returnsApi hook as { data: ... }
    // But `useGetSalesReturnByIdQuery` returns whatever the query function returns.
    // In returnsApi, I typed it as `builder.query<{ data: SalesReturn }, string>`
    // So `fetchResult` is `{ data: SalesReturn }`.
    const fullReturn = fetchResult?.data
    const ret = fullReturn || initialReturn

    if (!ret) return null

    // Helper to access items safely
    const items = (ret as any).sales_return_items || (ret as any).items || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle className="text-xl font-bold">Sales Return Details</DialogTitle>
                        <Badge variant={ret.status === "completed" ? "default" : "secondary"}>
                            {ret.status}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground my-1">
                        Reference: <span className="font-medium text-foreground">{ret.reference}</span>
                    </div>
                </DialogHeader>

                {isLoading && !fullReturn ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Date</div>
                                <div className="text-sm">{ret.date ? format(new Date(ret.date), "PPP") : "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Customer</div>
                                <div className="text-sm font-semibold">{(ret as any).customers?.name || (ret as any).customer_name || "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Warehouse</div>
                                <div className="text-sm">{(ret as any).warehouses?.name || (ret as any).warehouse_name || "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Sale Reference</div>
                                <div className="text-sm">{(ret as any).sales?.reference || (ret as any).sale_reference || "N/A"}</div>
                            </div>
                        </div>

                        <Separator />

                        <div className="py-4">
                            <h3 className="font-semibold mb-3">Return Items</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Product</th>
                                            <th className="px-4 py-2 text-center font-medium">Quantity</th>
                                            <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                                            <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {items.length > 0 ? (
                                            items.map((item: any, index: number) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 max-w-[200px] truncate" title={item.products?.name || item.name}>
                                                        {item.products?.name || item.name || "Item"}
                                                        {item.products?.code && <span className="text-muted-foreground ml-1">({item.products.code})</span>}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        ${Number(item.unit_price || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium">
                                                        ${Number(item.subtotal || ((item.quantity || 0) * (item.unit_price || 0))).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="px-4 py-2 text-center text-muted-foreground">
                                                    No items found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex justify-end pt-4">
                            <div className="w-full md:w-1/2 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${Number(ret.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order Tax ({ret.tax_rate}%)</span>
                                    <span>${Number(ret.tax_amount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span>-${Number(ret.discount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>${Number(ret.shipping || 0).toFixed(2)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Grand Total</span>
                                    <span>${Number(ret.total || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
