"use client"
import type React from "react"
import { useState, useEffect, useRef } from "react"
import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { fetchCategories, fetchBrands, fetchUnits, fetchWarehouses } from "@/lib/api"
import AuthGuard from "@/components/AuthGuard"


const initialForm = {
  name: "",
  code: "",
  barcode: "",
  category_id: "",
  brand_id: "",
  unit_id: "",
  warehouse_id: "",
  cost: "",
  price: "",
  stock: "",
  alert_quantity: "",
  description: "",
  status: "active",
}

export default function CreateProduct() {
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dynamic options
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([])
  const [brands, setBrands] = useState<{ value: string; label: string }[]>([])
  const [units, setUnits] = useState<{ value: string; label: string }[]>([])
  const [warehouses, setWarehouses] = useState<{ value: string; label: string }[]>([])
  const [images, setImages] = useState<File[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch all select options from backend
useEffect(() => {
  const loadData = async () => {
    try {
      const [cats, brs, unts, whs] = await Promise.all([
        fetchCategories(),
        fetchBrands(),
        fetchUnits(),
        fetchWarehouses()
      ])

      setCategories(cats.map(c => ({ value: c.id, label: c.name })))
      setBrands(brs.map(b => ({ value: b.id, label: b.name })))
      setUnits(unts.map(u => ({ value: u.id, label: u.name })))
      setWarehouses(whs.map(w => ({ value: w.id, label: w.name })))
    } catch (error) {
      console.error("Failed to load settings:", error)
      // Set empty arrays or handle error as needed
      setCategories([])
      setBrands([])
      setUnits([])
      setWarehouses([])
    }
  }

  loadData()
}, [])


  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setForm((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSelect = (field: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Image upload handlers
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages(Array.from(e.target.files))
    }
  }

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

  const handleBrowseClick = () => {
    fileInputRef.current?.click()
  }

  const safeTrim = (val: unknown) => (typeof val === "string" ? val.trim() : "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (
      !safeTrim(form.name) ||
      !safeTrim(form.code) ||
      !safeTrim(form.category_id) ||
      !safeTrim(form.unit_id) ||
      !safeTrim(form.cost) ||
      !safeTrim(form.price)
    ) {
      setError("Please fill all required fields.")
      return
    }
    setSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value)
      })
      if (images.length > 0) {
        formData.append("image", images[0])
      }
      const res = await fetch("/api/products", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        setForm(initialForm)
        setImages([])
        alert("Product created!")
      } else {
        setError("Failed to create product")
        console.log(res)
      }
    } catch (err) {
      setError("Failed to create product-----")
      console.log("Error creating product:", err)
    }
    setSubmitting(false)
  }

  return (
     <AuthGuard>
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Products</span>
            <span>|</span>
            <span>Create product</span>
          </div>
          <h1 className="text-2xl font-bold">Create product</h1>
        </div>

        <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input id="name" value={form.name} onChange={handleInput} placeholder="Enter Name Product" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Code *</label>
                  <Input id="code" value={form.code} onChange={handleInput} className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Barcode</label>
                  <Input id="barcode" value={form.barcode} onChange={handleInput} className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={form.category_id} onValueChange={v => handleSelect("category_id", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Brand</label>
                  <Select value={form.brand_id} onValueChange={v => handleSelect("brand_id", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Unit *</label>
                  <Select value={form.unit_id} onValueChange={v => handleSelect("unit_id", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((u) => (
                        <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Warehouse</label>
                  <Select value={form.warehouse_id} onValueChange={v => handleSelect("warehouse_id", v)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Cost *</label>
                  <Input id="cost" value={form.cost} onChange={handleInput} placeholder="0.00" className="mt-1" type="number" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Price *</label>
                  <Input id="price" value={form.price} onChange={handleInput} placeholder="0.00" className="mt-1" type="number" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <Input id="stock" value={form.stock} onChange={handleInput} placeholder="0.00" className="mt-1" type="number" min="0" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Alert Quantity</label>
                  <Input id="alert_quantity" value={form.alert_quantity} onChange={handleInput} placeholder="0.00" className="mt-1" type="number" min="0" />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select value={form.status} onValueChange={v => handleSelect("status", v)}>
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
                <Textarea id="description" value={form.description} onChange={handleInput} placeholder="A few words ..." className="mt-1" rows={4} />
              </div>
              {error && <div className="text-red-600 text-sm">{error}</div>}
              <Button className="bg-[#1a237e] hover:bg-purple-700" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
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
        </form>
      </div>
    </DashboardLayout>
    </AuthGuard>
  )
}