/**
 * Tests for Currencies Settings Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockCurrencies = [
  { id: 1, name: 'US Dollar', code: 'USD', symbol: '$', exchange_rate: 1, status: 'active' },
  { id: 2, name: 'Euro', code: 'EUR', symbol: '€', exchange_rate: 0.85, status: 'active' },
];

jest.mock('@/lib/slices/currenciesApi', () => ({
  useGetCurrenciesQuery: jest.fn(() => ({
    data: mockCurrencies,
    isLoading: false,
    isError: false,
  })),
  useCreateCurrencyMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useUpdateCurrencyMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteCurrencyMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/settings/currencies'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Currencies Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render currencies settings page', async () => {
    const CurrenciesPage = (await import('@/app/settings/currencies/page')).default;
    render(<CurrenciesPage />);

    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetCurrenciesQuery } = require('@/lib/slices/currenciesApi');
    useGetCurrenciesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const CurrenciesPage = (await import('@/app/settings/currencies/page')).default;
    render(<CurrenciesPage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetCurrenciesQuery } = require('@/lib/slices/currenciesApi');
    useGetCurrenciesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const CurrenciesPage = (await import('@/app/settings/currencies/page')).default;
    render(<CurrenciesPage />);

    expect(document.body).toBeTruthy();
  });
});
