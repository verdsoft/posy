"use client"

import { useState, useEffect } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileDown, Eye, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ProductAlert {
  id: string
  code: string
  name: string
  warehouse_name: string
  stock: number
  alert_quantity: number
  category_name: string
  brand_name: string
  unit_name: string
  cost: number
  price: number
  status: string
}

export default function ProductQuantityAlerts() {
  const [products, setProducts] = useState<ProductAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedWarehouse, setSelectedWarehouse] = useState("all")
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductAlert | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    category_id: "",
    brand_id: "",
    unit_id: "",
    warehouse_id: "",
    cost: 0,
    price: 0,
    stock: 0,
    alert_quantity: 0,
    description: "",
    status: ""
  })

  // Fetch products with alerts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/products')
        if (!res.ok) throw new Error("Failed to fetch products")
        const data = await res.json()
        
        // Filter products that have low stock (stock <= alert_quantity)
        const alertProducts = data.filter((product: any) => 
          product.stock <= product.alert_quantity
        )
        
        setProducts(alertProducts)
      } catch (error) {
        toast.error("Failed to load products")
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [])

  // Filter products based on search and warehouse
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesWarehouse = selectedWarehouse === "all" || 
      product.warehouse_name?.toLowerCase().includes(selectedWarehouse.toLowerCase())
    
    return matchesSearch && matchesWarehouse
  })

  // Handle edit product
  const handleEdit = async () => {
    if (!selectedProduct) return
    
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, id: selectedProduct.id })
      })
      
      if (!res.ok) throw new Error("Failed to update product")
      
      const updatedProduct = await res.json()
      setProducts(products.map(p => 
        p.id === selectedProduct.id ? { ...p, ...updatedProduct } : p
      ))
      setShowEditModal(false)
      resetForm()
      toast.success("Product updated successfully")
    } catch (error) {
      toast.error("Failed to update product")
      console.error(error)
    }
  }

  // Handle delete product
  const handleDelete = async () => {
    if (!selectedProduct) return
    
    try {
      const res = await fetch(`/api/products?id=${selectedProduct.id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error("Failed to delete product")
      
      setProducts(products.filter(p => p.id !== selectedProduct.id))
      setShowDeleteModal(false)
      toast.success("Product deleted successfully")
    } catch (error) {
      toast.error("Failed to delete product")
      console.error(error)
    }
  }

  // Open view modal
  const openViewModal = (product: ProductAlert) => {
    setSelectedProduct(product)
    setShowViewModal(true)
  }

  // Open edit modal
  const openEditModal = (product: ProductAlert) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name || "",
      code: product.code || "",
      category_id: "",
      brand_id: "",
      unit_id: "",
      warehouse_id: "",
      cost: product.cost || 0,
      price: product.price || 0,
      stock: product.stock || 0,
      alert_quantity: product.alert_quantity || 0,
      description: "",
      status: product.status || ""
    })
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = (product: ProductAlert) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      category_id: "",
      brand_id: "",
      unit_id: "",
      warehouse_id: "",
      cost: 0,
      price: 0,
      stock: 0,
      alert_quantity: 0,
      description: "",
      status: ""
    })
  }

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    
    doc.text('Product Quantity Alerts Report', 14, 16)
    
    const tableData = filteredProducts.map(product => [
      product.code,
      product.name,
      product.warehouse_name || "-",
      product.stock.toString(),
      product.alert_quantity.toString(),
      product.category_name || "-",
      product.brand_name || "-",
      `$${product.price || "0.00"}`
    ])
    
    autoTable(doc, {
      head: [['Code', 'Product', 'Warehouse', 'Quantity', 'Alert Quantity', 'Category', 'Brand', 'Price']],
      body: tableData,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [26, 35, 126] }
    })
    
    doc.save('product-quantity-alerts.pdf')
  }

  // Export to Excel
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredProducts.map(product => ({
        Code: product.code,
        Product: product.name,
        Warehouse: product.warehouse_name || "-",
        Quantity: product.stock,
        'Alert Quantity': product.alert_quantity,
        Category: product.category_name || "-",
        Brand: product.brand_name || "-",
        Price: `$${product.price || "0.00"}`
      }))
    )
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Product Alerts")
    XLSX.writeFile(workbook, "product-quantity-alerts.xlsx")
  }

  // Get unique warehouses for filter
  const warehouses = [...new Set(products.map(p => p.warehouse_name).filter(Boolean))]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Reports</span>
            <span>|</span>
            <span>Product Quantity Alerts</span>
          </div>
          <h1 className="text-2xl font-bold">Product Quantity Alerts</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-64">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Warehouse</label>
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Warehouses</SelectItem>
                      {warehouses.map(warehouse => (
                        <SelectItem key={warehouse} value={warehouse.toLowerCase()}>
                          {warehouse}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search products..." 
                    className="w-64 pl-10" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportPDF}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportExcel}
                >
                  <FileDown className="h-4 w-4 mr-2" />
                  EXCEL
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="p-6 border-b bg-gray-50">
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{products.length}</div>
                <div className="text-sm text-gray-600">Total Alerts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{filteredProducts.length}</div>
                <div className="text-sm text-gray-600">Filtered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {products.filter(p => p.stock === 0).length}
                </div>
                <div className="text-sm text-gray-600">Out of Stock</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {products.filter(p => p.stock > 0 && p.stock <= p.alert_quantity).length}
                </div>
                <div className="text-sm text-gray-600">Low Stock</div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Code</th>
                  <th className="text-left p-4 font-medium">Product</th>
                  <th className="text-left p-4 font-medium">Warehouse</th>
                  <th className="text-left p-4 font-medium">Quantity</th>
                  <th className="text-left p-4 font-medium">Alert Quantity</th>
                  <th className="text-left p-4 font-medium">Category</th>
                  <th className="text-left p-4 font-medium">Brand</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="text-center p-6">Loading...</td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-6">No products with quantity alerts found.</td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-medium">{product.code}</td>
                      <td className="p-4 text-blue-600">{product.name}</td>
                      <td className="p-4">{product.warehouse_name || "-"}</td>
                      <td className="p-4">
                        <span className={`font-medium ${
                          product.stock === 0 ? "text-red-600" : 
                          product.stock <= product.alert_quantity ? "text-orange-600" : 
                          "text-green-600"
                        }`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="destructive" className="bg-red-100 text-red-800">
                          {product.alert_quantity}
                        </Badge>
                      </td>
                      <td className="p-4">{product.category_name || "-"}</td>
                      <td className="p-4">{product.brand_name || "-"}</td>
                      <td className="p-4">${product.price || "0.00"}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(product)}
                          >
                            <Eye className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(product)}
                          >
                            <Edit className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteModal(product)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Rows per page:
              <Select defaultValue="10">
                <SelectTrigger className="w-16 ml-2 inline-flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredProducts.length > 0 
                  ? `1 - ${Math.min(filteredProducts.length, 10)} of ${filteredProducts.length}` 
                  : '0 - 0 of 0'}
              </span>
              <div className="flex gap-1">
                <button className="px-3 py-1 text-sm border rounded disabled:opacity-50" disabled>
                  prev
                </button>
                <button className="px-3 py-1 text-sm border rounded">next</button>
              </div>
            </div>
          </div>
        </div>

        {/* View Product Modal */}
        {selectedProduct && (
          <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Product Details</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 p-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Code</label>
                  <p className="mt-1 text-sm">{selectedProduct.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="mt-1 text-sm">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="mt-1 text-sm">{selectedProduct.category_name || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Brand</label>
                  <p className="mt-1 text-sm">{selectedProduct.brand_name || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Warehouse</label>
                  <p className="mt-1 text-sm">{selectedProduct.warehouse_name || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Unit</label>
                  <p className="mt-1 text-sm">{selectedProduct.unit_name || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Stock</label>
                  <p className="mt-1 text-sm">{selectedProduct.stock}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Alert Quantity</label>
                  <p className="mt-1 text-sm">{selectedProduct.alert_quantity}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cost</label>
                  <p className="mt-1 text-sm">${selectedProduct.cost || "0.00"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Price</label>
                  <p className="mt-1 text-sm">${selectedProduct.price || "0.00"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className="mt-1 text-sm">{selectedProduct.status}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Edit Product Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 p-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  placeholder="Product name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Code *</label>
                <Input
                  placeholder="Product code"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Cost</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock</label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value) || 0})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Alert Quantity</label>
                <Input
                  type="number"
                  value={formData.alert_quantity}
                  onChange={(e) => setFormData({...formData, alert_quantity: parseInt(e.target.value) || 0})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="mt-1 w-full p-2 border rounded"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Product description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700" 
                  onClick={handleEdit}
                  disabled={!formData.name || !formData.code}
                >
                  Update
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        {selectedProduct && (
          <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Product</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete product "{selectedProduct.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="bg-red-600 hover:bg-red-700" 
                    onClick={handleDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  )
}
