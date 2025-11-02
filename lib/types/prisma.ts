/**
 * Generated Prisma types for the POS system
 * This file contains type definitions that match the Prisma schema
 */

import { Prisma } from '@prisma/client'

// Base enums from Prisma
export type Status = 'active' | 'inactive'
export type AdjustmentType = 'addition' | 'subtraction'
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day'
export type ExpenseStatus = 'pending' | 'approved' | 'rejected'
export type PurchaseStatus = 'pending' | 'received' | 'cancelled'
export type PaymentStatus = 'unpaid' | 'partial' | 'paid'
export type SaleStatus = 'pending' | 'completed' | 'cancelled'
export type QuotationStatus = 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
export type TransferStatus = 'pending' | 'completed' | 'cancelled'
export type UserRole = 'admin' | 'manager' | 'user'

// Organization types
export type Organization = Prisma.organizationGetPayload<object>

export type CreateOrganizationInput = Prisma.organizationCreateInput
export type UpdateOrganizationInput = Prisma.organizationUpdateInput

// Organization with PDF-specific fields
export interface OrganizationPDF {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  fax?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  postal_code?: string | null
  tax_number?: string | null
  registration_number?: string | null
  website?: string | null
  logo?: string | null
  bank_name?: string | null
  bank_account?: string | null
  bank_branch?: string | null
  swift_code?: string | null
  iban?: string | null
  invoice_prefix?: string | null
  quotation_prefix?: string | null
  invoice_footer?: string | null
  quotation_footer?: string | null
  terms_conditions?: string | null
  payment_terms?: string | null
  currency?: string | null
  currency_symbol?: string | null
  date_format?: string | null
  timezone?: string | null
  language?: string | null
}

// Quotation types with relations - FIXED to match your schema
export type Quotation = Prisma.quotationsGetPayload<{
  include: {
    customers: { select: { name: true } }
    warehouses: { select: { name: true } }
    quotation_items: true
  }
}>

export type QuotationWithCustomer = Prisma.quotationsGetPayload<{
  include: {
    customers: true
    warehouses: true
  }
}>

export type QuotationItem = Prisma.quotation_itemsGetPayload<{
  include: {
    products: { select: { name: true, code: true } }
  }
}>

export type CreateQuotationInput = {
  reference?: string
  customer_id: number | string
  warehouse_id: number | string
  date?: string
  valid_until?: string
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  discount?: number
  shipping?: number
  total: number
  status?: QuotationStatus
  notes?: string
  created_by?: number | string
  items: CreateQuotationItemInput[]
}

export type CreateQuotationItemInput = {
  product_id: number | string
  quantity: number
  unit_price: number
  discount?: number
  tax?: number
  subtotal: number
}

export type UpdateQuotationInput = Partial<CreateQuotationInput>

// Invoice types with relations - FIXED to match your schema
export type Invoice = Prisma.invoicesGetPayload<{
  include: {
    customers: { select: { name: true } }
    warehouses: { select: { name: true } }
    sales: { select: { reference: true } }
    quotations: { select: { reference: true } }
    invoice_items: true
  }
}>

export type InvoiceWithCustomer = Prisma.invoicesGetPayload<{
  include: {
    customers: true
    warehouses: true
    sales: true
    quotations: true
  }
}>

export type InvoiceItem = Prisma.invoice_itemsGetPayload<{
  include: {
    products: { select: { name: true, code: true } }
  }
}>

export type CreateInvoiceInput = {
  reference?: string
  customer_id: number | string
  warehouse_id: number | string
  sale_id?: number | string
  quotation_id?: number | string
  date: string
  due_date?: string
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  discount?: number
  shipping?: number
  total: number
  paid?: number
  due?: number
  status?: InvoiceStatus
  payment_status?: PaymentStatus
  notes?: string
  created_by?: number | string
  items: {
    product_id: number | string
    quantity: number
    unit_price: number
    discount?: number
    tax?: number
    subtotal: number
  }[]
}

export type UpdateInvoiceInput = Partial<CreateInvoiceInput>

// Customer types
export type Customer = Prisma.customersGetPayload<object>
export type CreateCustomerInput = Prisma.customersCreateInput
export type UpdateCustomerInput = Prisma.customersUpdateInput

// Product types - FIXED to match your schema
export type Product = Prisma.productsGetPayload<{
  include: {
    categories: { select: { name: true } }
    brands: { select: { name: true } }
    units: { select: { name: true, short_name: true } }
    warehouses: { select: { name: true } }
  }
}>

export type ProductBasic = Prisma.productsGetPayload<object>
export type CreateProductInput = Prisma.productsCreateInput
export type UpdateProductInput = Prisma.productsUpdateInput

// Sale types - FIXED to match your schema
export type Sale = Prisma.salesGetPayload<{
  include: {
    customers: { select: { name: true, email: true } }
    warehouses: { select: { name: true } }
    sale_items: {
      include: {
        products: { select: { name: true, code: true } }
      }
    }
  }
}>

export type SaleItem = Prisma.sale_itemsGetPayload<{
  include: {
    products: { select: { name: true, code: true } }
  }
}>

export type CreateSaleInput = {
  reference?: string
  customer_id?: number | string
  warehouse_id: number | string
  date?: string
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  discount?: number
  shipping?: number
  total: number
  paid?: number
  due?: number
  status?: SaleStatus
  payment_status?: PaymentStatus
  notes?: string
  created_by?: number | string
  items: {
    product_id: number | string
    quantity: number
    unit_price: number
    discount?: number
    tax?: number
    subtotal?: number
  }[]
}

export type UpdateSaleInput = Partial<CreateSaleInput>

// Purchase types - FIXED to match your schema
export type Purchase = Prisma.purchasesGetPayload<{
  include: {
    suppliers: { select: { name: true } }
    warehouses: { select: { name: true } }
    purchase_items: {
      include: {
        products: { select: { name: true, code: true } }
      }
    }
  }
}>

export type PurchaseItem = Prisma.purchase_itemsGetPayload<{
  include: {
    products: { select: { name: true, code: true } }
  }
}>

export type CreatePurchaseInput = {
  reference?: string
  supplier_id: number | string
  warehouse_id: number | string
  date?: string
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  discount?: number
  shipping?: number
  total: number
  paid?: number
  due?: number
  status?: PurchaseStatus
  payment_status?: PaymentStatus
  notes?: string
  created_by?: number | string
  items: {
    product_id: number | string
    quantity: number
    unit_cost: number
    discount?: number
    tax?: number
    subtotal?: number
  }[]
}

export type UpdatePurchaseInput = Partial<CreatePurchaseInput>

// Supplier types
export type Supplier = Prisma.suppliersGetPayload<object>
export type CreateSupplierInput = Prisma.suppliersCreateInput
export type UpdateSupplierInput = Prisma.suppliersUpdateInput

// Settings types
export type Brand = Prisma.brandsGetPayload<object>
export type CreateBrandInput = Prisma.brandsCreateInput
export type UpdateBrandInput = Prisma.brandsUpdateInput

export type Category = Prisma.categoriesGetPayload<object>
export type CreateCategoryInput = Prisma.categoriesCreateInput
export type UpdateCategoryInput = Prisma.categoriesUpdateInput

export type Currency = Prisma.currenciesGetPayload<object>
export type CreateCurrencyInput = Prisma.currenciesCreateInput
export type UpdateCurrencyInput = Prisma.currenciesUpdateInput

export type Unit = Prisma.unitsGetPayload<object>
export type CreateUnitInput = Prisma.unitsCreateInput
export type UpdateUnitInput = Prisma.unitsUpdateInput

export type Warehouse = Prisma.warehousesGetPayload<object>
export type CreateWarehouseInput = Prisma.warehousesCreateInput
export type UpdateWarehouseInput = Prisma.warehousesUpdateInput

// User types
export type User = Prisma.usersGetPayload<object>

// Adjustment types - FIXED to match your schema
export type Adjustment = Prisma.adjustmentsGetPayload<{
  include: {
    warehouses: { select: { name: true } }
    adjustment_items: {
      include: {
        products: { select: { name: true, code: true } }
      }
    }
  }
}>

export type AdjustmentItem = Prisma.adjustment_itemsGetPayload<{
  include: {
    products: { select: { name: true, code: true } }
  }
}>

export type CreateAdjustmentInput = {
  reference?: string
  warehouse_id: number | string
  date?: string
  type: AdjustmentType
  notes?: string
  created_by?: number | string
  items: CreateAdjustmentItemInput[]
}

export type CreateAdjustmentItemInput = {
  product_id: number | string
  quantity: number
  type: AdjustmentType
}

export type UpdateAdjustmentInput = Partial<CreateAdjustmentInput>

// Expense types - FIXED to match your schema
export type Expense = Prisma.expensesGetPayload<{
  include: {
    expense_categories: { select: { name: true } }
  }
}>

export type CreateExpenseInput = {
  reference?: string
  category_id: number | string
  amount: number
  date?: string
  description?: string
  attachment?: string
  status?: ExpenseStatus
  created_by?: number | string
}

export type UpdateExpenseInput = Partial<CreateExpenseInput>

// Transfer types - FIXED to match your schema
export type Transfer = Prisma.transfersGetPayload<{
  include: {
    warehouses_transfers_from_warehouse_idTowarehouses: { select: { name: true } }
    warehouses_transfers_to_warehouse_idTowarehouses: { select: { name: true } }
    transfer_items: {
      include: {
        products: { select: { name: true, code: true } }
      }
    }
  }
}>

export type CreateTransferInput = {
  reference?: string
  from_warehouse_id: number | string
  to_warehouse_id: number | string
  date?: string
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  discount?: number
  shipping?: number
  total: number
  status?: TransferStatus
  notes?: string
  created_by?: number | string
  items: {
    product_id: number | string
    quantity: number
    unit_cost: number
    discount?: number
    tax?: number
    subtotal?: number
  }[]
}

export type UpdateTransferInput = Partial<CreateTransferInput>

// Pagination response type
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// API Response types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export type ApiError = {
  error: string
  message?: string
  statusCode?: number
}

// Search types
export interface SearchParams {
  page?: number | string
  limit?: number | string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface QuotationSearchParams extends SearchParams {
  customer_id?: number | string
  warehouse_id?: number | string
  status?: QuotationStatus
  date_from?: string
  date_to?: string
}

export interface InvoiceSearchParams extends SearchParams {
  customer_id?: number | string
  warehouse_id?: number | string
  sale_id?: number | string
  quotation_id?: number | string
  status?: InvoiceStatus
  payment_status?: PaymentStatus
  date_from?: string
  date_to?: string
  due_date_from?: string
  due_date_to?: string
}

export interface ProductSearchParams extends SearchParams {
  category_id?: number | string
  brand_id?: number | string
  warehouse_id?: number | string
  status?: Status
  low_stock?: boolean
}

export interface SaleSearchParams extends SearchParams {
  customer_id?: number | string
  warehouse_id?: number | string
  status?: SaleStatus
  payment_status?: PaymentStatus
  date_from?: string
  date_to?: string
}

export interface PurchaseSearchParams extends SearchParams {
  supplier_id?: number | string
  warehouse_id?: number | string
  status?: PurchaseStatus
  payment_status?: PaymentStatus
  date_from?: string
  date_to?: string
}

export interface CustomerSearchParams extends SearchParams {
  name?: string
  email?: string
  phone?: string
}

export interface SupplierSearchParams extends SearchParams {
  name?: string
  email?: string
  phone?: string
}

export interface AdjustmentSearchParams extends SearchParams {
  warehouse_id?: number | string
  type?: AdjustmentType
  date_from?: string
  date_to?: string
}

export interface ExpenseSearchParams extends SearchParams {
  category_id?: number | string
  status?: ExpenseStatus
  date_from?: string
  date_to?: string
}

// Purchase Return types - FIXED to match your schema
export interface CreatePurchaseReturnInput {
  reference?: string
  purchase_id: number | string
  supplier_id: number | string
  warehouse_id: number | string
  date?: string
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  discount?: number
  shipping?: number
  total: number
  status?: string
  notes?: string
  items: PurchaseReturnItemInput[]
}

export interface UpdatePurchaseReturnInput {
  purchase_id?: number | string
  supplier_id?: number | string
  warehouse_id?: number | string
  date?: string
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  discount?: number
  shipping?: number
  total?: number
  status?: string
  notes?: string
}

export interface PurchaseReturnItemInput {
  product_id: number | string
  purchase_item_id?: number | string
  quantity: number
  unit_cost: number
  discount?: number
  tax?: number
  subtotal?: number
}

export interface PurchaseReturnSearchParams {
  id?: string
  page?: string
  limit?: string
  search?: string
  purchase_id?: string
  supplier_id?: string
  warehouse_id?: string
  status?: string
  date_from?: string
  date_to?: string
  sortBy?: string
  sortOrder?: string
}

// Purchase Return Prisma types
export type PurchaseReturn = Prisma.purchase_returnsGetPayload<{
  include: {
    suppliers: { select: { name: true } }
    warehouses: { select: { name: true } }
    purchases: { select: { reference: true } }
    purchase_return_items: {
      include: {
        products: { select: { name: true, code: true } }
        purchase_items: true
      }
    }
  }
}>

export type PurchaseReturnItem = Prisma.purchase_return_itemsGetPayload<{
  include: {
    products: { select: { name: true, code: true } }
    purchase_items: true
  }
}>