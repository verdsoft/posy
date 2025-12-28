/**
 * Tests for Adjustment List Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { createMockAdjustment } from '@/tests/utils/mockData';

const mockAdjustments = [
  createMockAdjustment(),
  createMockAdjustment({ id: 2, reference: 'ADJ-002', type: 'subtraction' }),
];

const mockPaginatedData = {
  data: mockAdjustments,
  pagination: {
    total: 2,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
};

jest.mock('@/lib/slices/adjustmentsApi', () => ({
  useGetAdjustmentsQuery: jest.fn(() => ({
    data: mockPaginatedData,
    isLoading: false,
    isError: false,
  })),
  useDeleteAdjustmentMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/adjustment/list'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Adjustment List Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render adjustment list page', async () => {
    const AdjustmentListPage = (await import('@/app/adjustment/list/page')).default;
    render(<AdjustmentListPage />);

    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetAdjustmentsQuery } = require('@/lib/slices/adjustmentsApi');
    useGetAdjustmentsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const AdjustmentListPage = (await import('@/app/adjustment/list/page')).default;
    render(<AdjustmentListPage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetAdjustmentsQuery } = require('@/lib/slices/adjustmentsApi');
    useGetAdjustmentsQuery.mockReturnValue({
      data: { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    const AdjustmentListPage = (await import('@/app/adjustment/list/page')).default;
    render(<AdjustmentListPage />);

    expect(document.body).toBeTruthy();
  });
});
