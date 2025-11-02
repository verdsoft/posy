# Testing Documentation

This directory contains all tests for the POSy application. We use Jest and React Testing Library for comprehensive testing coverage.

## Table of Contents

- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Utilities](#test-utilities)
- [Best Practices](#best-practices)
- [Coverage](#coverage)

## Test Structure

```
tests/
├── README.md                     # This file
├── setup.ts                      # Jest setup and global mocks
├── __mocks__/                    # Mock files for assets
│   └── fileMock.ts              # Mock for image/file imports
├── utils/                        # Testing utilities
│   ├── test-utils.tsx           # Custom render with providers
│   └── mockData.ts              # Mock data factories
├── lib/                          # Tests for library code
│   └── slices/                  # Redux slice tests
│       └── invoicesV2Api.test.ts
├── components/                   # Component tests
│   └── dashboard-layout.test.tsx
└── app/                          # Page/route tests
    └── invoice/
        └── list/
            └── page.test.tsx
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- path/to/test/file.test.ts
```

### Run tests matching pattern
```bash
npm test -- --testNamePattern="Invoice"
```

## Writing Tests

### 1. Type Tests

Test TypeScript interfaces and type definitions:

```typescript
import type { Invoice } from '@/lib/slices/invoicesV2Api';

describe('Invoice Type', () => {
  it('should have correct structure', () => {
    const invoice: Invoice = {
      id: 1,
      reference: 'INV-001',
      // ... other fields
    };

    expect(invoice).toHaveProperty('id');
    expect(invoice).toHaveProperty('reference');
  });
});
```

### 2. Redux Slice Tests

Test Redux slices and RTK Query APIs:

```typescript
import { createTestStore } from '@/tests/utils/test-utils';
import { invoicesV2Api } from '@/lib/slices/invoicesV2Api';

describe('invoicesV2Api', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('should have correct endpoints', () => {
    const { endpoints } = invoicesV2Api;
    expect(endpoints.getInvoices).toBeDefined();
  });
});
```

### 3. Component Tests

Test React components in isolation:

```typescript
import { render, screen } from '@/tests/utils/test-utils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Assert expected behavior
  });
});
```

### 4. Page Tests

Test Next.js pages with mocked data:

```typescript
import { render, screen, waitFor } from '@/tests/utils/test-utils';
import MyPage from '@/app/my-page/page';

// Mock API hooks
jest.mock('@/lib/slices/myApi', () => ({
  useGetDataQuery: jest.fn(() => ({
    data: mockData,
    isLoading: false,
    isError: false,
  })),
}));

describe('MyPage', () => {
  it('should display data', async () => {
    render(<MyPage />);
    await waitFor(() => {
      expect(screen.getByText('Expected Data')).toBeInTheDocument();
    });
  });
});
```

## Test Utilities

### Custom Render

Use `renderWithProviders` from `test-utils.tsx` to render components with Redux store:

```typescript
import { render } from '@/tests/utils/test-utils';

const { store } = render(<MyComponent />);
```

### Mock Data Factories

Use mock data factories to create test data:

```typescript
import { createMockInvoice } from '@/tests/utils/mockData';

const invoice = createMockInvoice({ total: 1000 });
const invoices = [
  createMockInvoice({ id: 1 }),
  createMockInvoice({ id: 2 }),
];
```

### Available Mock Factories

- `createMockInvoice(overrides?)` - Create mock invoice
- `createMockInvoiceItem(overrides?)` - Create mock invoice item
- `createMockCustomer(overrides?)` - Create mock customer
- `createMockProduct(overrides?)` - Create mock product
- `createMockWarehouse(overrides?)` - Create mock warehouse
- `createMockUser(overrides?)` - Create mock user
- `createMockPaginatedResponse(data, total?, page?, limit?)` - Create paginated response

## Best Practices

### 1. Test Organization

- **Group related tests** using `describe` blocks
- **Use clear test names** that describe what is being tested
- **Follow AAA pattern**: Arrange, Act, Assert

```typescript
describe('Feature', () => {
  describe('Subfeature', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = doSomething(input);

      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

### 2. Mocking

- **Mock external dependencies** (APIs, routers, etc.)
- **Use jest.mock()** for module mocks
- **Clean up mocks** in `beforeEach` or `afterEach`

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

### 3. Async Testing

- **Use waitFor** for async operations
- **Use findBy queries** for elements that appear asynchronously

```typescript
it('should load data', async () => {
  render(<Component />);
  const element = await screen.findByText('Loaded Data');
  expect(element).toBeInTheDocument();
});
```

### 4. Accessibility

- **Use semantic queries** (getByRole, getByLabelText)
- **Test keyboard navigation** where applicable
- **Check ARIA attributes**

```typescript
const button = screen.getByRole('button', { name: /submit/i });
expect(button).toHaveAttribute('aria-label', 'Submit form');
```

### 5. Test Data

- **Use factory functions** for consistent test data
- **Override only what's needed** for each test
- **Keep test data minimal** but realistic

## Coverage

### Coverage Thresholds

The project has the following coverage thresholds:

- **Branches**: 50%
- **Functions**: 50%
- **Lines**: 50%
- **Statements**: 50%

### Viewing Coverage

After running `npm run test:coverage`, open `coverage/lcov-report/index.html` in your browser to view detailed coverage reports.

### Improving Coverage

1. Identify uncovered code in coverage report
2. Add tests for uncovered branches
3. Test edge cases and error conditions
4. Mock external dependencies properly

## Common Testing Scenarios

### Testing Forms

```typescript
it('should submit form with valid data', async () => {
  render(<MyForm />);

  const nameInput = screen.getByLabelText('Name');
  const emailInput = screen.getByLabelText('Email');
  const submitButton = screen.getByRole('button', { name: /submit/i });

  fireEvent.change(nameInput, { target: { value: 'John Doe' } });
  fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });
});
```

### Testing Tables

```typescript
it('should display table data', () => {
  render(<DataTable data={mockData} />);

  mockData.forEach(item => {
    expect(screen.getByText(item.name)).toBeInTheDocument();
  });
});
```

### Testing Loading States

```typescript
it('should show loading state', () => {
  mockApi.useGetDataQuery.mockReturnValue({
    data: undefined,
    isLoading: true,
    isError: false,
  });

  render(<Component />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
});
```

### Testing Error States

```typescript
it('should show error state', () => {
  mockApi.useGetDataQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: true,
  });

  render(<Component />);
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Check path aliases in `jest.config.ts`
   - Ensure imports use `@/` prefix

2. **Component not rendering**
   - Check if component needs providers (use `renderWithProviders`)
   - Verify all required props are provided

3. **Async tests timing out**
   - Use `waitFor` for async operations
   - Check mock data is returned correctly
   - Increase timeout if needed: `jest.setTimeout(10000)`

4. **Mock not working**
   - Ensure mock is defined before importing component
   - Clear mocks in `beforeEach`
   - Check mock function signatures match

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Next.js Testing](https://nextjs.org/docs/testing)
