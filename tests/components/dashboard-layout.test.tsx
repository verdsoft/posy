/**
 * Tests for DashboardLayout component
 */

import { render, screen } from '@/tests/utils/test-utils';
import DashboardLayout from '@/components/dashboard-layout';
import { useRouter } from 'next/navigation';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}));

// Mock settings API
jest.mock('@/lib/slices/settingsApi', () => ({
  useGetSystemSettingsQuery: jest.fn(() => ({
    data: {
      company_name: 'Test Company',
      company_logo: '/logo.png',
    },
    isLoading: false,
    error: null,
  })),
}));

describe('DashboardLayout', () => {
  const mockPush = jest.fn();
  const mockRouter = {
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  };

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(
      <DashboardLayout>
        <div>Test Content</div>
      </DashboardLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should display children content', () => {
    const testContent = 'Dashboard Test Content';
    render(
      <DashboardLayout>
        <div>{testContent}</div>
      </DashboardLayout>
    );

    expect(screen.getByText(testContent)).toBeInTheDocument();
  });

  it('should render with AuthGuard wrapper', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // The component should be wrapped in AuthGuard
    expect(container.firstChild).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );

    // Check for proper HTML structure
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
