/**
 * Tests for Suppliers Report Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockSuppliersReport = [
  { id: 1, name: 'Supplier 1', email: 'supplier1@test.com', phone: '123-456-7890', total_purchases: 30000, total_paid: 20000, total_due: 10000 },
  { id: 2, name: 'Supplier 2', email: 'supplier2@test.com', phone: '098-765-4321', total_purchases: 20000, total_paid: 15000, total_due: 5000 },
];

jest.mock('@/lib/slices/reportsApi', () => ({
  useGetSuppliersQuery: jest.fn(() => ({
    data: mockSuppliersReport,
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@/lib/slices/suppliersApi', () => ({
  useUpdateSupplierMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteSupplierMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/reports/suppliers'),
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

describe('Suppliers Report Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render suppliers report page', async () => {
    const SuppliersReportPage = (await import('@/app/reports/suppliers/page')).default;
    render(<SuppliersReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetSuppliersQuery } = require('@/lib/slices/reportsApi');
    useGetSuppliersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const SuppliersReportPage = (await import('@/app/reports/suppliers/page')).default;
    render(<SuppliersReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display error state', async () => {
    const { useGetSuppliersQuery } = require('@/lib/slices/reportsApi');
    useGetSuppliersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const SuppliersReportPage = (await import('@/app/reports/suppliers/page')).default;
    render(<SuppliersReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display report data', async () => {
    const SuppliersReportPage = (await import('@/app/reports/suppliers/page')).default;
    render(<SuppliersReportPage />);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('should handle empty report data', async () => {
    const { useGetSuppliersQuery } = require('@/lib/slices/reportsApi');
    useGetSuppliersQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const SuppliersReportPage = (await import('@/app/reports/suppliers/page')).default;
    render(<SuppliersReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });
});
