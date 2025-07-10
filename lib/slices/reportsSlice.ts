import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface ReportData {
  [key: string]: any
}

interface ReportsState {
  salesReport: ReportData | null
  purchaseReport: ReportData | null
  profitLoss: ReportData | null
  loading: boolean
  error: string | null
}

const initialState: ReportsState = {
  salesReport: null,
  purchaseReport: null,
  profitLoss: null,
  loading: false,
  error: null,
}

export const fetchSalesReport = createAsyncThunk(
  "reports/fetchSalesReport",
  async (dateRange: { from: string; to: string }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return { totalSales: 50000, totalOrders: 125 }
  },
)

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesReport.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchSalesReport.fulfilled, (state, action) => {
        state.loading = false
        state.salesReport = action.payload
      })
  },
})

export default reportsSlice.reducer
