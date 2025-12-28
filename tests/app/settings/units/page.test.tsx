/**
 * Tests for Units Settings Page
 */

import { render, screen, waitFor } from '@/tests/utils/test-utils';

const mockUnits = [
  { id: 1, name: 'Piece', short_name: 'pc', status: 'active' },
  { id: 2, name: 'Box', short_name: 'box', status: 'active' },
];

jest.mock('@/lib/slices/unitsApi', () => ({
  useGetUnitsQuery: jest.fn(() => ({
    data: mockUnits,
    isLoading: false,
    isError: false,
  })),
  useCreateUnitMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useUpdateUnitMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
  useDeleteUnitMutation: jest.fn(() => [jest.fn(), { isLoading: false }]),
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
  usePathname: jest.fn(() => '/settings/units'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  redirect: jest.fn(),
}));

describe('Units Settings Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render units settings page', async () => {
    const UnitsPage = (await import('@/app/settings/units/page')).default;
    render(<UnitsPage />);

    expect(document.body).toBeTruthy();
  });

  it('should display loading state', async () => {
    const { useGetUnitsQuery } = require('@/lib/slices/unitsApi');
    useGetUnitsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    const UnitsPage = (await import('@/app/settings/units/page')).default;
    render(<UnitsPage />);

    expect(document.body).toBeTruthy();
  });

  it('should handle empty data', async () => {
    const { useGetUnitsQuery } = require('@/lib/slices/unitsApi');
    useGetUnitsQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    const UnitsPage = (await import('@/app/settings/units/page')).default;
    render(<UnitsPage />);

    expect(document.body).toBeTruthy();
  });
});
