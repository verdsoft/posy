export interface Purchase {
  id: string;
  reference: string;
  supplier_id?: string;
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
  status: 'pending' | 'received' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PurchaseItem {
  id: string;
  purchase_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  discount: number;
  tax: number;
  subtotal: number;
  created_at: Date;
}