// types/database.ts

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Company {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_number?: string;
  logo?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  zip_code?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Brand {
  id: string;
  name: string;
  description?: string;
  image?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Unit {
  id: string;
  name: string;
  short_name: string;
  base_unit?: string;
  operator?: '+' | '-' | '*' | '/';
  operation_value?: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchange_rate: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

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

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_number?: string;
  credit_limit: number;
  total_sales: number;
  total_paid: number;
  total_due: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tax_number?: string;
  total_purchases: number;
  total_paid: number;
  total_due: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Department {
  id: string;
  name: string;
  company_id?: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface OfficeShift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email?: string;
  phone?: string;
  department_id?: string;
  shift_id?: string;
  position?: string;
  salary?: number;
  hire_date?: Date;
  address?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface LeaveType {
  id: string;
  name: string;
  days_allowed: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: Date;
  end_date: Date;
  days: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Holiday {
  id: string;
  name: string;
  start_date: Date;
  end_date: Date;
  description?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: Date;
  time_in?: string;
  time_out?: string;
  break_time: number;
  total_hours: number;
  status: 'present' | 'absent' | 'late' | 'half_day';
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface Expense {
  id: string;
  reference: string;
  category_id?: string;
  amount: number;
  date: Date;
  description?: string;
  attachment?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}


export interface  Sale  {
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
  quantity: number;
  unit_price: number;
  discount: number;
  tax: number;
  subtotal: number;
  created_at: Date;
}

export interface Transfer {
  id: string;
  reference: string;
  from_warehouse_id: string;
  to_warehouse_id: string;
  date: Date;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  shipping: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TransferItem {
  id: string;
  transfer_id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  discount: number;
  tax: number;
  subtotal: number;
  created_at: Date;
}

export interface Adjustment {
  id: string;
  reference: string;
  warehouse_id: string;
  warehouse_name: string;
  date: Date;
  type: 'addition' | 'subtraction';
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  quantity: number;
}

export interface AdjustmentItem {
  id: string;
  adjustment_id: string;
  product_id: string;
  quantity: number;
  type: 'addition' | 'subtraction';
  created_at: Date;
}


export interface AdjustmentRow {
  id: string
  reference: string
  date: string
  type: string
  notes: string
  created_at: string
  updated_at: string
  warehouse_id: string
  warehouse_name: string
}

export interface AdjustmentItemRow {
  id: string
  product_id: string
  quantity: number
  previous_stock: number
  type: string
  adjustment_id: string
  product_code: string
  product_name: string
  unit_name: string
}



// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    total: number
    totalPages: number
    currentPage: number
    limit: number
  }
}


export interface Quotation {
  id: string
  reference: string
  date: string
  valid_until?: string
  customer_id: string
  warehouse_id: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount: number
  shipping: number
  total: number
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired'
  notes?: string
  created_at: string
  updated_at: string
  created_by?: string
}

export interface QuotationItem {
  id: string
  quotation_id: string
  product_id: string
  name: string
  code: string
  price: number
  quantity: number
  discount: number
  tax: number
  subtotal: number
}