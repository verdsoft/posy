"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { useGetStockTakesQuery, useDeleteStockTakeMutation } from "@/lib/slices/stockTakesApi"
import { useGetWarehousesQuery } from "@/lib/slices/warehousesApi"
import { toast } from "sonner"
import { Eye, Edit, Trash2, Plus, FileDown, Loader2 } from "lucide-react"
import Link from "next/link"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"

export default function StockTakeListPage() {
    const router = useRouter()
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [warehouseFilter, setWarehouseFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [searchTerm, setSearchTerm] = useState("")

    const { data, isLoading, refetch } = useGetStockTakesQuery({
        page,
        limit,
        warehouse_id: warehouseFilter,
        status: statusFilter,
        search: searchTerm
    })

    const { data: warehousesData } = useGetWarehousesQuery()
    const [deleteStockTake] = useDeleteStockTakeMutation()

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this stock take?")) return

        try {
            await deleteStockTake(id).unwrap()
            toast.success("Stock take deleted successfully")
            refetch()
        } catch (error: any) {
            toast.error(error.data?.error || "Failed to delete stock take")
        }
    }

    const getStatusBadge = (status: string) => {
        const variants: any = {
            pending: "secondary",
            in_progress: "default",
            completed: "default",
            cancelled: "destructive"
        }
        const colors: any = {
            pending: "bg-yellow-100 text-yellow-800",
            in_progress: "bg-blue-100 text-blue-800",
            completed: "bg-green-100 text-green-800",
            cancelled: "bg-red-100 text-red-800"
        }
        return (
            <Badge variant={variants[status]} className={colors[status]}>
                {status.replace('_', ' ').toUpperCase()}
            </Badge>
        )
    }

    const exportToPDF = () => {
        const doc = new jsPDF()
        doc.setFontSize(18)
        doc.text("Stock Takes Report", 14, 22)
        doc.setFontSize(11)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)

        const tableData = data?.data?.map((st: any) => [
            st.reference,
            st.warehouse_name,
            new Date(st.date).toLocaleDateString(),
            st.status.toUpperCase(),
            st.items_count || 0,
            st.created_by_name
        ]) || []

        autoTable(doc, {
            head: [["Reference", "Warehouse", "Date", "Status", "Items", "Created By"]],
            body: tableData,
            startY: 35,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [26, 35, 126] }
        })

        doc.save(`stock-takes-${new Date().toISOString().split('T')[0]}.pdf`)
        toast.success("PDF exported successfully")
    }

    const exportToExcel = () => {
        const excelData = data?.data?.map((st: any) => ({
            Reference: st.reference,
            Warehouse: st.warehouse_name,
            Date: new Date(st.date).toLocaleDateString(),
            Status: st.status.toUpperCase(),
            Items: st.items_count || 0,
            "Created By": st.created_by_name,
            "Created At": new Date(st.created_at).toLocaleString(),
            Notes: st.notes || ""
        })) || []

        const ws = XLSX.utils.json_to_sheet(excelData)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Stock Takes")
        XLSX.writeFile(wb, `stock-takes-${new Date().toISOString().split('T')[0]}.xlsx`)
        toast.success("Excel exported successfully")
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
                        <span>List</span>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Stock Takes</CardTitle>
                            <div className="flex gap-2">
                                <Button onClick={exportToPDF} variant="outline" size="sm">
                                    <FileDown className="h-4 w-4 mr-2" />
                                    PDF
                                </Button>
                                <Button onClick={exportToExcel} variant="outline" size="sm">
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Excel
                                </Button>
                                <Link href="/stock-take/create">
                                    <Button className="bg-[#1a237e] hover:bg-[#23308c]">
                                        <Plus className="h-4 w-4 mr-2" />
                                        New Stock Take
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <Input
                                placeholder="Search reference or notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Warehouses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Warehouses</SelectItem>
                                    {warehousesData?.map((warehouse: any) => (
                                        <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                                            {warehouse.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Statuses</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchTerm("")
                                    setWarehouseFilter("")
                                    setStatusFilter("")
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>

                        {/* Table */}
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Warehouse</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Items</TableHead>
                                        <TableHead>Created By</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                            </TableCell>
                                        </TableRow>
                                    ) : data?.data?.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                No stock takes found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        data?.data?.map((stockTake: any) => (
                                            <TableRow key={stockTake.id}>
                                                <TableCell className="font-medium">{stockTake.reference}</TableCell>
                                                <TableCell>{stockTake.warehouse_name}</TableCell>
                                                <TableCell>{new Date(stockTake.date).toLocaleDateString()}</TableCell>
                                                <TableCell>{getStatusBadge(stockTake.status)}</TableCell>
                                                <TableCell className="text-right">{stockTake.items_count || 0}</TableCell>
                                                <TableCell>{stockTake.created_by_name}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => router.push(`/stock-take/view/${stockTake.id}`)}
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        {stockTake.status !== 'completed' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => router.push(`/stock-take/edit/${stockTake.id}`)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDelete(stockTake.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {data?.pagination && data.pagination.totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, data.pagination.total)} of {data.pagination.total} results
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page - 1)}
                                        disabled={page === 1}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(page + 1)}
                                        disabled={page >= data.pagination.totalPages}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
