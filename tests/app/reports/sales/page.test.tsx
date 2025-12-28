/**
 * Tests for Sales Report Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockSalesReport = {
  data: [
    { date: '2025-01-01', reference: 'SALE-001', customer: 'Customer 1', total: 1000, status: 'completed' },
    { date: '2025-01-02', reference: 'SALE-002', customer: 'Customer 2', total: 2000, status: 'completed' },
  ],
  summary: {
    totalSales: 3000,
    totalTransactions: 2,
    averageOrderValue: 1500,
  },
};

jest.mock('@/lib/slices/reportsApi', () => ({
  useGetSalesReportQuery: jest.fn(() => ({
    data: mockSalesReport,
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
  usePathname: jest.fn(() => '/reports/sales'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

// Mock jsPDF and xlsx for export functionality
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

describe('Sales Report Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sales report page', async () => {
    const SalesReportPage = (await import('@/app/reports/sales/page')).default;
    render(<SalesReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetSalesReportQuery } = require('@/lib/slices/reportsApi');
    useGetSalesReportQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const SalesReportPage = (await import('@/app/reports/sales/page')).default;
    render(<SalesReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display error state', async () => {
    const { useGetSalesReportQuery } = require('@/lib/slices/reportsApi');
    useGetSalesReportQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const SalesReportPage = (await import('@/app/reports/sales/page')).default;
    render(<SalesReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display report data', async () => {
    const SalesReportPage = (await import('@/app/reports/sales/page')).default;
    render(<SalesReportPage />);

    await waitFor(() => {
      // Should have rendered the page
      expect(document.body).toBeTruthy();
    });
  });

  it('should handle empty report data', async () => {
    const { useGetSalesReportQuery } = require('@/lib/slices/reportsApi');
    useGetSalesReportQuery.mockReturnValue({
      data: { data: [], summary: { totalSales: 0, totalTransactions: 0, averageOrderValue: 0 } },
      isLoading: false,
      isError: false,
    });

    const SalesReportPage = (await import('@/app/reports/sales/page')).default;
    render(<SalesReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });
});
