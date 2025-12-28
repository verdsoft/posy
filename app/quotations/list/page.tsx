"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Search, FileDown, Edit, Trash2, ChevronLeft, ChevronRight, FileText } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from 'xlsx'
import { useGetOrganizationQuery } from '@/lib/slices/organizationApi'
import type React from "react"
import { ViewQuotationDialog } from "./view-quotation/page"
import { useGetQuotationsQuery, useDeleteQuotationMutation, useGetQuotationItemsQuery, useGetQuotationByIdQuery } from "@/lib/slices/quotationsApi"
import { Quotation, QuotationItem } from "@/lib/types/quotation"
import { toast } from "sonner"
import { useCreateInvoiceMutation } from "@/lib/slices/invoicesV2Api"
import { Invoice, InvoiceItem as InvoiceItemType } from "@/lib/types/invoice"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Pagination as UIPagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { TableActions } from "@/components/ui/table-actions"

interface FullQuotation extends Quotation {
  customer_name?: string;
  warehouse_name?: string;
}

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
  customers?: { name: string, email?: string, phone?: string, address?: string, city?: string, country?: string }
  warehouses?: { name: string }
}

export default function QuotationList() {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const [viewQuotation, setViewQuotation] = useState<QuotationListItem | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [quotationToDelete, setQuotationToDelete] = useState<string | null>(null)
  const [quotationIdForActions, setQuotationIdForActions] = useState<string | null>(null);

  const { data, isLoading, isError } = useGetQuotationsQuery({ page, limit, search: searchTerm })
  const [deleteQuotation, { isLoading: isDeleting }] = useDeleteQuotationMutation()
  const [createInvoice, { isLoading: isCreatingInvoice }] = useCreateInvoiceMutation()
  const { data: fullQuotationData } = useGetQuotationByIdQuery(quotationIdForActions || "", { skip: !quotationIdForActions });
  const { data: quotationItemsData } = useGetQuotationItemsQuery(quotationIdForActions || "", { skip: !quotationIdForActions });
  const { data: organization } = useGetOrganizationQuery();

  const quotations = (data?.data || []) as unknown as QuotationListItem[];
  const pagination = data?.pagination;

  const handleDeleteClick = (id: string) => {
    setQuotationToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteQuotation = async () => {
    if (!quotationToDelete) return

    try {
      await deleteQuotation(quotationToDelete).unwrap()
      toast.success("Quotation deleted successfully")
    } catch (error) {
      console.error("Error deleting quotation:", error)
      toast.error("Failed to delete quotation")
    } finally {
      setDeleteDialogOpen(false)
      setQuotationToDelete(null)
    }
  }

  const exportToPDF = () => {
    toast.info("To export a quotation PDF, use the PDF button next to each individual quotation in the table below. This will generate a professional quotation using your organization's branding.")
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      quotations.map(quotation => ({
        Date: quotation.date,
        Reference: quotation.reference,
        Customer: quotation.customers?.name || quotation.customer_name || '',
        Warehouse: quotation.warehouses?.name || quotation.warehouse_name || '',
        Status: quotation.status,
        Total: Number(quotation.total)
      }))
    )

    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quotations")
    XLSX.writeFile(workbook, "quotations.xlsx")
  }

  const exportSingleQuotationToPDF = async (quotationId: string) => {
    try {
      const quotationResponse = await fetch(`/api/v2/quotations?id=${quotationId}`);
      const quotationResult = await quotationResponse.json();
      const quotationData = quotationResult;

      const itemsResponse = await fetch(`/api/v2/quotations/items?quotation_id=${quotationId}`);
      const itemsResult = await itemsResponse.json();
      const itemsData = itemsResult.data || [];

      // Prepare data for PDF generation
      const pdfData = {
        organization: organization!,
        quotationNumber: quotationData.reference || 'QUO-001',
        quotationDate: quotationData.date,
        validUntil: quotationData.valid_until || null,
        status: quotationData.status || 'Pending',
        customer: {
          name: quotationData.customers?.name || quotationData.customer_name || 'Customer Name',
          email: quotationData.customers?.email || '',
          phone: quotationData.customers?.phone || '',
          address: quotationData.customers?.address || '',
          city: quotationData.customers?.city || '',
          country: quotationData.customers?.country || ''
        },
        items: itemsData.length > 0 ? itemsData.map((item: any) => ({
          product: {
            name: item.products?.name || item.product_name || 'Product',
            description: item.products?.description || '',
            sku: item.products?.sku || ''
          },
          quantity: Number(item.quantity || 0),
          price: Number(item.price || item.unit_price || 0),
          total: Number(item.subtotal || (item.quantity * item.price) || 0)
        })) : [
          {
            product: {
              name: 'Sample Item',
              description: 'No items found for this quotation',
              sku: 'N/A'
            },
            quantity: 1,
            price: Number(quotationData.total || 0),
            total: Number(quotationData.total || 0)
          }
        ],
        subtotal: Number(quotationData.subtotal || 0),
        taxAmount: Number(quotationData.tax_amount || 0),
        discountAmount: Number(quotationData.discount || 0),
        totalAmount: Number(quotationData.total || 0),
        notes: quotationData.notes || (organization?.quotation_footer || 'Thank you for your business!')
      };

      // Call server-side PDF generation API
      const pdfResponse = await fetch('/api/pdf/quotation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData)
      });

      if (!pdfResponse.ok) {
        throw new Error(`PDF generation failed: ${pdfResponse.statusText}`);
      }

      // Create download from response
      const pdfBlob = await pdfResponse.blob();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation-${pdfData.quotationNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Quotation PDF generated successfully!");
    } catch (error) {
      console.error("Error generating quotation PDF:", error);
      toast.error("Failed to generate quotation PDF.");
    }
  };

  const handleMakeInvoice = async (quotation: QuotationListItem) => {
    try {
      setQuotationIdForActions(quotation.id);
      if (!fullQuotationData || !quotationItemsData) {
        const quotationDetailsResponse = await fetch(`/api/quotations/${quotation.id}`);
        const fetchedFullQuotation: FullQuotation = await quotationDetailsResponse.json();

        const quotationItemsResponse = await fetch(`/api/quotations/items?quotation_id=${quotation.id}`);
        const quotationItemsResult = await quotationItemsResponse.json();
        const fetchedQuotationItems: QuotationItem[] = quotationItemsResult.data || [];

        if (!fetchedFullQuotation || !fetchedQuotationItems) {
          throw new Error("Failed to fetch full quotation details or items for invoice conversion.");
        }

        const user_id = localStorage.getItem('UserId');

        const invoicePayload: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> & {
          items: InvoiceItemType[];
          customer_id: string | null;
          warehouse_id: string | null;
          notes: string | null;
          created_by: string | null;
        } = {
          reference: `INV-${Date.now().toString().slice(-6)}`,
          date: new Date(fetchedFullQuotation.date).toISOString().split('T')[0],
          customer_id: fetchedFullQuotation.customer_id || '',
          warehouse_id: fetchedFullQuotation.warehouse_id || '',
          subtotal: Number(Number(fetchedFullQuotation.subtotal || 0).toFixed(2)),
          tax_rate: Number(Number(fetchedFullQuotation.tax_rate || 0).toFixed(2)),
          tax_amount: Number(Number(fetchedFullQuotation.tax_amount || 0).toFixed(2)),
          discount: Number(Number(fetchedFullQuotation.discount || 0).toFixed(2)),
          shipping: Number(Number(fetchedFullQuotation.shipping || 0).toFixed(2)),
          total: Number(Number(fetchedFullQuotation.total || 0).toFixed(2)),
          paid: 0,
          due: Number(Number(fetchedFullQuotation.total || 0).toFixed(2)),
          status: "pending",
          payment_status: "unpaid",
          notes: fetchedFullQuotation.notes || null,
          created_by: fetchedFullQuotation.created_by || user_id || null,
          items: fetchedQuotationItems.map(item => ({
            product_id: item.product_id,
            name: item.product_name || item.name || 'N/A',
            code: item.product_code || item.code || 'N/A',
            quantity: Number(Number(item.quantity || 0).toFixed(2)),
            unit_price: Number(Number(item.price || item.unit_price || 0).toFixed(2)),
            discount: Number(Number(item.discount || 0).toFixed(2)),
            tax: Number(Number(item.tax || 0).toFixed(2)),
            subtotal: Number(((Number(item.price || item.unit_price || 0) * Number(item.quantity || 0)) - Number(item.discount || 0) + Number(item.tax || 0)).toFixed(2)),
          })),
        };

        const newInvoice = await createInvoice(invoicePayload).unwrap();
        toast.success(`Invoice ${newInvoice.reference} created from quotation!`);

        setTimeout(() => {
          router.push(`/invoice/edit/${newInvoice.id}`);
        }, 100);
      } else {
        const user_id = localStorage.getItem('UserId');

        const invoicePayload: Omit<Invoice, 'id' | 'created_at' | 'updated_at'> & {
          items: InvoiceItemType[];
          customer_id: string | null;
          warehouse_id: string | null;
          notes: string | null;
          created_by: string | null;
        } = {
          reference: `INV-${Date.now().toString().slice(-6)}`,
          date: new Date(fullQuotationData.date).toISOString().split('T')[0],
          customer_id: fullQuotationData.customer_id || '',
          warehouse_id: fullQuotationData.warehouse_id || '',
          subtotal: Number(Number(fullQuotationData.subtotal || 0).toFixed(2)),
          tax_rate: Number(Number(fullQuotationData.tax_rate || 0).toFixed(2)),
          tax_amount: Number(Number(fullQuotationData.tax_amount || 0).toFixed(2)),
          discount: Number(Number(fullQuotationData.discount || 0).toFixed(2)),
          shipping: Number(Number(fullQuotationData.shipping || 0).toFixed(2)),
          total: Number(Number(fullQuotationData.total || 0).toFixed(2)),
          paid: 0,
          due: Number(Number(fullQuotationData.total || 0).toFixed(2)),
          status: "pending",
          payment_status: "unpaid",
          notes: fullQuotationData.notes || null,
          created_by: fullQuotationData.created_by || user_id || null,
          items: quotationItemsData.map(item => ({
            product_id: item.product_id,
            name: item.product_name || item.name || 'N/A',
            code: item.product_code || item.code || 'N/A',
            quantity: Number(Number(item.quantity || 0).toFixed(2)),
            unit_price: Number(Number(item.price || item.unit_price || 0).toFixed(2)),
            discount: Number(Number(item.discount || 0).toFixed(2)),
            tax: Number(Number(item.tax || 0).toFixed(2)),
            subtotal: Number(((Number(item.price || item.unit_price || 0) * Number(item.quantity || 0)) - Number(item.discount || 0) + Number(item.tax || 0)).toFixed(2)),
          })),
        };

        const newInvoice = await createInvoice(invoicePayload).unwrap();
        toast.success(`Invoice ${newInvoice.reference} created from quotation!`);

        setTimeout(() => {
          router.push(`/invoice/edit/${newInvoice.id}`);
        }, 100);
      }
    } catch (error: any) {
      console.error("Error creating invoice from quotation:", error);
      toast.error(error.data?.message || "Failed to create invoice from quotation.");
    } finally {
      setQuotationIdForActions(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Sales</span>
            <span>|</span>
            <span>Quotations</span>
          </div>
          {/* <h1 className="text-xl font-semibold">Quotations</h1> */}
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-3 border-b flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search quotations..."
                  className="w-full md:w-64 h-8 text-sm pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs flex-1 md:flex-none"
                onClick={exportToPDF}
              >
                <FileDown className="h-3 w-3 mr-1" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs flex-1 md:flex-none"
                onClick={exportToExcel}
              >
                <FileDown className="h-3 w-3 mr-1" />
                Excel
              </Button>
              <Button
                className="bg-[#1a237e] hover:bg-purple-700 h-8 px-3 text-xs flex-1 md:flex-none"
                onClick={() => router.push('/quotations/create')}
              >
                Create Quotation
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 font-medium">
                    <input type="checkbox" className="rounded scale-75" />
                  </th>
                  <th className="text-left p-2 font-medium">Date</th>
                  <th className="text-left p-2 font-medium">Reference</th>
                  <th className="text-left p-2 font-medium">Customer</th>
                  <th className="text-left p-2 font-medium">Warehouse</th>
                  <th className="text-left p-2 font-medium">Status</th>
                  <th className="text-left p-2 font-medium">Total</th>
                  <th className="text-right p-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">Loading...</td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-red-500">Failed to load quotations</td>
                  </tr>
                ) : quotations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">No quotations found</td>
                  </tr>
                ) : (
                  quotations.map((quotation) => (
                    <tr key={quotation.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-2">
                        <input type="checkbox" className="rounded scale-75" />
                      </td>
                      <td className="p-2">{new Date(quotation.date).toLocaleDateString()}</td>
                      <td className="p-2 font-medium">{quotation.reference}</td>
                      <td className="p-2">{quotation.customers?.name || quotation.customer_name || ''}</td>
                      <td className="p-2">{quotation.warehouses?.name || quotation.warehouse_name || ''}</td>
                      <td className="p-2">
                        <Badge
                          variant={quotation.status === 'sent' ? 'default' : 'secondary'}
                          className="text-xs font-normal"
                        >
                          {quotation.status}
                        </Badge>
                      </td>
                      <td className="p-2 font-medium">${Number(quotation.total).toFixed(2)}</td>
                      <td className="p-2 text-right">
                        <TableActions
                          onView={() => {
                            setViewQuotation(quotation)
                            setIsViewDialogOpen(true)
                          }}
                          onEdit={() => router.push(`/quotations/edit/${quotation.id}`)}
                          onDelete={() => handleDeleteClick(quotation.id)}
                        >
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setQuotationIdForActions(quotation.id);
                              exportSingleQuotationToPDF(quotation.id);
                            }}
                            disabled={isLoading}
                            className="cursor-pointer"
                          >
                            <FileDown className="h-4 w-4 mr-2" />
                            Download PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setQuotationIdForActions(quotation.id);
                              handleMakeInvoice(quotation);
                            }}
                            disabled={isCreatingInvoice || isLoading}
                            className="cursor-pointer"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Make Invoice
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </TableActions>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="p-3 border-t flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-xs text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={limit.toString()}
                  onValueChange={(value) => setLimit(Number(value))}
                >
                  <SelectTrigger className="h-7 w-[60px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 25, 50, 100].map((size) => (
                      <SelectItem key={size} value={size.toString()} className="text-xs">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <UIPagination>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage((old) => Math.max(old - 1, 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-3 w-3 mr-1" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1 px-2">
                      <span className="text-xs">Page {page} of {pagination.totalPages}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => setPage((old) => old + 1)}
                      disabled={page >= (pagination.totalPages || 1)}
                    >
                      Next
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </UIPagination>
              </div>
            </div>
          )}
        </div>

        {viewQuotation && (
          <ViewQuotationDialog
            quotation={viewQuotation}
            open={isViewDialogOpen}
            onOpenChange={setIsViewDialogOpen}
          />
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the quotation
                and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteQuotation}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Quotation"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
