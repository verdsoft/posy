"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface QuotationListItem {
  id: string
  date: string
  reference: string
  customer_name?: string
  warehouse_name?: string
  status: string
  total: number
  created_by?: string
  valid_until?: string | null
}

interface ViewQuotationDialogProps {
  quotation: QuotationListItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ViewQuotationDialog({ quotation, open, onOpenChange }: ViewQuotationDialogProps) {
  if (!quotation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quotation Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Reference</p>
              <p className="font-medium">{quotation.reference}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-medium">{quotation.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Customer</p>
              <p className="font-medium">{quotation.customer_name || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Warehouse</p>
              <p className="font-medium">{quotation.warehouse_name || 'Unknown'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <Badge
                variant={quotation.status === "approved" ? "default" : "secondary"}
                className={
                  quotation.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }
              >
                {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium">${Number(quotation.total).toFixed(2)}</p>
            </div>
          </div>

          {/* Add more quotation details here */}
          {/* You can add a table for quotation items if needed */}

          <div className="flex justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}