export interface Product {
  id: string;
  name: string;
  code: string;
  barcode?: string;
  category_id?: string;
  brand_id?: string;
  unit_id?: string;
  warehouse_id?: string;
  cost: number;
  price: number;
  stock: number;
  alert_quantity: number;
  description?: string;
  image?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface ProductSearchResult {
  id: string;
  code: string;
  name: string;
  stock: number;
  unit_name?: string;
}