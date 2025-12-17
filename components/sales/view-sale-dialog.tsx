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

interface ViewSaleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sale: Sale | null
}

export function ViewSaleDialog({ open, onOpenChange, sale }: ViewSaleDialogProps) {
    if (!sale) return null

    const products = sale.products || []

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
                    <div className="text-sm text-muted-foreground">
                        Reference: <span className="font-medium text-foreground">{sale.reference}</span>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-4">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Date</div>
                        <div className="text-sm">{sale.date ? format(new Date(sale.date), "PPP") : "N/A"}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Customer</div>
                        <div className="text-sm font-semibold">{sale.customer_name || "Walk-in Customer"}</div>
                        {/* Add email/phone if available in the future */}
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
                                    <th className="px-4 py-2 text-right font-medium">Quantity</th>
                                    {/*  <th className="px-4 py-2 text-right font-medium">Unit Price</th>
                  <th className="px-4 py-2 text-right font-medium">Subtotal</th> 
                      The Sale items in list view might not have price/subtotal if mapped. 
                      Ideally we fetch full details, but for now we use what we have.
                      If 'products' is just name/code/qty, we can't show price.
                  */}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {products.length > 0 ? (
                                    products.map((item: any, index: number) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">{item.name}</td>
                                            <td className="px-4 py-2 text-muted-foreground">{item.code}</td>
                                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2 text-center text-muted-foreground">
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
                            <span>${Number(sale.discount || 0).toFixed(2)}</span>
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
            </DialogContent>
        </Dialog>
    )
}
