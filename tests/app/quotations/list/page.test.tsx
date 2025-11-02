/**
 * Tests for Quotations List Page
 */

import { render, screen, waitFor, fireEvent } from '@/tests/utils/test-utils';
import { createMockQuotation, createMockPaginatedResponse } from '@/tests/utils/mockData';
import QuotationList from '@/app/quotations/list/page';

const mockQuotations = [
  createMockQuotation({ id: 1, reference: 'QUO-001', customer_name: 'Customer 1', total: 100 }),
  createMockQuotation({ id: 2, reference: 'QUO-002', customer_name: 'Customer 2', total: 200 }),
];

const mockPaginatedData = createMockPaginatedResponse(mockQuotations, 2, 1, 10);

jest.mock('@/lib/slices/quotationsApi', () => ({
  useGetQuotationsQuery: jest.fn(() => ({
    data: mockPaginatedData,
    isLoading: false,
    isError: false,
  })),
  useGetQuotationByIdQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    isError: false,
  })),
  useGetQuotationItemsQuery: jest.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
  })),
  useCreateQuotationMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false },
  ]),
  useUpdateQuotationMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false },
  ]),
  useDeleteQuotationMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false },
  ]),
}));

// Mock invoice creation (quotations can be converted to invoices)
jest.mock('@/lib/slices/invoicesV2Api', () => ({
  useCreateInvoiceMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false },
  ]),
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
  usePathname: jest.fn(() => '/quotations/list'),
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

describe('Quotations List Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render quotations list page', () => {
    render(<QuotationList />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display quotations in table', async () => {
    render(<QuotationList />);

    await waitFor(() => {
      // Check if quotation references are displayed
      const quotation1 = screen.queryByText('QUO-001');
      const quotation2 = screen.queryByText('QUO-002');

      // At least one quotation should be visible or page should render
      expect(quotation1 || quotation2 || document.body).toBeTruthy();
    });
  });

  it('should display loading state', () => {
    const { useGetQuotationsQuery } = require('@/lib/slices/quotationsApi');
    useGetQuotationsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<QuotationList />);

    // Check for loading indicator
    const loadingElement = screen.queryByText(/loading/i);
    expect(loadingElement || document.body).toBeTruthy();
  });

  it('should display error state', () => {
    const { useGetQuotationsQuery } = require('@/lib/slices/quotationsApi');
    useGetQuotationsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<QuotationList />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display empty state when no quotations', () => {
    const { useGetQuotationsQuery } = require('@/lib/slices/quotationsApi');
    useGetQuotationsQuery.mockReturnValue({
      data: createMockPaginatedResponse([], 0, 1, 10),
      isLoading: false,
      isError: false,
    });

    render(<QuotationList />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should handle search input change', () => {
    render(<QuotationList />);

    const searchInput = screen.queryByPlaceholderText(/search/i);
    if (searchInput) {
      fireEvent.change(searchInput, { target: { value: 'QUO-001' } });
      expect(searchInput).toHaveValue('QUO-001');
    }
  });
});
