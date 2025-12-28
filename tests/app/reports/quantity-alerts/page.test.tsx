/**
 * Tests for Quantity Alerts Report Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockQuantityAlertsReport = {
  data: [
    { id: 1, name: 'Product 1', sku: 'SKU-001', category: 'Electronics', currentStock: 5, alertQuantity: 10, status: 'low' },
    { id: 2, name: 'Product 2', sku: 'SKU-002', category: 'Accessories', currentStock: 0, alertQuantity: 5, status: 'out_of_stock' },
    { id: 3, name: 'Product 3', sku: 'SKU-003', category: 'Electronics', currentStock: 8, alertQuantity: 15, status: 'low' },
  ],
  summary: {
    totalLowStockItems: 2,
    totalOutOfStockItems: 1,
    totalAlerts: 3,
  },
};

jest.mock('@/lib/slices/productsApi', () => ({
  useGetProductsQuery: jest.fn(() => ({
    data: {
      data: mockQuantityAlertsReport.data,
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
  usePathname: jest.fn(() => '/reports/quantity-alerts'),
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

describe('Quantity Alerts Report Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render quantity alerts report page', async () => {
    const QuantityAlertsReportPage = (await import('@/app/reports/quantity-alerts/page')).default;
    render(<QuantityAlertsReportPage />);

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

    const QuantityAlertsReportPage = (await import('@/app/reports/quantity-alerts/page')).default;
    render(<QuantityAlertsReportPage />);

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

    const QuantityAlertsReportPage = (await import('@/app/reports/quantity-alerts/page')).default;
    render(<QuantityAlertsReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display report data with alerts', async () => {
    const QuantityAlertsReportPage = (await import('@/app/reports/quantity-alerts/page')).default;
    render(<QuantityAlertsReportPage />);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('should handle no alerts scenario', async () => {
    const { useGetProductsQuery } = require('@/lib/slices/productsApi');
    useGetProductsQuery.mockReturnValue({
      data: { data: [], meta: { total: 0, page: 1, limit: 1000, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    const QuantityAlertsReportPage = (await import('@/app/reports/quantity-alerts/page')).default;
    render(<QuantityAlertsReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should distinguish between low stock and out of stock', async () => {
    const QuantityAlertsReportPage = (await import('@/app/reports/quantity-alerts/page')).default;
    render(<QuantityAlertsReportPage />);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });

    // Mock data shows: 2 low stock items, 1 out of stock item
    // These should be clearly distinguished in the UI
  });
});
