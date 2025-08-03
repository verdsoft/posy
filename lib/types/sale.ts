export interface Sale {
  id: string;
  reference: string;
  customer_id?: string;
  warehouse_id?: string;
  date: Date;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  shipping: number;
  total: number;
  paid: number;
  due: number;
  status: 'pending' | 'completed' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  subtotal: number;
  created_at: Date;
}