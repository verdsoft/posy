"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"

export function ViewProductDialog({
  product,
  open,
  onOpenChange,
}: {
  product: any
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {product.image && (
            <div className="md:col-span-2 flex justify-center">
              <img 
                src={product.image} 
                alt={product.name}
                className="max-h-64 rounded-lg object-contain"
              />
            </div>
          )}
          
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Name</TableCell>
                <TableCell>{product.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Code</TableCell>
                <TableCell>{product.code}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Category</TableCell>
                <TableCell>{product.category_name || product.category_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Brand</TableCell>
                <TableCell>{product.brand_name || product.brand_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Price</TableCell>
                <TableCell>${Number(product.price).toFixed(2)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Cost</TableCell>
                <TableCell>${Number(product.cost).toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Stock</TableCell>
                <TableCell>{Number(product.stock).toFixed(2)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Unit</TableCell>
                <TableCell>{product.unit_name || product.unit_id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Status</TableCell>
                <TableCell className="capitalize">{product.status}</TableCell>
              </TableRow>
              {product.description && (
                <TableRow>
                  <TableCell colSpan={2}>
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{product.description}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}