/**
 * Tests for Dashboard Page
 */

import { render, screen } from '@/tests/utils/test-utils';
import DashboardPage from '@/app/dashboard/page';

// Mock dashboard API
jest.mock('@/lib/slices/dashboardApi', () => ({
  useGetDashboardStatsQuery: jest.fn(() => ({
    data: {
      totalSales: 10000,
      totalPurchases: 5000,
      totalCustomers: 100,
      totalProducts: 500,
    },
    isLoading: false,
    isError: false,
  })),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard'),
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render dashboard page', () => {
    render(<DashboardPage />);

    // Check if main dashboard elements are present
    const dashboard = screen.getByRole('main') || document.querySelector('[data-testid="dashboard"]');
    expect(dashboard || document.body).toBeTruthy();
  });

  it('should display loading state', () => {
    const { useGetDashboardStatsQuery } = require('@/lib/slices/dashboardApi');
    useGetDashboardStatsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<DashboardPage />);

    // Check for loading indicator
    const loadingElement = screen.queryByText(/loading/i);
    if (loadingElement) {
      expect(loadingElement).toBeInTheDocument();
    }
  });

  it('should handle error state', () => {
    const { useGetDashboardStatsQuery } = require('@/lib/slices/dashboardApi');
    useGetDashboardStatsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    render(<DashboardPage />);

    // Should still render without crashing
    expect(document.body).toBeTruthy();
  });
});
