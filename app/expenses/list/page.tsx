"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Eye, Trash2, Plus } from "lucide-react"
import { useEffect, useState } from "react";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export default function ExpenseList() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    date: "",
    category_id: "",
    amount: "",
    description: "",
    status: "pending"
  });

  useEffect(() => {
    fetch("/api/expenses")
      .then(res => res.json())
      .then(setExpenses);
    fetch("/api/expenses-categories")
      .then(res => res.json())
      .then(setCategories);
  }, []);

  const filtered = expenses.filter(exp =>
    exp.reference?.toLowerCase().includes(search.toLowerCase()) ||
    exp.description?.toLowerCase().includes(search.toLowerCase()) ||
    exp.amount.toString().includes(search) ||
    exp.category_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExpenses(expenses.filter(exp => exp.id !== id));
        toast.success("Expense deleted successfully");
        setIsDeleteDialogOpen(false);
      } else {
        throw new Error("Failed to delete expense");
      }
    } catch (error) {
      toast.error("Failed to delete expense");
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Expense List', 14, 16);
    const tableData = filtered.map(exp => [
      exp.date,
      exp.reference,
      exp.description,
      exp.amount,
      exp.category_name,
      exp.status
    ]);
    autoTable(doc, {
      head: [['Date', 'Reference', 'Details', 'Amount', 'Category', 'Status']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    });
    doc.save('expenses.pdf');
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map(exp => ({
        Date: exp.date,
        Reference: exp.reference,
        Details: exp.description,
        Amount: exp.amount,
        Category: exp.category_name,
        Status: exp.status
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, "expenses.xlsx");
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/expenses/${selectedExpense.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        // Update the expenses list with the edited expense
        setExpenses(expenses.map(exp => 
          exp.id === selectedExpense.id 
            ? { ...exp, ...editForm, category_name: categories.find(c => c.id === editForm.category_id)?.name }
            : exp
        ));
        toast.success("Expense updated successfully");
        setIsEditDialogOpen(false);
      } else {
        throw new Error("Failed to update expense");
      }
    } catch (error) {
      toast.error("Failed to update expense");
      console.error(error);
    }
  };

  const openEditDialog = (expense: any) => {
    setSelectedExpense(expense);
    setEditForm({
      date: expense.date,
      category_id: expense.category_id,
      amount: expense.amount.toString(),
      description: expense.description || "",
      status: expense.status
    });
    setIsEditDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Expenses</span>
            <span>|</span>
            <span>Expense List</span>
          </div>
          <h1 className="text-2xl font-bold">Expense List</h1>
        </div>

        <div className="bg-white rounded-lg">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input placeholder="Search expenses..." className="w-64" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                EXCEL
              </Button>
              <Button className="bg-[#1a237e] hover:bg-purple-700" onClick={() => router.push('/expenses/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12">
                    <input type="checkbox" className="rounded" />
                  </TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-gray-50">
                    <TableCell>
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell className="font-medium">{expense.date}</TableCell>
                    <TableCell>{expense.reference}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {expense.description || "-"}
                    </TableCell>
                    <TableCell>${Number(expense.amount)}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {expense.category_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedExpense(expense);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(expense)}
                        >
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedExpense(expense);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-600">Rows per page: 10</div>
            <div className="text-sm text-gray-600">1 - {filtered.length} of {filtered.length}</div>
          </div>
        </div>
      </div>

      {/* View Dialog */}
      {selectedExpense && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Expense Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Reference</label>
                <p className="mt-1">{selectedExpense.reference}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="mt-1">{selectedExpense.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="mt-1">{selectedExpense.category_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Amount</label>
                <p className="mt-1">${Number(selectedExpense.amount)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1">{selectedExpense.description || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {selectedExpense.status}
                  </span>
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {selectedExpense && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Date *</label>
                <Input 
                  type="date" 
                  value={editForm.date} 
                  onChange={e => setEditForm({...editForm, date: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select value={editForm.category_id} onValueChange={(value) => setEditForm({...editForm, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Amount *</label>
                <Input 
                  type="number" 
                  step="0.01"
                  value={editForm.amount} 
                  onChange={e => setEditForm({...editForm, amount: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#1a237e] hover:bg-purple-700">
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {selectedExpense && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to delete expense "{selectedExpense.reference}"?</p>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(selectedExpense.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  )
}
