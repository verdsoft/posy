/**
 * Testing utilities and custom render functions
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store';

// Import core slices (these are more stable)
import authSlice from '@/lib/slices/authSlice';
import databaseSlice from '@/lib/slices/databaseSlice';

// Helper function to safely import API slices
const safeImport = <T,>(importFn: () => T): T | null => {
  try {
    return importFn();
  } catch (error) {
    return null;
  }
};

// Try to import all API slices, but don't fail if they're missing
const productsApi = safeImport(() => require('@/lib/slices/productsApi').productsApi);
const customersApi = safeImport(() => require('@/lib/slices/customersApi').customersApi);
const invoicesV2Api = safeImport(() => require('@/lib/slices/invoicesV2Api').invoicesV2Api);
const salesApi = safeImport(() => require('@/lib/slices/salesApi').salesApi);
const purchasesApi = safeImport(() => require('@/lib/slices/purchasesApi').purchasesApi);
const warehousesApi = safeImport(() => require('@/lib/slices/warehousesApi').warehousesApi);
const suppliersApi = safeImport(() => require('@/lib/slices/suppliersApi').suppliersApi);
const expensesApi = safeImport(() => require('@/lib/slices/expensesApi').expensesApi);
const settingsApi = safeImport(() => require('@/lib/slices/settingsApi').settingsApi);
const dashboardApi = safeImport(() => require('@/lib/slices/dashboardApi').dashboardApi);
const organizationApi = safeImport(() => require('@/lib/slices/organizationApi').organizationApi);
const notificationsApi = safeImport(() => require('@/lib/slices/notificationsApi').notificationsApi);

/**
 * Create a test store with optional preloaded state
 */
export function createTestStore(preloadedState?: Partial<RootState>) {
  // Default state with authenticated user (for tests to pass AuthGuard)
  const defaultState = {
    auth: {
      isAuthenticated: true,
      user: { id: 1, email: 'test@example.com', name: 'Test User' },
      token: 'test-token',
    },
    database: {
      connected: true,
    },
    ...preloadedState,
  };

  // Build reducers object dynamically, only adding APIs that loaded successfully
  const reducers: Record<string, unknown> = {
    auth: authSlice,
    database: databaseSlice,
  };

  // Add API reducers if they're available
  const apis = [
    productsApi,
    customersApi,
    invoicesV2Api,
    salesApi,
    purchasesApi,
    warehousesApi,
    suppliersApi,
    expensesApi,
    settingsApi,
    dashboardApi,
    organizationApi,
    notificationsApi,
  ];

  apis.forEach((api) => {
    if (api && api.reducerPath && api.reducer) {
      reducers[api.reducerPath] = api.reducer;
    }
  });

  // Build middleware array, only adding APIs that loaded successfully
  const middlewares = apis
    .filter((api) => api && api.middleware)
    .map((api) => api!.middleware);

  return configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(...middlewares),
    preloadedState: defaultState as Record<string, unknown>,
  });
}

interface AllTheProvidersProps {
  children: ReactNode;
  store?: ReturnType<typeof createTestStore>;
}

/**
 * Wrapper component that provides all necessary providers for testing
 */
function AllTheProviders({ children, store }: AllTheProvidersProps) {
  const testStore = store || createTestStore();

  return (
    <Provider store={testStore}>
      {children}
    </Provider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof createTestStore>;
}

/**
 * Custom render function that wraps components with necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return <AllTheProviders store={store}>{children}</AllTheProviders>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { renderWithProviders as render };
