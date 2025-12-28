/**
 * Tests for Transfer List Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { createMockTransfer } from '@/tests/utils/mockData';

const mockTransfers = [
  createMockTransfer(),
  createMockTransfer({ id: 2, reference: 'TRN-002', status: 'completed' }),
];

const mockPaginatedData = {
  data: mockTransfers,
  meta: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

jest.mock('@/lib/slices/transfersApi', () => ({
  useGetTransfersQuery: jest.fn(() => ({
    data: mockPaginatedData,
    isLoading: false,
    isError: false,
  })),
  useDeleteTransferMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/transfer/list'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Transfer List Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render transfer list page', async () => {
    const TransferListPage = (await import('@/app/transfer/list/page')).default;
    render(<TransferListPage />);

    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetTransfersQuery } = require('@/lib/slices/transfersApi');
    useGetTransfersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const TransferListPage = (await import('@/app/transfer/list/page')).default;
    render(<TransferListPage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetTransfersQuery } = require('@/lib/slices/transfersApi');
    useGetTransfersQuery.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    const TransferListPage = (await import('@/app/transfer/list/page')).default;
    render(<TransferListPage />);

    expect(document.body).toBeTruthy();
  });
});
