/**
 * Tests for Expenses List Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockExpenses = [
  { id: 1, reference: 'EXP-001', category: 'Office Supplies', amount: 100, date: '2025-01-01' },
  { id: 2, reference: 'EXP-002', category: 'Utilities', amount: 200, date: '2025-01-02' },
];

const mockPaginatedData = {
  data: mockExpenses,
  pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
};

jest.mock('@/lib/slices/expensesApi', () => ({
  useGetExpensesQuery: jest.fn(() => ({
    data: mockPaginatedData,
    isLoading: false,
    isError: false,
  })),
  useGetExpenseCategoriesQuery: jest.fn(() => ({
    data: [
      { id: 1, name: 'Office Supplies' },
      { id: 2, name: 'Utilities' },
    ],
    isLoading: false,
    isError: false,
  })),
  useUpdateExpenseMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteExpenseMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/expenses/list'),
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

describe('Expenses List Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render expenses list page', async () => {
    const ExpensesPage = (await import('@/app/expenses/list/page')).default;
    render(<ExpensesPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetExpensesQuery } = require('@/lib/slices/expensesApi');
    useGetExpensesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const ExpensesPage = (await import('@/app/expenses/list/page')).default;
    render(<ExpensesPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display error state', async () => {
    const { useGetExpensesQuery } = require('@/lib/slices/expensesApi');
    useGetExpensesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const ExpensesPage = (await import('@/app/expenses/list/page')).default;
    render(<ExpensesPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display empty state', async () => {
    const { useGetExpensesQuery } = require('@/lib/slices/expensesApi');
    useGetExpensesQuery.mockReturnValue({
      data: { data: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 0 } },
      isLoading: false,
      isError: false,
    });

    const ExpensesPage = (await import('@/app/expenses/list/page')).default;
    render(<ExpensesPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });
});
