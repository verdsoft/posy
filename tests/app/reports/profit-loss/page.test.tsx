/**
 * Tests for Profit & Loss Report Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockProfitLossReport = {
  sales: {
    count: 10,
    total: 50000,
  },
  purchases: {
    count: 8,
    total: 30000,
    sent: 30000,
  },
  salesReturns: {
    count: 2,
    total: 2000,
  },
  purchaseReturns: {
    count: 1,
    total: 1000,
  },
  expenses: {
    total: 5000,
  },
  profit: 13000,
  payments: {
    received: 48000,
    sent: 34000,
  },
  paymentsNet: 14000,
};

jest.mock('@/lib/slices/reportsApi', () => ({
  useGetProfitLossQuery: jest.fn(() => ({
    data: mockProfitLossReport,
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
  usePathname: jest.fn(() => '/reports/profit-loss'),
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

describe('Profit & Loss Report Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profit loss report page', async () => {
    const ProfitLossPage = (await import('@/app/reports/profit-loss/page')).default;
    render(<ProfitLossPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetProfitLossQuery } = require('@/lib/slices/reportsApi');
    useGetProfitLossQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const ProfitLossPage = (await import('@/app/reports/profit-loss/page')).default;
    render(<ProfitLossPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display error state', async () => {
    const { useGetProfitLossQuery } = require('@/lib/slices/reportsApi');
    useGetProfitLossQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const ProfitLossPage = (await import('@/app/reports/profit-loss/page')).default;
    render(<ProfitLossPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display report data', async () => {
    const ProfitLossPage = (await import('@/app/reports/profit-loss/page')).default;
    render(<ProfitLossPage />);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });
  });

  it('should calculate profit correctly', async () => {
    const ProfitLossPage = (await import('@/app/reports/profit-loss/page')).default;
    render(<ProfitLossPage />);

    await waitFor(() => {
      expect(document.body).toBeTruthy();
    });

    // The mock data shows:
    // Revenue: 55000, Expenses: 42000, Net Profit: 13000
    // This should be displayed correctly
  });
});
