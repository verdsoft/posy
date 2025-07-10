import { configureStore } from "@reduxjs/toolkit"
import authSlice from "./slices/authSlice"
import databaseSlice from "./slices/databaseSlice"
import productsSlice from "./slices/productsSlice"
import customersSlice from "./slices/customersSlice"
import suppliersSlice from "./slices/suppliersSlice"
import salesSlice from "./slices/salesSlice"
import purchasesSlice from "./slices/purchasesSlice"
import expensesSlice from "./slices/expensesSlice"
import transfersSlice from "./slices/transfersSlice"
import hrmSlice from "./slices/hrmSlice"
import reportsSlice from "./slices/reportsSlice"
import settingsSlice from "./slices/settingsSlice"

export const store = configureStore({
  reducer: {
    auth: authSlice,
    database: databaseSlice,
    products: productsSlice,
    customers: customersSlice,
    suppliers: suppliersSlice,
    sales: salesSlice,
    purchases: purchasesSlice,
    expenses: expensesSlice,
    transfers: transfersSlice,
    hrm: hrmSlice,
    reports: reportsSlice,
    settings: settingsSlice,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
