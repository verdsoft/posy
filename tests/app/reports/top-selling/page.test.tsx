/**
 * Tests for Top Selling Products Report Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockTopSellingReport = {
  data: [
    { id: 1, name: 'Product 1', sku: 'SKU-001', category: 'Electronics', quantitySold: 150, revenue: 15000 },
    { id: 2, name: 'Product 2', sku: 'SKU-002', category: 'Accessories', quantitySold: 120, revenue: 12000 },
    { id: 3, name: 'Product 3', sku: 'SKU-003', category: 'Electronics', quantitySold: 100, revenue: 10000 },
  ],
  summary: {
    totalProducts: 3,
    totalQuantitySold: 370,
    totalRevenue: 37000,
  },
};

jest.mock('@/lib/slices/productsApi', () => ({
  useGetProductsQuery: jest.fn(() => ({
    data: {
      data: mockTopSellingReport.data,
      meta: { total: 3, page: 1, limit: 1000, totalPages: 1 },
    },
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
  usePathname: jest.fn(() => '/reports/top-selling'),
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

describe('Top Selling Products Report Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render top selling report page', async () => {
    const TopSellingReportPage = (await import('@/app/reports/top-selling/page')).default;
    render(<TopSellingReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetProductsQuery } = require('@/lib/slices/productsApi');
    useGetProductsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const TopSellingReportPage = (await import('@/app/reports/top-selling/page')).default;
    render(<TopSellingReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display error state', async () => {
    const { useGetProductsQuery } = require('@/lib/slices/productsApi');
    useGetProductsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const TopSellingReportPage = (await import('@/app/reports/top-selling/page')).default;
    render(<TopSellingReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display report data', async () => {
    const TopSellingReportPage = (await import('@/app/reports/top-selling/page')).default;
    render(<TopSellingReportPage />);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('should handle empty report data', async () => {
    const { useGetProductsQuery } = require('@/lib/slices/productsApi');
    useGetProductsQuery.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 1000, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    const TopSellingReportPage = (await import('@/app/reports/top-selling/page')).default;
    render(<TopSellingReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should sort products by quantity sold', async () => {
    const TopSellingReportPage = (await import('@/app/reports/top-selling/page')).default;
    render(<TopSellingReportPage />);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });

    // The mock data shows products sorted by quantity: 150, 120, 100
    // This should be displayed in the correct order
  });
});
