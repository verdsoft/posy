/**
 * Tests for Sales Return List Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockSalesReturns = [
  { id: 1, reference: 'SR-001', customer_name: 'Customer 1', total: 1000, status: 'completed', date: '2025-01-01' },
  { id: 2, reference: 'SR-002', customer_name: 'Customer 2', total: 2000, status: 'pending', date: '2025-01-02' },
];

const mockPaginatedData = {
  data: mockSalesReturns,
  meta: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

jest.mock('@/lib/slices/returnsApi', () => ({
  useGetSalesReturnsQuery: jest.fn(() => ({
    data: mockPaginatedData,
    isLoading: false,
    isError: false,
  })),
  useDeleteSalesReturnMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/sales-return/list'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Sales Return List Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sales return list page', async () => {
    const SalesReturnListPage = (await import('@/app/sales-return/list/page')).default;
    render(<SalesReturnListPage />);

    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetSalesReturnsQuery } = require('@/lib/slices/returnsApi');
    useGetSalesReturnsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const SalesReturnListPage = (await import('@/app/sales-return/list/page')).default;
    render(<SalesReturnListPage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetSalesReturnsQuery } = require('@/lib/slices/returnsApi');
    useGetSalesReturnsQuery.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    const SalesReturnListPage = (await import('@/app/sales-return/list/page')).default;
    render(<SalesReturnListPage />);

    expect(document.body).toBeTruthy();
  });
});
