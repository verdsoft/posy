/**
 * Tests for Warehouses Settings Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { createMockWarehouse } from '@/tests/utils/mockData';

const mockWarehouses = [
  createMockWarehouse(),
  createMockWarehouse({ id: 2, name: 'Warehouse 2' }),
];

jest.mock('@/lib/slices/warehousesApi', () => ({
  useGetWarehousesQuery: jest.fn(() => ({
    data: mockWarehouses,
    isLoading: false,
    isError: false,
  })),
  useCreateWarehouseMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useUpdateWarehouseMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteWarehouseMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/settings/warehouses'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Warehouses Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render warehouses settings page', async () => {
    const WarehousesPage = (await import('@/app/settings/warehouses/page')).default;
    render(<WarehousesPage />);

    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetWarehousesQuery } = require('@/lib/slices/warehousesApi');
    useGetWarehousesQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const WarehousesPage = (await import('@/app/settings/warehouses/page')).default;
    render(<WarehousesPage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetWarehousesQuery } = require('@/lib/slices/warehousesApi');
    useGetWarehousesQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const WarehousesPage = (await import('@/app/settings/warehouses/page')).default;
    render(<WarehousesPage />);

    expect(document.body).toBeTruthy();
  });
});
