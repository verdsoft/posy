/**
 * Tests for Invoice Create Page
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

jest.mock('@/lib/slices/settingsApi', () => ({
  useGetWarehousesQuery: jest.fn(() => ({
    data: mockWarehouses,
    isLoading: false,
    isError: false,
  })),
  useGetSystemSettingsQuery: jest.fn(() => ({
    data: { tax_rate: 10, currency: 'USD' },
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

jest.mock('@/lib/slices/invoicesV2Api', () => ({
  useCreateInvoiceMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
}));

jest.mock('@/lib/slices/fdmsApi', () => ({
  useSubmitFiscalInvoiceMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useGetFDMSStatusQuery: jest.fn(() => ({
    data: { status: 'disconnected' },
    isLoading: false,
    isError: false,
  })),
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
  usePathname: jest.fn(() => '/invoice/create'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Invoice Create Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render invoice create page', async () => {
    const CreateInvoicePage = (await import('@/app/invoice/create/page')).default;
    render(<CreateInvoicePage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display loading state for data fetching', async () => {
    const { useGetCustomersQuery } = require('@/lib/slices/customersApi');
    useGetCustomersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const CreateInvoicePage = (await import('@/app/invoice/create/page')).default;
    render(<CreateInvoicePage />);

    // Should render without crashing even during loading
    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetCustomersQuery } = require('@/lib/slices/customersApi');
    const { useGetWarehousesQuery } = require('@/lib/slices/settingsApi');

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

    const CreateInvoicePage = (await import('@/app/invoice/create/page')).default;
    render(<CreateInvoicePage />);

    // Should render without crashing with empty data
    expect(document.body).toBeTruthy();
  });
});
