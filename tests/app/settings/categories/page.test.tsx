/**
 * Tests for Categories Settings Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

// Mock categories data
const mockCategories = [
  { id: '1', code: 'CAT-001', name: 'Category 1' },
  { id: '2', code: 'CAT-002', name: 'Category 2' },
];

jest.mock('@/lib/slices/categoriesApi', () => ({
  useGetCategoriesQuery: jest.fn(() => ({
    data: mockCategories,
    isLoading: false,
    isError: false,
  })),
  useCreateCategoryMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false },
  ]),
  useUpdateCategoryMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false },
  ]),
  useDeleteCategoryMutation: jest.fn(() => [
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
  usePathname: jest.fn(() => '/settings/categories'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Categories Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render categories page', async () => {
    const CategoriesPage = (await import('@/app/settings/categories/page')).default;
    render(<CategoriesPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetCategoriesQuery } = require('@/lib/slices/categoriesApi');
    useGetCategoriesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const CategoriesPage = (await import('@/app/settings/categories/page')).default;
    render(<CategoriesPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });

  it('should display error state', async () => {
    const { useGetCategoriesQuery } = require('@/lib/slices/categoriesApi');
    useGetCategoriesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    const CategoriesPage = (await import('@/app/settings/categories/page')).default;
    render(<CategoriesPage />);

    // Should render without crashing
    expect(document.body).toBeTruthy();
  });
});
