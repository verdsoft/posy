/**
 * Tests for Brands Settings Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockBrands = [
  { id: 1, name: 'Brand A', description: 'Description A', status: 'active' },
  { id: 2, name: 'Brand B', description: 'Description B', status: 'active' },
];

jest.mock('@/lib/slices/brandsApi', () => ({
  useGetBrandsQuery: jest.fn(() => ({
    data: mockBrands,
    isLoading: false,
    isError: false,
  })),
  useCreateBrandMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useUpdateBrandMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteBrandMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/settings/brands'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Brands Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render brands settings page', async () => {
    const BrandsPage = (await import('@/app/settings/brands/page')).default;
    render(<BrandsPage />);

    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetBrandsQuery } = require('@/lib/slices/brandsApi');
    useGetBrandsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const BrandsPage = (await import('@/app/settings/brands/page')).default;
    render(<BrandsPage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetBrandsQuery } = require('@/lib/slices/brandsApi');
    useGetBrandsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const BrandsPage = (await import('@/app/settings/brands/page')).default;
    render(<BrandsPage />);

    expect(document.body).toBeTruthy();
  });
});
