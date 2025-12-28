import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice"
import databaseSlice from "./slices/databaseSlice"
import customersSlice from "./slices/customersSlice"
import suppliersSlice from "./slices/suppliersSlice"
import expensesSlice from "./slices/expensesSlice"
import transfersSlice from "./slices/transfersSlice"
import hrmSlice from "./slices/hrmSlice"
import reportsSlice from "./slices/reportsSlice"
import settingsSlice from "./slices/settingsSlice"
import { productsApi } from "./slices/productsApi"
import { adjustmentsApi } from "./slices/adjustmentsApi"
import { quotationsApi } from "./slices/quotationsApi"
import { purchasesApi } from "./slices/purchasesApi"
import { salesApi } from "./slices/salesApi"
import { customersApi } from "./slices/customersApi"
import { settingsApi } from "./slices/settingsApi"
import { expensesApi } from "./slices/expensesApi"
import { returnsApi } from "./slices/returnsApi"
import { suppliersApi } from "./slices/suppliersApi"
import { reportsApi } from "./slices/reportsApi"
import { paymentsApi } from "./slices/paymentsApi"
import { hrmApi } from "./slices/hrmApi"
import { transfersApi } from "./slices/transfersApi"
import { hrmCatalogApi } from "./slices/hrmCatalogApi"
import { hrmAttendanceApi } from "./slices/hrmAttendanceApi"
import { invoicesApi } from "./slices/invoicesApi"
import { organizationApi } from "./slices/organizationApi"
import { settingsV2Api } from "./slices/settingsV2Api"
import { authApi } from "./slices/authSlice"
import { dashboardApi } from "./slices/dashboardApi"
import { notificationsApi } from "./slices/notificationsApi"
import { fdmsApi } from "./slices/fdmsApi"
import { categoriesApi } from "./slices/categoriesApi"
import { brandsApi } from "./slices/brandsApi"
import { currenciesApi } from "./slices/currenciesApi"
import { unitsApi } from "./slices/unitsApi"
import { warehousesApi } from "./slices/warehousesApi"
import { hrmV2Api } from "./slices/hrmV2Api"
import { invoicesV2Api } from "./slices/invoicesV2Api"
import { stockTakesApi } from "./slices/stockTakesApi"

export const store = configureStore({
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
    [stockTakesApi.reducerPath]: stockTakesApi.reducer,
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
      invoicesV2Api.middleware,
      stockTakesApi.middleware
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
