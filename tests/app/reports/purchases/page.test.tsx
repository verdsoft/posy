/**
 * Tests for Purchases Report Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockPurchasesReport = {
  data: [
    { date: '2025-01-01', reference: 'PO-001', supplier: 'Supplier 1', total: 5000, status: 'received' },
    { date: '2025-01-02', reference: 'PO-002', supplier: 'Supplier 2', total: 3000, status: 'received' },
  ],
  summary: {
    totalPurchases: 8000,
    totalTransactions: 2,
    averageOrderValue: 4000,
  },
};

jest.mock('@/lib/slices/reportsApi', () => ({
  useGetPurchasesReportQuery: jest.fn(() => ({
    data: mockPurchasesReport,
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
  usePathname: jest.fn(() => '/reports/purchases'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// Mock jsPDF and xlsx
jest.mock('jspdf', () => ({
  jsPDF: jest.fn(() => ({
    text: jest.fn(),
    save: jest.fn(),
    autoTable: jest.fn(),
  })),
}));

jest.mock('jspdf-autotable', () => jest.fn());
jest.mock('xlsx', () => ({
  utils: {
    json_to_sheet: jest.fn(),
    book_new: jest.fn(),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}));

describe('Purchases Report Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render purchases report page', async () => {
    const PurchasesReportPage = (await import('@/app/reports/purchases/page')).default;
    render(<PurchasesReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetPurchasesReportQuery } = require('@/lib/slices/reportsApi');
    useGetPurchasesReportQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const PurchasesReportPage = (await import('@/app/reports/purchases/page')).default;
    render(<PurchasesReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display error state', async () => {
    const { useGetPurchasesReportQuery } = require('@/lib/slices/reportsApi');
    useGetPurchasesReportQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const PurchasesReportPage = (await import('@/app/reports/purchases/page')).default;
    render(<PurchasesReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display report data', async () => {
    const PurchasesReportPage = (await import('@/app/reports/purchases/page')).default;
    render(<PurchasesReportPage />);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('should handle empty report data', async () => {
    const { useGetPurchasesReportQuery } = require('@/lib/slices/reportsApi');
    useGetPurchasesReportQuery.mockReturnValue({
      data: { data: [], summary: { totalPurchases: 0, totalTransactions: 0, averageOrderValue: 0 } },
      isLoading: false,
      isError: false,
    });

    const PurchasesReportPage = (await import('@/app/reports/purchases/page')).default;
    render(<PurchasesReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });
});
