# Quick Start Guide - Testing

## Getting Started with Testing

This guide will help you quickly start writing and running tests in the POSy application.

## 1. Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 2. Writing Your First Test

### Step 1: Create a test file

Create a file with `.test.ts` or `.test.tsx` extension next to the code you're testing:

```
app/
  my-feature/
    page.tsx          # Your component
    page.test.tsx     # Your test file
```

### Step 2: Write a simple test

```typescript
import { render, screen } from '@/tests/utils/test-utils';
import MyPage from './page';

describe('MyPage', () => {
  it('should render the page title', () => {
    render(<MyPage />);
    expect(screen.getByText('My Page Title')).toBeInTheDocument();
  });
});
```

### Step 3: Run your test

```bash
npm test -- MyPage
```

## 3. Common Testing Patterns

### Testing a List Page

```typescript
import { render, screen, waitFor } from '@/tests/utils/test-utils';
import { createMockProduct, createMockPaginatedResponse } from '@/tests/utils/mockData';
import ProductList from './page';

// Mock the API
jest.mock('@/lib/slices/productsApi', () => ({
  useGetProductsQuery: jest.fn(() => ({
    data: createMockPaginatedResponse([
      createMockProduct({ id: 1, name: 'Product 1' }),
      createMockProduct({ id: 2, name: 'Product 2' }),
    ]),
    isLoading: false,
    isError: false,
  })),
}));

describe('ProductList', () => {
  it('should display products', async () => {
    render(<ProductList />);

    await waitFor(() => {
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('Product 2')).toBeInTheDocument();
    });
  });

  it('should show loading state', () => {
    const { useGetProductsQuery } = require('@/lib/slices/productsApi');
    useGetProductsQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<ProductList />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

### Testing User Interactions

```typescript
import { render, screen, fireEvent } from '@/tests/utils/test-utils';

it('should handle search input', () => {
  render(<SearchComponent />);

  const searchInput = screen.getByPlaceholderText('Search...');
  fireEvent.change(searchInput, { target: { value: 'test query' } });

  expect(searchInput).toHaveValue('test query');
});

it('should handle button click', () => {
  const mockOnClick = jest.fn();
  render(<Button onClick={mockOnClick}>Click me</Button>);

  const button = screen.getByRole('button', { name: /click me/i });
  fireEvent.click(button);

  expect(mockOnClick).toHaveBeenCalledTimes(1);
});
```

### Testing Forms

```typescript
it('should submit form with data', async () => {
  const mockSubmit = jest.fn();
  render(<MyForm onSubmit={mockSubmit} />);

  // Fill in form fields
  const nameInput = screen.getByLabelText('Name');
  const emailInput = screen.getByLabelText('Email');

  fireEvent.change(nameInput, { target: { value: 'John Doe' } });
  fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

  // Submit form
  const submitButton = screen.getByRole('button', { name: /submit/i });
  fireEvent.click(submitButton);

  // Verify submission
  await waitFor(() => {
    expect(mockSubmit).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
    });
  });
});
```

## 4. Using Mock Data

### Create mock data using factories

```typescript
import {
  createMockInvoice,
  createMockProduct,
  createMockCustomer,
  createMockPaginatedResponse,
} from '@/tests/utils/mockData';

// Create single mock
const product = createMockProduct({ name: 'Custom Name', price: 99.99 });

// Create multiple mocks
const products = [
  createMockProduct({ id: 1, name: 'Product 1' }),
  createMockProduct({ id: 2, name: 'Product 2' }),
  createMockProduct({ id: 3, name: 'Product 3' }),
];

// Create paginated response
const paginatedData = createMockPaginatedResponse(products, 3, 1, 10);
```

## 5. Mocking APIs

### Mock RTK Query hooks

```typescript
// At the top of your test file
jest.mock('@/lib/slices/myApi', () => ({
  useGetDataQuery: jest.fn(() => ({
    data: mockData,
    isLoading: false,
    isError: false,
  })),
  useCreateItemMutation: jest.fn(() => [
    jest.fn(),
    { isLoading: false },
  ]),
}));

// In your test
it('should use the mocked data', () => {
  render(<MyComponent />);
  // Component will use the mocked data
});
```

### Mock Next.js router

```typescript
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/current-path'),
}));
```

## 6. Testing Different States

### Loading State

```typescript
it('should show loading state', () => {
  mockApi.useGetDataQuery.mockReturnValue({
    data: undefined,
    isLoading: true,
    isError: false,
  });

  render(<MyComponent />);
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
```

### Error State

```typescript
it('should show error state', () => {
  mockApi.useGetDataQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: true,
  });

  render(<MyComponent />);
  expect(screen.getByText(/error/i)).toBeInTheDocument();
});
```

### Empty State

```typescript
it('should show empty state', () => {
  mockApi.useGetDataQuery.mockReturnValue({
    data: createMockPaginatedResponse([], 0, 1, 10),
    isLoading: false,
    isError: false,
  });

  render(<MyComponent />);
  expect(screen.getByText(/no items found/i)).toBeInTheDocument();
});
```

## 7. Best Practices Checklist

✅ **Write descriptive test names** - Describe what is being tested, not how
✅ **Test user behavior** - Test what users see and do, not implementation details
✅ **Use semantic queries** - Prefer `getByRole`, `getByLabelText` over `getByTestId`
✅ **Test loading and error states** - Don't just test the happy path
✅ **Keep tests independent** - Each test should run in isolation
✅ **Clean up after tests** - Use `beforeEach` to reset mocks
✅ **Use factories for test data** - Don't repeat test data across tests
✅ **Test accessibility** - Use `getByRole` and check ARIA attributes

## 8. Common Queries

### Finding Elements

```typescript
// By role (preferred)
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });

// By label text
screen.getByLabelText('Email Address');

// By placeholder
screen.getByPlaceholderText('Enter email...');

// By text content
screen.getByText('Welcome');
screen.getByText(/welcome/i); // case insensitive

// By test ID (last resort)
screen.getByTestId('custom-element');
```

### Async Queries

```typescript
// Wait for element to appear
const element = await screen.findByText('Loaded Data');

// Wait for condition
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## 9. Debugging Tests

### View rendered HTML

```typescript
import { render, screen } from '@/tests/utils/test-utils';

it('test', () => {
  const { debug } = render(<MyComponent />);
  debug(); // Prints the DOM to console
});
```

### Check what queries are available

```typescript
screen.logTestingPlaygroundURL(); // Suggests best queries to use
```

### Run single test

```bash
npm test -- --testNamePattern="specific test name"
```

## 10. Coverage

### Check what's covered

```bash
npm run test:coverage
```

Then open `coverage/lcov-report/index.html` in your browser.

### Focus on important metrics

- **Lines**: Are all code paths executed?
- **Branches**: Are all if/else conditions tested?
- **Functions**: Are all functions called in tests?

## Need Help?

- Check `tests/README.md` for detailed documentation
- Look at existing tests in `tests/` for examples
- See `TEST_STRUCTURE.md` for the complete testing structure

## Quick Reference Card

```typescript
// Import
import { render, screen, waitFor, fireEvent } from '@/tests/utils/test-utils';
import { createMockProduct } from '@/tests/utils/mockData';

// Render
render(<MyComponent />);

// Find elements
screen.getByRole('button');
screen.getByText('Hello');
screen.getByLabelText('Email');

// User events
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'text' } });

// Async
await screen.findByText('Loaded');
await waitFor(() => expect(element).toBeInTheDocument());

// Assertions
expect(element).toBeInTheDocument();
expect(element).toHaveTextContent('text');
expect(element).toHaveAttribute('href', '/link');
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith('arg');
```

Happy Testing! 🚀
