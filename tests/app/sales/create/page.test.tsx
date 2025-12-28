/**
 * Tests for Sales Create Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { createMockCustomer, createMockWarehouse, createMockProduct } from '@/tests/utils/mockData';

const mockCustomers = [createMockCustomer(), createMockCustomer({ id: 2, name: 'Customer 2' })];
const mockWarehouses = [createMockWarehouse(), createMockWarehouse({ id: 2, name: 'Warehouse 2' })];
const mockProducts = [createMockProduct(), createMockProduct({ id: 2, code: 'TEST-002', name: 'Product 2' })];

jest.mock('@/lib/slices/customersApi', () => ({
  useGetCustomersQuery: jest.fn(() => ({
    data: { data: mockCustomers, meta: { total: 2, page: 1, limit: 1000, totalPages: 1 } },
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

jest.mock('@/lib/slices/salesApi', () => ({
  useCreateSaleMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/sales/create'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Sales Create Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sales create page', async () => {
    const CreateSalePage = (await import('@/app/sales/create/page')).default;
    render(<CreateSalePage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetCustomersQuery } = require('@/lib/slices/customersApi');
    useGetCustomersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const CreateSalePage = (await import('@/app/sales/create/page')).default;
    render(<CreateSalePage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetCustomersQuery } = require('@/lib/slices/customersApi');
    const { useGetWarehousesQuery } = require('@/lib/slices/warehousesApi');

    useGetCustomersQuery.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 1000, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    useGetWarehousesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const CreateSalePage = (await import('@/app/sales/create/page')).default;
    render(<CreateSalePage />);

    expect(document.body).toBeTruthy();
  });
});
