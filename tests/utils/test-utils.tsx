/**
 * Testing utilities and custom render functions
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/store';

// Import all reducers
import authSlice from '@/lib/slices/authSlice';
import databaseSlice from '@/lib/slices/databaseSlice';
import customersSlice from '@/lib/slices/customersSlice';
import suppliersSlice from '@/lib/slices/suppliersSlice';
import expensesSlice from '@/lib/slices/expensesSlice';
import transfersSlice from '@/lib/slices/transfersSlice';
import hrmSlice from '@/lib/slices/hrmSlice';
import reportsSlice from '@/lib/slices/reportsSlice';
import settingsSlice from '@/lib/slices/settingsSlice';
import { productsApi } from '@/lib/slices/productsApi';
import { adjustmentsApi } from '@/lib/slices/adjustmentsApi';
import { quotationsApi } from '@/lib/slices/quotationsApi';
import { purchasesApi } from '@/lib/slices/purchasesApi';
import { salesApi } from '@/lib/slices/salesApi';
import { customersApi } from '@/lib/slices/customersApi';
import { settingsApi } from '@/lib/slices/settingsApi';
import { expensesApi } from '@/lib/slices/expensesApi';
import { returnsApi } from '@/lib/slices/returnsApi';
import { suppliersApi } from '@/lib/slices/suppliersApi';
import { reportsApi } from '@/lib/slices/reportsApi';
import { paymentsApi } from '@/lib/slices/paymentsApi';
import { hrmApi } from '@/lib/slices/hrmApi';
import { transfersApi } from '@/lib/slices/transfersApi';
import { hrmCatalogApi } from '@/lib/slices/hrmCatalogApi';
import { hrmAttendanceApi } from '@/lib/slices/hrmAttendanceApi';
import { invoicesApi } from '@/lib/slices/invoicesApi';
import { organizationApi } from '@/lib/slices/organizationApi';
import { settingsV2Api } from '@/lib/slices/settingsV2Api';
import { authApi } from '@/lib/slices/authSlice';
import { dashboardApi } from '@/lib/slices/dashboardApi';
import { notificationsApi } from '@/lib/slices/notificationsApi';
import { fdmsApi } from '@/lib/slices/fdmsApi';
import { categoriesApi } from '@/lib/slices/categoriesApi';
import { brandsApi } from '@/lib/slices/brandsApi';
import { currenciesApi } from '@/lib/slices/currenciesApi';
import { unitsApi } from '@/lib/slices/unitsApi';
import { warehousesApi } from '@/lib/slices/warehousesApi';
import { hrmV2Api } from '@/lib/slices/hrmV2Api';
import { invoicesV2Api } from '@/lib/slices/invoicesV2Api';

/**
 * Create a test store with optional preloaded state
 */
export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authSlice,
      database: databaseSlice,
      customers: customersSlice,
      suppliers: suppliersSlice,
      expenses: expensesSlice,
      transfers: transfersSlice,
      hrm: hrmSlice,
      reports: reportsSlice,
      settings: settingsSlice,
      [productsApi.reducerPath]: productsApi.reducer,
      [adjustmentsApi.reducerPath]: adjustmentsApi.reducer,
      [quotationsApi.reducerPath]: quotationsApi.reducer,
      [purchasesApi.reducerPath]: purchasesApi.reducer,
      [salesApi.reducerPath]: salesApi.reducer,
      [customersApi.reducerPath]: customersApi.reducer,
      [settingsApi.reducerPath]: settingsApi.reducer,
      [expensesApi.reducerPath]: expensesApi.reducer,
      [returnsApi.reducerPath]: returnsApi.reducer,
      [suppliersApi.reducerPath]: suppliersApi.reducer,
      [reportsApi.reducerPath]: reportsApi.reducer,
      [paymentsApi.reducerPath]: paymentsApi.reducer,
      [hrmApi.reducerPath]: hrmApi.reducer,
      [transfersApi.reducerPath]: transfersApi.reducer,
      [hrmCatalogApi.reducerPath]: hrmCatalogApi.reducer,
      [hrmAttendanceApi.reducerPath]: hrmAttendanceApi.reducer,
      [invoicesApi.reducerPath]: invoicesApi.reducer,
      [organizationApi.reducerPath]: organizationApi.reducer,
      [settingsV2Api.reducerPath]: settingsV2Api.reducer,
      [authApi.reducerPath]: authApi.reducer,
      [dashboardApi.reducerPath]: dashboardApi.reducer,
      [notificationsApi.reducerPath]: notificationsApi.reducer,
      [fdmsApi.reducerPath]: fdmsApi.reducer,
      [categoriesApi.reducerPath]: categoriesApi.reducer,
      [brandsApi.reducerPath]: brandsApi.reducer,
      [currenciesApi.reducerPath]: currenciesApi.reducer,
      [unitsApi.reducerPath]: unitsApi.reducer,
      [warehousesApi.reducerPath]: warehousesApi.reducer,
      [hrmV2Api.reducerPath]: hrmV2Api.reducer,
      [invoicesV2Api.reducerPath]: invoicesV2Api.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        productsApi.middleware,
        adjustmentsApi.middleware,
        quotationsApi.middleware,
        purchasesApi.middleware,
        salesApi.middleware,
        customersApi.middleware,
        settingsApi.middleware,
        expensesApi.middleware,
        returnsApi.middleware,
        suppliersApi.middleware,
        reportsApi.middleware,
        paymentsApi.middleware,
        hrmApi.middleware,
        transfersApi.middleware,
        hrmCatalogApi.middleware,
        hrmAttendanceApi.middleware,
        invoicesApi.middleware,
        organizationApi.middleware,
        settingsV2Api.middleware,
        authApi.middleware,
        dashboardApi.middleware,
        notificationsApi.middleware,
        fdmsApi.middleware,
        categoriesApi.middleware,
        brandsApi.middleware,
        currenciesApi.middleware,
        unitsApi.middleware,
        warehousesApi.middleware,
        hrmV2Api.middleware,
        invoicesV2Api.middleware
      ),
    preloadedState,
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
