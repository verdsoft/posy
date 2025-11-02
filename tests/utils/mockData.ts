/**
 * Mock data factories for testing
 */

import type { Invoice, InvoiceItem } from '@/lib/slices/invoicesV2Api';

/**
 * Create mock invoice data
 */
export function createMockInvoice(overrides?: Partial<Invoice>): Invoice {
  return {
    id: 1,
    reference: 'INV-001',
    customer_id: 1,
    warehouse_id: 1,
    sale_id: null,
    quotation_id: null,
    date: '2025-01-01',
    due_date: '2025-01-31',
    subtotal: 100,
    tax_rate: 10,
    tax_amount: 10,
    discount: 0,
    shipping: 5,
    total: 115,
    paid: 0,
    due: 115,
    status: 'draft',
    payment_status: 'unpaid',
    notes: 'Test invoice',
    created_by: 1,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    customers: { id: 1, name: 'Test Customer', email: 'customer@test.com' },
    warehouses: { id: 1, name: 'Main Warehouse' },
    ...overrides,
  };
}

/**
 * Create mock invoice item data
 */
export function createMockInvoiceItem(overrides?: Partial<InvoiceItem>): InvoiceItem {
  return {
    id: 1,
    invoice_id: 1,
    product_id: 1,
    quantity: 10,
    unit_price: 10,
    discount: 0,
    tax: 1,
    subtotal: 100,
    created_at: '2025-01-01T00:00:00.000Z',
    products: { id: 1, name: 'Test Product', code: 'TEST-001' },
    name: 'Test Product',
    code: 'TEST-001',
    ...overrides,
  };
}

/**
 * Create mock customer data
 */
export function createMockCustomer(overrides?: any) {
  return {
    id: 1,
    name: 'Test Customer',
    email: 'customer@test.com',
    phone: '123-456-7890',
    address: '123 Test St',
    city: 'Test City',
    country: 'Test Country',
    tax_number: 'TAX123',
    credit_limit: 1000,
    total_sales: 500,
    total_paid: 300,
    total_due: 200,
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create mock product data
 */
export function createMockProduct(overrides?: any) {
  return {
    id: 1,
    name: 'Test Product',
    code: 'TEST-001',
    barcode: '1234567890',
    category_id: 1,
    brand_id: 1,
    unit_id: 1,
    warehouse_id: 1,
    cost: 50,
    price: 100,
    stock: 100,
    alert_quantity: 10,
    description: 'Test product description',
    image: '/images/test.jpg',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create mock warehouse data
 */
export function createMockWarehouse(overrides?: any) {
  return {
    id: 1,
    name: 'Main Warehouse',
    phone: '123-456-7890',
    email: 'warehouse@test.com',
    address: '123 Warehouse St',
    city: 'Test City',
    country: 'Test Country',
    zip_code: '12345',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create mock user data
 */
export function createMockUser(overrides?: any) {
  return {
    id: 1,
    name: 'Test User',
    email: 'user@test.com',
    role: 'admin',
    avatar: '/avatars/test.jpg',
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create mock sale data
 */
export function createMockSale(overrides?: any) {
  return {
    id: 1,
    reference: 'SALE-001',
    customer_id: 1,
    warehouse_id: 1,
    date: '2025-01-01',
    tax_rate: 10,
    tax_amount: 10,
    discount: 0,
    shipping: 5,
    total: 115,
    paid: 0,
    due: 115,
    status: 'completed',
    payment_status: 'unpaid',
    notes: 'Test sale',
    customer_name: 'Test Customer',
    warehouse_name: 'Main Warehouse',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create mock purchase data
 */
export function createMockPurchase(overrides?: any) {
  return {
    id: 1,
    reference: 'PO-001',
    supplier_id: 1,
    warehouse_id: 1,
    date: '2025-01-01',
    tax_rate: 10,
    tax_amount: 10,
    discount: 0,
    shipping: 5,
    total: 115,
    paid: 0,
    due: 115,
    status: 'received',
    payment_status: 'unpaid',
    notes: 'Test purchase',
    supplier_name: 'Test Supplier',
    warehouse_name: 'Main Warehouse',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create mock quotation data
 */
export function createMockQuotation(overrides?: any) {
  return {
    id: 1,
    reference: 'QUO-001',
    customer_id: 1,
    warehouse_id: 1,
    date: '2025-01-01',
    valid_until: '2025-01-31',
    tax_rate: 10,
    tax_amount: 10,
    discount: 0,
    shipping: 5,
    total: 115,
    status: 'pending',
    notes: 'Test quotation',
    customer_name: 'Test Customer',
    warehouse_name: 'Main Warehouse',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create mock supplier data
 */
export function createMockSupplier(overrides?: any) {
  return {
    id: 1,
    name: 'Test Supplier',
    email: 'supplier@test.com',
    phone: '123-456-7890',
    address: '123 Supplier St',
    city: 'Test City',
    country: 'Test Country',
    tax_number: 'TAX123',
    total_purchases: 5000,
    total_paid: 3000,
    total_due: 2000,
    status: 'active',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create mock adjustment data
 */
export function createMockAdjustment(overrides?: any) {
  return {
    id: 1,
    reference: 'ADJ-001',
    warehouse_id: 1,
    date: '2025-01-01',
    type: 'addition',
    reason: 'Stock count adjustment',
    notes: 'Test adjustment',
    warehouse_name: 'Main Warehouse',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create mock transfer data
 */
export function createMockTransfer(overrides?: any) {
  return {
    id: 1,
    reference: 'TRN-001',
    from_warehouse_id: 1,
    to_warehouse_id: 2,
    date: '2025-01-01',
    status: 'pending',
    notes: 'Test transfer',
    from_warehouse_name: 'Main Warehouse',
    to_warehouse_name: 'Secondary Warehouse',
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/**
 * Create paginated response mock
 */
export function createMockPaginatedResponse<T>(
  data: T[],
  total?: number,
  page = 1,
  limit = 10
) {
  return {
    data,
    pagination: {
      total: total || data.length,
      page,
      limit,
      totalPages: Math.ceil((total || data.length) / limit),
    },
  };
}
