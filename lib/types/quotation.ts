export interface Quotation {
  id: string;
  reference: string;
  customer_id?: string;
  warehouse_id?: string;
  date: Date;
  valid_until?: Date;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface QuotationItem {
  id: string;
  quotation_id: string;
  product_id: string;
  name: string;
  code: string;
  price: number;
  quantity: number;
  discount: number;
  tax: number;
  subtotal: number;
  created_at: Date;
}