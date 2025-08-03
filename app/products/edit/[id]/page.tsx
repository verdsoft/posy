"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Image as ImageIcon, Upload, X } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Category } from "@/lib/types/index"
import { useGetProductByIdQuery, useUpdateProductMutation } from '@/lib/slices/productsApi'

interface FormData {
  name: string
  code: string
  barcode: string
  category_id: string
  brand_id: string
  unit_id: string
  warehouse_id: string
  cost: string
  price: string
  stock: string
  alert_quantity: string
  description: string
  status: string
  image?: string
}

interface Option {
  value: string
  label: string
}

export default function EditProduct() {
  const [form, setForm] = useState<FormData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<Option[]>([])
  const [brands, setBrands] = useState<Option[]>([])
  const [units, setUnits] = useState<Option[]>([])
  const [warehouses, setWarehouses] = useState<Option[]>([])
  const [newImage, setNewImage] = useState<File | null>(null)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const productId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: productData, isLoading: isProductLoading } = useGetProductByIdQuery(productId)
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation()

  // Load dropdown data
  useEffect(() => {
    const loadDropdownData = async () => {
      try {
        const [categoriesRes, brandsRes, unitsRes, warehousesRes] = await Promise.all([
          fetch("/api/settings/categories"),
          fetch("/api/settings/brands"),
          fetch("/api/settings/units"),
          fetch("/api/settings/warehouses"),
        ])

        const [categoriesData, brandsData, unitsData, warehousesData] = await Promise.all([
          categoriesRes.json(),
          brandsRes.json(),
          unitsRes.json(),
          warehousesRes.json(),
        ])

        setCategories(categoriesData.map((c: any) => ({ value: c.id, label: c.name })))
        setBrands(brandsData.map((b: any) => ({ value: b.id, label: b.name })))
        setUnits(unitsData.map((u: any) => ({ value: u.id, label: u.name })))
        setWarehouses(warehousesData.map((w: any) => ({ value: w.id, label: w.name })))
      } catch (error) {
        console.error("Error loading dropdown data:", error)
        toast({
          title: "Error",
          description: "Failed to load form data",
          variant: "destructive",
        })
      }
    }

    loadDropdownData()
  }, [toast])

  useEffect(() => {
    if (productData) {
      setForm({
        name: productData.name || "",
        code: productData.code || "",
        barcode: productData.barcode || "",
        category_id: productData.category_id || "",
        brand_id: productData.brand_id || "",
        unit_id: productData.unit_id || "",
        warehouse_id: productData.warehouse_id || "",
        cost: productData.cost?.toString() || "0",
        price: productData.price?.toString() || "0",
        stock: productData.stock?.toString() || "0",
        alert_quantity: productData.alert_quantity?.toString() || "0",
        description: productData.description || "",
        status: productData.status || "active",
        image: productData.image || "",
      })
    }
  }, [productData])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewImage(e.target.files[0])
    }
  }

  const handleRemoveImage = () => {
    setNewImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setForm(prev => prev ? { ...prev, [id]: value } : null)
  }

  const handleSelect = (field: keyof FormData, value: string) => {
    setForm(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isActive: boolean) => {
    e.preventDefault()
    // setDragActive(isActive) // This state is no longer used
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    // setDragActive(false) // This state is no longer used
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setNewImage(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    
    setError(null)
    const requiredFields: (keyof FormData)[] = ["name", "code", "category_id", "unit_id", "cost", "price"]
    const missingFields = requiredFields.filter(field => !form[field]?.toString().trim())

    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.join(", ")}`)
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value.toString())
      })

      if (newImage) formData.append("image", newImage)

      // Use mutation
      await updateProduct({ id: productId, data: formData }).unwrap()

      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      router.push("/products/list")
    } catch (error) {
      setError("Failed to update product")
      toast({
        title: "Error",
        description: "Failed to update product",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (isProductLoading || !form) {
    return (
      <DashboardLayout>
        <div className="p-6 flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <span>Products</span>
            <span>|</span>
            <span>Edit Product</span>
          </div>
          <h1 className="text-xl font-semibold">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Product Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={handleInput}
                        placeholder="Product name"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="code"
                        value={form.code}
                        onChange={handleInput}
                        placeholder="Product code"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium block mb-1">Barcode</label>
                      <Input 
                        id="barcode" 
                        value={form.barcode} 
                        onChange={handleInput} 
                        placeholder="Optional barcode"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <Select 
                        value={form.category_id} 
                        onValueChange={v => handleSelect("category_id", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium block mb-1">Brand</label>
                      <Select 
                        value={form.brand_id} 
                        onValueChange={v => handleSelect("brand_id", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((b) => (
                            <SelectItem key={b.value} value={b.value}>
                              {b.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Unit <span className="text-red-500">*</span>
                      </label>
                      <Select 
                        value={form.unit_id} 
                        onValueChange={v => handleSelect("unit_id", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u.value} value={u.value}>
                              {u.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Inventory & Pricing</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium block mb-1">Warehouse</label>
                      <Select 
                        value={form.warehouse_id} 
                        onValueChange={v => handleSelect("warehouse_id", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                          {warehouses.map((w) => (
                            <SelectItem key={w.value} value={w.value}>
                              {w.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Cost <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-muted-foreground text-xs">$</span>
                        <Input 
                          id="cost" 
                          value={form.cost} 
                          onChange={handleInput} 
                          placeholder="0.00" 
                          className="pl-8"
                          type="number" 
                          min="0" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium block mb-1">
                        Price <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-muted-foreground text-xs">$</span>
                        <Input 
                          id="price" 
                          value={form.price} 
                          onChange={handleInput} 
                          placeholder="0.00" 
                          className="pl-8"
                          type="number" 
                          min="0" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">Stock</label>
                      <Input 
                        id="stock" 
                        value={form.stock} 
                        onChange={handleInput} 
                        placeholder="0" 
                        type="number" 
                        min="0" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium block mb-1">Low Stock Alert</label>
                      <Input 
                        id="alert_quantity" 
                        value={form.alert_quantity} 
                        onChange={handleInput} 
                        placeholder="0" 
                        type="number" 
                        min="0" 
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">Status</label>
                      <Select 
                        value={form.status} 
                        onValueChange={v => handleSelect("status", v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Description</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Textarea 
                    id="description" 
                    value={form.description} 
                    onChange={handleInput} 
                    placeholder="Enter product description..." 
                    className="min-h-[100px]"
                  />
                </CardContent>
              </Card>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <X className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/products/list")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : "Update Product"}
                </Button>
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base">Product Image</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  {form.image && !newImage && (
                    <div className="mb-4">
                      <h3 className="text-xs font-medium mb-2">Current Image</h3>
                      <div className="relative">
                        <img
                          src={form.image}
                          alt="Product"
                          className="w-full h-48 object-contain rounded border"
                        />
                      </div>
                    </div>
                  )}

                  <div
                    className="border-2 border-dashed rounded-lg p-6 text-center transition-colors border-muted hover:border-primary/50"
                    onDrop={handleDrop}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onClick={handleBrowseClick}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-muted rounded-lg mx-auto flex items-center justify-center">
                        {newImage ? (
                          <img
                            src={URL.createObjectURL(newImage)}
                            alt="Preview"
                            className="object-cover w-full h-full rounded-lg"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <h3 className="font-medium mb-2 text-sm">
                      {newImage ? "Change Image" : "Upload Image"}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Drag & drop or click to browse
                    </p>
                    <input
                      type="file"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </div>

                  {newImage && (
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground truncate">
                        {newImage.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveImage}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}