import type { RowDataPacket } from "mysql2"

// Define the Sale type interface
export interface Sale extends RowDataPacket {
  id: number;
  reference: string;
  customer_id: number;
  warehouse_id: number;
  date: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  shipping: number;
  total: number;
  paid: number;
  due: number;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string;  // From JOIN
  warehouse_name?: string; // From JOIN
}

export interface Image {
    image?: string;
}


export interface Product extends RowDataPacket{
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