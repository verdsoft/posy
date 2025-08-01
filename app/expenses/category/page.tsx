"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit, Eye, Trash2, Plus, FileDown } from "lucide-react"
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function ExpenseCategory() {
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form states
  const [createForm, setCreateForm] = useState({ name: "", description: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "" });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/expenses-categories");
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  const filtered = categories.filter(cat =>
    cat.name?.toLowerCase().includes(search.toLowerCase()) ||
    (cat.description && cat.description.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/expenses-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm)
      });
      if (res.ok) {
        await fetchCategories(); // Refresh the list
        toast.success("Category created successfully");
        setIsCreateDialogOpen(false);
        setCreateForm({ name: "", description: "" });
      } else {
        throw new Error("Failed to create category");
      }
    } catch (error) {
      toast.error("Failed to create category");
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/expenses-categories/${selectedCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        await fetchCategories(); // Refresh the list
        toast.success("Category updated successfully");
        setIsEditDialogOpen(false);
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses-categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCategories(); // Refresh the list
        toast.success("Category deleted successfully");
        setIsDeleteDialogOpen(false);
      } else {
        throw new Error("Failed to delete category");
      }
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const openEditDialog = (category: any) => {
    setSelectedCategory(category);
    setEditForm({
      name: category.name,
      description: category.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Expense Categories List', 14, 16);
    const tableData = filtered.map(cat => [
      cat.name,
      cat.description || "-",
      cat.status
    ]);
    autoTable(doc, {
      head: [['Name', 'Description', 'Status']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    });
    doc.save('expense-categories.pdf');
  };

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filtered.map(cat => ({
        Name: cat.name,
        Description: cat.description || "-",
        Status: cat.status
      }))
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expense Categories");
    XLSX.writeFile(workbook, "expense-categories.xlsx");
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Expenses</span>
            <span>|</span>
            <span>Expense Category</span>
          </div>
          <h1 className="text-2xl font-bold">Expense Category</h1>
        </div>

        <div className="bg-white rounded-lg">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input placeholder="Search categories..." className="w-64" value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportExcel}>
                <FileDown className="h-4 w-4 mr-2" />
                EXCEL
              </Button>
              <Button className="bg-[#1a237e] hover:bg-purple-700" onClick={() => setIsCreateDialogOpen(true)}>
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
                  <TableHead>Category Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((category) => (
                  <TableRow key={category.id} className="hover:bg-gray-50">
                    <TableCell>
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description || "-"}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {category.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category);
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Expense Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Category Name *</label>
              <Input 
                value={createForm.name} 
                onChange={e => setCreateForm({...createForm, name: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input 
                value={createForm.description} 
                onChange={e => setCreateForm({...createForm, description: e.target.value})} 
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-[#1a237e] hover:bg-purple-700">
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      {selectedCategory && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Category Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="mt-1">{selectedCategory.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1">{selectedCategory.description || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {selectedCategory.status}
                  </span>
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      {selectedCategory && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category Name *</label>
                <Input 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  required 
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                />
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
      {selectedCategory && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>Are you sure you want to delete category "{selectedCategory.name}"?</p>
              <p className="text-sm text-gray-500">This action cannot be undone.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleDelete(selectedCategory.id)}
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
