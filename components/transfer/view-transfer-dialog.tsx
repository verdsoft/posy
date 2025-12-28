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

import { useGetTransferByIdQuery } from "@/lib/slices/transfersApi"
import { Loader2 } from "lucide-react"

interface Transfer {
    id: number | string // Allow string too, as API slice might use string or number
    date: string
    reference: string
    from_warehouse?: { name: string }
    to_warehouse?: { name: string }
    status: string
    grand_total: number
    items_count: number
    items?: any[]
    transfer_items?: any[] // V2 might return this
    notes?: string
    shipping?: number
}

interface ViewTransferDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transfer: Transfer | null
}

export function ViewTransferDialog({ open, onOpenChange, transfer: initialTransfer }: ViewTransferDialogProps) {
    const { data: fullTransfer, isLoading } = useGetTransferByIdQuery(initialTransfer?.id || '', {
        skip: !initialTransfer?.id || !open
    })

    const transfer = (fullTransfer as unknown as Transfer) || initialTransfer

    if (!transfer) return null

    // Determine items array. API V2 uses 'transfer_items' or 'items'
    const items = transfer.transfer_items || transfer.items || []

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
                    <div className="text-sm text-muted-foreground my-1">
                        Reference: <span className="font-medium text-foreground">{transfer.reference}</span>
                    </div>
                </DialogHeader>

                {isLoading && !fullTransfer ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-2 gap-6 py-4">
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Date</div>
                                <div className="text-sm">{transfer.date ? format(new Date(transfer.date), "PPP") : "N/A"}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-muted-foreground mb-1">Status</div>
                                <div className="text-sm capitalize">{transfer.status}</div>
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
                                    <thead className="bg-gray-50">
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
                                                    <td className="px-4 py-2">{item.products?.name || item.product?.name || item.name || '-'}</td>
                                                    <td className="px-4 py-2 text-muted-foreground">{item.products?.code || item.product?.code || item.code || '-'}</td>
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
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
