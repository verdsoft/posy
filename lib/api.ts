// lib/api.ts
import { Category, Brand, Unit, Warehouse, Adjustment, PaginatedResponse, AdjustmentItem } from "@/lib/types"

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/settings/categories")
  return res.json()
}

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch("/api/settings/brands")
  return res.json()
}

export async function fetchCustomers() {
  const res = await fetch("/api/customers")
  if (!res.ok) throw new Error("Failed to fetch customers")
  return res.json()
}

export async function fetchSuppliers() {
  const res = await fetch("/api/suppliers")
  if (!res.ok) throw new Error("Failed to fetch suppliers")
  return res.json()
}

export async function fetchUnits(): Promise<Unit[]> {
  const res = await fetch("/api/settings/units")
  return res.json()
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  const res = await fetch("/api/settings/warehouses")
  return res.json()
}

// lib/api.ts
export async function createAdjustment(data: {
  warehouse_id: string;
  date: string;
  type: 'addition' | 'subtraction';
  items: {
    product_id: string;
    quantity: number;
    type: 'addition' | 'subtraction';
  }[];
  notes?: string;
}): Promise<{ adjustment_id: string; reference: string }> {
  const res = await fetch("/api/adjustments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error("Failed to create adjustment")
  }

  return res.json()
}

export async function fetchAdjustments(params?: {
  warehouse_id?: string;
  date?: string;
  page?: number;
  limit?: number;
  search?: string; // 👈 ADD THIS
}): Promise<PaginatedResponse<Adjustment>> {
  const url = new URL("/api/adjustments", window.location.origin);

  if (params) {
    if (params.warehouse_id) url.searchParams.append("warehouse_id", params.warehouse_id);
    if (params.date) url.searchParams.append("date", params.date);
    if (params.page) url.searchParams.append("page", params.page.toString());
    if (params.limit) url.searchParams.append("limit", params.limit.toString());
    if (params.search) url.searchParams.append("search", params.search); // 👈 ADD THIS
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch adjustments");
  return res.json();
}


export async function fetchAdjustmentDetails(id: string): Promise<Adjustment & { items: AdjustmentItem[] }> {
  const res = await fetch(`/api/adjustments/${id}`)
  if (!res.ok) {
    throw new Error("Failed to fetch adjustment details")
  }

  return res.json()
}

// lib/api.ts
export interface ProductSearchResult {
  id: string
  code: string
  name: string
  stock: number
  unit_name?: string
}

export async function searchProducts(query: string) {
  const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error("Failed to search products")
  return await res.json()
}