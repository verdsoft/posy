// lib/api.ts
import { Category, Brand, Unit, Warehouse, Adjustment, PaginatedResponse, AdjustmentItem } from "@/lib/types"

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`/api/v2/settings/categories`)
  const data = await res.json()
  return data.data || data // Handle V2 paginated wrapper if present
}

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch("/api/v2/settings/brands")
  const data = await res.json()
  return data.data || data
}

export async function fetchCustomers() {
  const res = await fetch("/api/v2/customers")
  if (!res.ok) throw new Error("Failed to fetch customers")
  const data = await res.json()
  return data.data || data
}

export async function fetchSuppliers() {
  const res = await fetch("/api/v2/suppliers")
  if (!res.ok) throw new Error("Failed to fetch suppliers")
  const data = await res.json()
  return data.data || data
}

export async function fetchUnits(): Promise<Unit[]> {
  const res = await fetch("/api/v2/settings/units")
  const data = await res.json()
  return data.data || data
}

export async function fetchWarehouses(): Promise<Warehouse[]> {
  // Warehouse V2 endpoint usually returns list directly or in data.
  // Checking typical V2 pattern, it's often paginated { data: [], ... } or just [] if simple list.
  // We'll assume { data: ... } or array.
  const res = await fetch("/api/v2/settings/warehouses")
  const data = await res.json()
  return Array.isArray(data) ? data : (data.data || [])
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
  // Adjust input data to match V2 expectation if needed (e.g. types)
  const res = await fetch("/api/v2/adjustments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to create adjustment")
  }

  return res.json()
}

export async function fetchAdjustments(params?: {
  warehouse_id?: string;
  date?: string;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<PaginatedResponse<Adjustment>> {
  const url = new URL("/api/v2/adjustments", window.location.origin);

  if (params) {
    if (params.warehouse_id) url.searchParams.append("warehouse_id", params.warehouse_id);
    if (params.date) url.searchParams.append("date", params.date);
    if (params.page) url.searchParams.append("page", params.page.toString());
    if (params.limit) url.searchParams.append("limit", params.limit.toString());
    if (params.search) url.searchParams.append("search", params.search);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch adjustments");
  return res.json();
}


export async function fetchAdjustmentDetails(id: string): Promise<Adjustment & { items: AdjustmentItem[] }> {
  // Use V2 query param style
  const res = await fetch(`/api/v2/adjustments?id=${id}`)
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
  // Use V2 products endpoint with search param
  const res = await fetch(`/api/v2/products?search=${encodeURIComponent(query)}&limit=10`)
  if (!res.ok) throw new Error("Failed to search products")
  const data = await res.json()
  // V2 returns a paginated response { data: [...] }
  // We need to map it to what the UI expects if different, or just return the array
  // The UI expects an array of products.
  return data.data || []
}