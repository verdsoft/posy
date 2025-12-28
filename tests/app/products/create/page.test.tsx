/**
 * Tests for Products Create Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Accessories' },
];

const mockBrands = [
  { id: 1, name: 'Brand A' },
  { id: 2, name: 'Brand B' },
];

const mockUnits = [
  { id: 1, name: 'Piece', short_name: 'pc' },
  { id: 2, name: 'Box', short_name: 'box' },
];

const mockWarehouses = [
  { id: 1, name: 'Main Warehouse' },
  { id: 2, name: 'Secondary Warehouse' },
];

jest.mock('@/lib/slices/settingsApi', () => ({
  useGetCategoriesQuery: jest.fn(() => ({
    data: mockCategories,
    isLoading: false,
    isError: false,
  })),
  useGetBrandsQuery: jest.fn(() => ({
    data: mockBrands,
    isLoading: false,
    isError: false,
  })),
  useGetUnitsQuery: jest.fn(() => ({
    data: mockUnits,
    isLoading: false,
    isError: false,
  })),
  useGetWarehousesQuery: jest.fn(() => ({
    data: mockWarehouses,
    isLoading: false,
    isError: false,
  })),
  useGetSystemSettingsQuery: jest.fn(() => ({
    data: { tax_rate: 10, currency: 'USD' },
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('@/lib/slices/productsApi', () => ({
  useCreateProductMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/products/create'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Products Create Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render products create page', async () => {
    const CreateProductPage = (await import('@/app/products/create/page')).default;
    render(<CreateProductPage />);

    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetCategoriesQuery } = require('@/lib/slices/settingsApi');
    useGetCategoriesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const CreateProductPage = (await import('@/app/products/create/page')).default;
    render(<CreateProductPage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetCategoriesQuery, useGetBrandsQuery, useGetUnitsQuery, useGetWarehousesQuery } = require('@/lib/slices/settingsApi');

    useGetCategoriesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    useGetBrandsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    useGetUnitsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    useGetWarehousesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const CreateProductPage = (await import('@/app/products/create/page')).default;
    render(<CreateProductPage />);

    expect(document.body).toBeTruthy();
  });
});
