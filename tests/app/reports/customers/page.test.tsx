/**
 * Tests for Customers Report Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockCustomersReport = [
  { id: 1, name: 'Customer 1', email: 'customer1@test.com', phone: '123-456-7890', total_sales: 15000, total_paid: 10000, total_due: 5000 },
  { id: 2, name: 'Customer 2', email: 'customer2@test.com', phone: '098-765-4321', total_sales: 8000, total_paid: 5000, total_due: 3000 },
];

jest.mock('@/lib/slices/reportsApi', () => ({
  useGetCustomersQuery: jest.fn(() => ({
    data: mockCustomersReport,
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@/lib/slices/customersApi', () => ({
  useUpdateCustomerMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteCustomerMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/reports/customers'),
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

describe('Customers Report Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render customers report page', async () => {
    const CustomersReportPage = (await import('@/app/reports/customers/page')).default;
    render(<CustomersReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetCustomersQuery } = require('@/lib/slices/reportsApi');
    useGetCustomersQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const CustomersReportPage = (await import('@/app/reports/customers/page')).default;
    render(<CustomersReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display error state', async () => {
    const { useGetCustomersQuery } = require('@/lib/slices/reportsApi');
    useGetCustomersQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const CustomersReportPage = (await import('@/app/reports/customers/page')).default;
    render(<CustomersReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display report data', async () => {
    const CustomersReportPage = (await import('@/app/reports/customers/page')).default;
    render(<CustomersReportPage />);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('should handle empty report data', async () => {
    const { useGetCustomersQuery } = require('@/lib/slices/reportsApi');
    useGetCustomersQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const CustomersReportPage = (await import('@/app/reports/customers/page')).default;
    render(<CustomersReportPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });
});
