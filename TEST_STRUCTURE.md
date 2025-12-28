# Test Structure Documentation

## Overview

This document outlines the comprehensive testing structure implemented for the POSy application.

## Directory Structure

```
POSy/
├── tests/                                    # Main test directory
│   ├── README.md                            # Testing documentation
│   ├── setup.ts                             # Jest setup file
│   ├── __mocks__/                           # Mock files
│   │   └── fileMock.ts                      # Static asset mocks
│   ├── utils/                               # Testing utilities
│   │   ├── test-utils.tsx                   # Custom render functions
│   │   └── mockData.ts                      # Mock data factories
│   ├── lib/                                 # Library tests
│   │   └── slices/                          # Redux slice tests
│   │       └── invoicesV2Api.test.ts        # Invoice API tests
│   ├── components/                          # Component tests
│   │   └── dashboard-layout.test.tsx        # Dashboard layout tests
│   └── app/                                 # Page tests
│       ├── dashboard/
│       │   └── page.test.tsx                # Dashboard page tests
│       ├── invoice/
│       │   └── list/
│       │       └── page.test.tsx            # Invoice list page tests
│       └── products/
│           └── list/
│               └── page.test.tsx            # Product list page tests
│
├── jest.config.ts                           # Jest configuration
└── package.json                             # Test scripts
```

## Test Categories

### 1. Type Tests (`tests/lib/slices/`)

Tests for TypeScript type definitions and interfaces.

**Example**: `invoicesV2Api.test.ts`
- ✅ Invoice interface structure
- ✅ InvoiceItem interface structure
- ✅ Type validation for status enums
- ✅ Type validation for payment status

### 2. Redux Slice Tests (`tests/lib/slices/`)

Tests for Redux slices and RTK Query APIs.

**Example**: `invoicesV2Api.test.ts`
- ✅ API endpoint definitions
- ✅ Query builders
- ✅ Hook exports
- ✅ Transformations

### 3. Component Tests (`tests/components/`)

Tests for reusable React components.

**Example**: `dashboard-layout.test.tsx`
- ✅ Component rendering
- ✅ Props handling
- ✅ User interactions
- ✅ Accessibility attributes

### 4. Page Tests (`tests/app/`)

Integration tests for Next.js pages.

**Examples**:
- `dashboard/page.test.tsx` - Dashboard functionality
- `invoice/list/page.test.tsx` - Invoice list features
- `products/list/page.test.tsx` - Product list features

**Common test cases**:
- ✅ Page rendering
- ✅ Data fetching and display
- ✅ Loading states
- ✅ Error states
- ✅ Empty states
- ✅ User interactions
- ✅ Search and filters
- ✅ Pagination

## Testing Utilities

### Custom Render (`test-utils.tsx`)

```typescript
import { render } from '@/tests/utils/test-utils';

// Renders component with Redux provider
const { store } = render(<MyComponent />);
```

### Mock Data Factories (`mockData.ts`)

```typescript
import { createMockInvoice } from '@/tests/utils/mockData';

const invoice = createMockInvoice({ total: 1000 });
```

**Available factories**:
- `createMockInvoice(overrides?)`
- `createMockInvoiceItem(overrides?)`
- `createMockCustomer(overrides?)`
- `createMockProduct(overrides?)`
- `createMockWarehouse(overrides?)`
- `createMockUser(overrides?)`
- `createMockPaginatedResponse(data, total?, page?, limit?)`

## Test Scripts

```json
{
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- invoicesV2Api.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Invoice"
```

## Coverage Configuration

**Thresholds** (configured in `jest.config.ts`):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

**Coverage includes**:
- `app/**/*.{ts,tsx}`
- `components/**/*.{ts,tsx}`
- `lib/**/*.{ts,tsx}`

**Coverage excludes**:
- `**/*.d.ts`
- `**/node_modules/**`
- `**/.next/**`
- `**/coverage/**`
- `**/dist/**`

## Key Features

### 1. Next.js Integration

- ✅ Next.js Jest integration using `next/jest`
- ✅ Automatic path alias resolution (`@/`)
- ✅ Router mocking
- ✅ Link component mocking

### 2. Redux Integration

- ✅ Test store creation utility
- ✅ Pre-configured with all reducers
- ✅ RTK Query middleware included
- ✅ Custom render with providers

### 3. Comprehensive Mocking

- ✅ Next.js router mocked
- ✅ Next.js link mocked
- ✅ CSS imports mocked
- ✅ Static assets mocked
- ✅ Window.matchMedia mocked
- ✅ IntersectionObserver mocked
- ✅ ResizeObserver mocked

### 4. Testing Best Practices

- ✅ TypeScript support
- ✅ React Testing Library queries
- ✅ jest-dom matchers
- ✅ Accessibility testing support
- ✅ Async testing utilities

## Example Test Patterns

### 1. Testing Data Fetching

```typescript
it('should display data after loading', async () => {
  render(<MyPage />);

  await waitFor(() => {
    expect(screen.getByText('Expected Data')).toBeInTheDocument();
  });
});
```

### 2. Testing User Interactions

```typescript
it('should handle button click', () => {
  render(<MyComponent />);

  const button = screen.getByRole('button');
  fireEvent.click(button);

  expect(mockFunction).toHaveBeenCalled();
});
```

### 3. Testing Forms

```typescript
it('should submit form', async () => {
  render(<MyForm />);

  const input = screen.getByLabelText('Name');
  fireEvent.change(input, { target: { value: 'Test' } });

  const submitButton = screen.getByRole('button', { name: /submit/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({ name: 'Test' });
  });
});
```

### 4. Testing Different States

```typescript
it('should show loading state', () => {
  mockApi.useQuery.mockReturnValue({ isLoading: true });
  render(<MyComponent />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});

it('should show error state', () => {
  mockApi.useQuery.mockReturnValue({ isError: true });
  render(<MyComponent />);
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});

it('should show empty state', () => {
  mockApi.useQuery.mockReturnValue({ data: [] });
  render(<MyComponent />);
  expect(screen.getByText(/no items/i)).toBeInTheDocument();
});
```

## Extending the Test Suite

### Adding Tests for New Pages

1. Create test file: `tests/app/[feature]/page.test.tsx`
2. Import testing utilities and mock data
3. Mock API hooks
4. Write test cases for:
   - Rendering
   - Data display
   - Loading/error/empty states
   - User interactions

### Adding Tests for New Components

1. Create test file: `tests/components/[component].test.tsx`
2. Test component in isolation
3. Test props and variants
4. Test user interactions
5. Test accessibility

### Adding New Mock Data

1. Add factory function to `tests/utils/mockData.ts`
2. Follow naming convention: `createMock[EntityName]`
3. Include all required fields
4. Support overrides parameter

## Continuous Integration

The test suite is designed to run in CI/CD pipelines:

```yaml
# Example CI configuration
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
```

## Maintenance

### Regular Tasks

1. **Update snapshots** when UI changes intentionally
2. **Increase coverage** for new features
3. **Fix flaky tests** immediately
4. **Update mocks** when APIs change
5. **Review test performance** regularly

### Troubleshooting

Common issues and solutions are documented in `tests/README.md`.

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Next.js Testing](https://nextjs.org/docs/testing)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Summary

This testing infrastructure provides:

✅ **Comprehensive coverage** for types, slices, components, and pages
✅ **Easy-to-use utilities** for testing Redux and Next.js features
✅ **Mock data factories** for consistent test data
✅ **Best practices** and patterns for maintainable tests
✅ **CI/CD ready** with coverage reporting
✅ **Well-documented** with examples and guides

All tests can be run with `npm test` and coverage can be generated with `npm run test:coverage`.
