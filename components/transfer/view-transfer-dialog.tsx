"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"

interface Transfer {
    id: number
    date: string
    reference: string
    from_warehouse?: { name: string }
    to_warehouse?: { name: string }
    status: string
    grand_total: number
    items_count: number
    items?: any[]
    notes?: string
    shipping?: number
}

interface ViewTransferDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transfer: Transfer | null
}

export function ViewTransferDialog({ open, onOpenChange, transfer }: ViewTransferDialogProps) {
    if (!transfer) return null

    const items = transfer.items || []

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center justify-between mr-8">
                        <DialogTitle className="text-xl font-bold">Transfer Details</DialogTitle>
                        <Badge variant={
                            transfer.status === "completed" ? "default" :
                                transfer.status === "sent" ? "outline" :
                                    "secondary"
                        }>
                            {transfer.status}
                        </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Reference: <span className="font-medium text-foreground">{transfer.reference}</span>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-6 py-4">
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">Date</div>
                        <div className="text-sm">{transfer.date ? format(new Date(transfer.date), "PPP") : "N/A"}</div>
                    </div>
                    <div>
                        {/* Placeholder for spacer */}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">From Warehouse</div>
                        <div className="text-sm font-semibold">{transfer.from_warehouse?.name || "N/A"}</div>
                    </div>
                    <div>
                        <div className="text-sm font-medium text-muted-foreground mb-1">To Warehouse</div>
                        <div className="text-sm font-semibold">{transfer.to_warehouse?.name || "N/A"}</div>
                    </div>
                </div>

                <Separator />

                <div className="py-4">
                    <h3 className="font-semibold mb-3">Transfer Items</h3>
                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="px-4 py-2 text-left font-medium">Product</th>
                                    <th className="px-4 py-2 text-left font-medium">Code</th>
                                    <th className="px-4 py-2 text-right font-medium">Quantity</th>
                                    <th className="px-4 py-2 text-right font-medium">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.length > 0 ? (
                                    items.map((item: any, index: number) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">{item.product?.name || item.name || '-'}</td>
                                            <td className="px-4 py-2 text-muted-foreground">{item.product?.code || item.code || '-'}</td>
                                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                                            <td className="px-4 py-2 text-right">
                                                ${Number(item.subtotal || 0).toFixed(2)}
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
                            <span className="text-muted-foreground">Shipping</span>
                            <span>${Number(transfer.shipping || 0).toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Grand Total</span>
                            <span>${Number(transfer.grand_total || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                {transfer.notes && (
                    <div className="pt-4">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Note</div>
                        <p className="text-sm">{transfer.notes}</p>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
