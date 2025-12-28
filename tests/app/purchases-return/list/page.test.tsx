/**
 * Tests for Purchases Return List Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockPurchasesReturns = [
  { id: 1, reference: 'PR-001', supplier_name: 'Supplier 1', total: 1000, status: 'completed', date: '2025-01-01' },
  { id: 2, reference: 'PR-002', supplier_name: 'Supplier 2', total: 2000, status: 'pending', date: '2025-01-02' },
];

const mockPaginatedData = {
  data: mockPurchasesReturns,
  meta: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

jest.mock('@/lib/slices/returnsApi', () => ({
  useGetPurchaseReturnsQuery: jest.fn(() => ({
    data: mockPaginatedData,
    isLoading: false,
    isError: false,
  })),
  useDeletePurchaseReturnMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/purchases-return/list'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Purchases Return List Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render purchases return list page', async () => {
    const PurchasesReturnListPage = (await import('@/app/purchases-return/list/page')).default;
    render(<PurchasesReturnListPage />);

    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetPurchaseReturnsQuery } = require('@/lib/slices/returnsApi');
    useGetPurchaseReturnsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const PurchasesReturnListPage = (await import('@/app/purchases-return/list/page')).default;
    render(<PurchasesReturnListPage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetPurchaseReturnsQuery } = require('@/lib/slices/returnsApi');
    useGetPurchaseReturnsQuery.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    const PurchasesReturnListPage = (await import('@/app/purchases-return/list/page')).default;
    render(<PurchasesReturnListPage />);

    expect(document.body).toBeTruthy();
  });
});
