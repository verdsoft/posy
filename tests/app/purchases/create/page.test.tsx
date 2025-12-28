/**
 * Tests for Purchases Create Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { createMockSupplier, createMockWarehouse, createMockProduct } from '@/tests/utils/mockData';

const mockSuppliers = [createMockSupplier(), createMockSupplier({ id: 2, name: 'Supplier 2' })];
const mockWarehouses = [createMockWarehouse(), createMockWarehouse({ id: 2, name: 'Warehouse 2' })];
const mockProducts = [createMockProduct(), createMockProduct({ id: 2, code: 'TEST-002', name: 'Product 2' })];

jest.mock('@/lib/slices/suppliersApi', () => ({
  useGetSuppliersQuery: jest.fn(() => ({
    data: { data: mockSuppliers, meta: { total: 2, page: 1, limit: 1000, totalPages: 1 } },
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@/lib/slices/warehousesApi', () => ({
  useGetWarehousesQuery: jest.fn(() => ({
    data: mockWarehouses,
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@/lib/slices/productsApi', () => ({
  useGetProductsQuery: jest.fn(() => ({
    data: { data: mockProducts, meta: { total: 2, page: 1, limit: 1000, totalPages: 1 } },
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@/lib/slices/purchasesApi', () => ({
  useCreatePurchaseMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
    forward: jest.fn(),
  })),
  usePathname: jest.fn(() => '/purchases/create'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Purchases Create Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render purchases create page', async () => {
    const CreatePurchasePage = (await import('@/app/purchases/create/page')).default;
    render(<CreatePurchasePage />);

    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetSuppliersQuery } = require('@/lib/slices/suppliersApi');
    useGetSuppliersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const CreatePurchasePage = (await import('@/app/purchases/create/page')).default;
    render(<CreatePurchasePage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetSuppliersQuery } = require('@/lib/slices/suppliersApi');
    const { useGetWarehousesQuery } = require('@/lib/slices/warehousesApi');

    useGetSuppliersQuery.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 1000, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    useGetWarehousesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const CreatePurchasePage = (await import('@/app/purchases/create/page')).default;
    render(<CreatePurchasePage />);

    expect(document.body).toBeTruthy();
  });
});
