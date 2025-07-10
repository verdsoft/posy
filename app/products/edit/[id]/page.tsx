"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import DashboardLayout from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Eye, Edit, Trash2 } from "lucide-react"

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
  const [isLoading, setIsLoading] = useState(true)
    const [images, setImages] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)

  
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const productId = params.id as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Image upload handlers
//   const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files.length > 0) {
//       setImages(Array.from(e.target.files))
//     }
//   }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setImages(Array.from(e.dataTransfer.files))
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

//   const handleBrowseClick = () => {
//     fileInputRef.current?.click()
//   }


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch all data in parallel
        const [productRes, catsRes, brsRes, untsRes, whsRes] = await Promise.all([
          fetch(`/api/products?id=${productId}`),
          fetch("/api/settings/categories"),
          fetch("/api/settings/brands"),
          fetch("/api/settings/units"),
          fetch("/api/settings/warehouses"),
        ])

        if (!productRes.ok) throw new Error("Failed to fetch product")
        
        const [productData, cats, brs, unts, whs] = await Promise.all([
          productRes.json(),
          catsRes.json(),
          brsRes.json(),
          untsRes.json(),
          whsRes.json(),
        ])

        // Set form data
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

        // Set dropdown options
        setCategories((cats || []).map((c: any) => ({ value: c.id, label: c.name })))
        setBrands((brs || []).map((b: any) => ({ value: b.id, label: b.name })))
        setUnits((unts || []).map((u: any) => ({ value: u.id, label: u.name })))
        setWarehouses((whs || []).map((w: any) => ({ value: w.id, label: w.name })))

      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to load product data",
          variant: "destructive",
        })
        router.push("/products/list")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [productId, router, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewImage(e.target.files[0])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    
    setError(null)
    const requiredFields: (keyof FormData)[] = ["name", "code", "category_id", "unit_id", "cost", "price"]
    const missingFields = requiredFields.filter(field => !form[field]?.toString().trim())

    if (missingFields.length > 0) {
      setError(`Missing required fields: ${missingFields.join(", ")}`)
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined) formData.append(key, value.toString())
      })

      if (newImage) formData.append("image", newImage)

      const response = await fetch(`/api/products?id=${productId}`, {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to update product")

      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      router.push("/products/list")
    } catch (error) {
      console.error("Update error:", error)
      setError("Failed to update product. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading || !form) {
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
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Products</span>
            <span>|</span>
            <span>Edit product</span>
          </div>
          <h1 className="text-2xl font-bold">Edit product</h1>
        </div>

        <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={handleInput}
                    placeholder="Product name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Code *</label>
                  <Input
                    id="code"
                    value={form.code}
                    onChange={handleInput}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Barcode</label>
                  <Input 
                    id="barcode" 
                    value={form.barcode} 
                    onChange={handleInput} 
                    className="mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select 
                    value={form.category_id} 
                    onValueChange={v => handleSelect("category_id", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose Category" />
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
                  <label className="text-sm font-medium">Brand</label>
                  <Select 
                    value={form.brand_id} 
                    onValueChange={v => handleSelect("brand_id", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose Brand" />
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
                  <label className="text-sm font-medium">Unit *</label>
                  <Select 
                    value={form.unit_id} 
                    onValueChange={v => handleSelect("unit_id", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose Unit" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Warehouse</label>
                  <Select 
                    value={form.warehouse_id} 
                    onValueChange={v => handleSelect("warehouse_id", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose Warehouse" />
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
                  <label className="text-sm font-medium">Cost *</label>
                  <Input 
                    id="cost" 
                    value={form.cost} 
                    onChange={handleInput} 
                    placeholder="0.00" 
                    className="mt-1" 
                    type="number" 
                    min="0" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price *</label>
                  <Input 
                    id="price" 
                    value={form.price} 
                    onChange={handleInput} 
                    placeholder="0.00" 
                    className="mt-1" 
                    type="number" 
                    min="0" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <Input 
                    id="stock" 
                    value={form.stock} 
                    onChange={handleInput} 
                    placeholder="0.00" 
                    className="mt-1" 
                    type="number" 
                    min="0" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Alert Quantity</label>
                  <Input 
                    id="alert_quantity" 
                    value={form.alert_quantity} 
                    onChange={handleInput} 
                    placeholder="0.00" 
                    className="mt-1" 
                    type="number" 
                    min="0" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={form.status} 
                    onValueChange={v => handleSelect("status", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="active" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  id="description" 
                  value={form.description} 
                  onChange={handleInput} 
                  placeholder="A few words ..." 
                  className="mt-1" 
                  rows={4} 
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm py-2">
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : "Update Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/products/list")}
                >
                  Cancel
                </Button>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              {form.image && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">Current Image</h3>
                  <img
                    src={form.image}
                    alt="Product"
                    className="w-full h-64 object-contain rounded"
                  />
                </div>
              )}


        <div className="lg:col-span-1">
              <div
                className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${dragActive ? "border-purple-500 bg-purple-50" : ""}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={handleBrowseClick}
                style={{ cursor: "pointer" }}
              >
                <div className="mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">👆</div>
                </div>
                <h3 className="font-medium mb-2">Image</h3>
                <p className="text-sm text-gray-500 mb-4">Drag & Drop or Click to Select Image</p>
                <input
                  type="file"
                  className="mt-2 hidden"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {images.map((file, idx) => (
                    <div key={idx} className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="object-cover w-full h-full"
                        onLoad={e => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>


            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}