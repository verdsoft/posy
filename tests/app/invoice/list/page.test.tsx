/**
 * Tests for Invoice List Page
 */

import { render, screen, waitFor, fireEvent } from '@/tests/utils/test-utils';
import { createMockInvoice, createMockPaginatedResponse } from '@/tests/utils/mockData';
import InvoiceList from '@/app/invoice/list/page';

// Mock the invoicesV2Api hooks
const mockInvoices = [
  createMockInvoice({ id: 1, reference: 'INV-001', customer_name: 'Customer 1', total: 100 }),
  createMockInvoice({ id: 2, reference: 'INV-002', customer_name: 'Customer 2', total: 200 }),
];

const mockPaginatedData = createMockPaginatedResponse(mockInvoices, 2, 1, 10);

jest.mock('@/lib/slices/invoicesV2Api', () => ({
  useGetInvoicesQuery: jest.fn(() => ({
    data: mockPaginatedData,
    isLoading: false,
    isError: false,
  })),
  useDeleteInvoiceMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false },
  ]),
  useGetInvoiceByIdQuery: jest.fn(() => ({
    data: null,
  })),
  useGetInvoiceItemsQuery: jest.fn(() => ({
    data: [],
  })),
}));

jest.mock('@/lib/slices/organizationApi', () => ({
  useGetOrganizationQuery: jest.fn(() => ({
    data: {
      name: 'Test Organization',
      email: 'org@test.com',
    },
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/invoice/list'),
}));

describe('Invoice List Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render invoice list page', () => {
    render(<InvoiceList />);

    expect(screen.getByText('Invoices')).toBeInTheDocument();
  });

  it('should display search input', () => {
    render(<InvoiceList />);

    const searchInput = screen.getByPlaceholderText('Search invoices...');
    expect(searchInput).toBeInTheDocument();
  });

  it('should display invoice data in table', async () => {
    render(<InvoiceList />);

    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('INV-002')).toBeInTheDocument();
    });
  });

  it('should display customer names', async () => {
    render(<InvoiceList />);

    await waitFor(() => {
      expect(screen.getByText('Customer 1')).toBeInTheDocument();
      expect(screen.getByText('Customer 2')).toBeInTheDocument();
    });
  });

  it('should display invoice totals', async () => {
    render(<InvoiceList />);

    await waitFor(() => {
      expect(screen.getByText('$100.00')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });
  });

  it('should have create invoice button', () => {
    render(<InvoiceList />);

    const createButton = screen.getByText('Create Invoice');
    expect(createButton).toBeInTheDocument();
  });

  it('should have export buttons', () => {
    render(<InvoiceList />);

    const pdfButton = screen.getByRole('button', { name: /PDF/i });
    const excelButton = screen.getByRole('button', { name: /Excel/i });

    expect(pdfButton).toBeInTheDocument();
    expect(excelButton).toBeInTheDocument();
  });

  it('should display table headers', () => {
    render(<InvoiceList />);

    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('should allow searching invoices', () => {
    render(<InvoiceList />);

    const searchInput = screen.getByPlaceholderText('Search invoices...') as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'INV-001' } });

    expect(searchInput.value).toBe('INV-001');
  });

  it('should display loading state', () => {
    const { useGetInvoicesQuery } = require('@/lib/slices/invoicesV2Api');
    useGetInvoicesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<InvoiceList />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const { useGetInvoicesQuery } = require('@/lib/slices/invoicesV2Api');
    useGetInvoicesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<InvoiceList />);

    expect(screen.getByText('Failed to load invoices')).toBeInTheDocument();
  });

  it('should display empty state when no invoices', () => {
    const { useGetInvoicesQuery } = require('@/lib/slices/invoicesV2Api');
    useGetInvoicesQuery.mockReturnValue({
      data: createMockPaginatedResponse([], 0, 1, 10),
      isLoading: false,
      isError: false,
    });

    render(<InvoiceList />);

    expect(screen.getByText('No invoices found')).toBeInTheDocument();
  });
});
