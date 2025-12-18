"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sale } from "@/lib/types/api"
import { format } from "date-fns"
import { useGetSaleByIdQuery } from "@/lib/slices/salesApi"
import { Loader2 } from "lucide-react"

interface ViewSaleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sale: Sale | null
}

export function ViewSaleDialog({ open, onOpenChange, sale: initialSale }: ViewSaleDialogProps) {
    // We fetch detailed sale info to get item prices if they aren't in the list view data
    const { data: fullSale, isLoading } = useGetSaleByIdQuery(initialSale?.id || '', {
        skip: !initialSale?.id || !open
    })

    const sale = fullSale || initialSale

    if (!sale) return null

    // Determine items array. API response 'sale_items' or 'items' depending on mapping
    const items = (sale as any).sale_items || (sale as any).items || (sale as any).products || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle className="text-xl font-bold">Sale Details</DialogTitle>
                        <Badge variant={sale.status === "completed" ? "default" : "secondary"}>
                            {sale.status}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground my-1">
                        Reference: <span className="font-medium text-foreground">{sale.reference}</span>
                    </div>
                </DialogHeader>

                {isLoading && !fullSale ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Date</div>
                                <div className="text-sm">{sale.date ? format(new Date(sale.date), "PPP") : "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Customer</div>
                                <div className="text-sm font-semibold">{sale.customer_name || "Walk-in Customer"}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Warehouse</div>
                                <div className="text-sm">{sale.warehouse_name || "Default Warehouse"}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Payment Status</div>
                                <Badge variant={sale.payment_status === "paid" ? "outline" : "destructive"} className="uppercase text-xs">
                                    {sale.payment_status}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        <div className="py-4">
                            <h3 className="font-semibold mb-3">Order Items</h3>
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium">Product</th>
                                            <th className="px-4 py-2 text-left font-medium">Code</th>
                                            <th className="px-4 py-2 text-center font-medium">Quantity</th>
                                            <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                                            <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {items.length > 0 ? (
                                            items.map((item: any, index: number) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 max-w-[200px] truncate" title={item.product?.name || item.name}>
                                                        {item.product?.name || item.name}
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground">
                                                        {item.product?.code || item.code || '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">{item.quantity}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        ${Number(item.unit_price || item.price || 0).toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium">
                                                        ${Number(item.subtotal || ((item.quantity || 0) * (item.unit_price || 0))).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-2 text-center text-muted-foreground">
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
                                    <span>${Number(sale.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Order Tax ({sale.tax_rate}%)</span>
                                    <span>${Number(sale.tax_amount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span>-${Number(sale.discount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>${Number(sale.shipping || 0).toFixed(2)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Grand Total</span>
                                    <span>${Number(sale.total || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Paid Amount</span>
                                    <span>${Number(sale.paid || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-red-600">
                                    <span>Due Amount</span>
                                    <span>${Number(sale.due || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
