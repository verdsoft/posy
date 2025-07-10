import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface SaleItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  tax: number
  subtotal: number
}

interface Sale {
  id: string
  reference: string
  customerId: string
  customerName: string
  date: string
  items: SaleItem[]
  subtotal: number
  tax: number
  discount: number
  shipping: number
  total: number
  paid: number
  due: number
  status: "pending" | "completed" | "cancelled"
  paymentStatus: "unpaid" | "partial" | "paid"
  notes?: string
  createdAt: string
  updatedAt: string
}

interface SalesState {
  sales: Sale[]
  loading: boolean
  error: string | null
}

const initialState: SalesState = {
  sales: [],
  loading: false,
  error: null,
}

export const fetchSales = createAsyncThunk("sales/fetchSales", async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const mockSales: Sale[] = [
    {
      id: "1",
      reference: "SL-001",
      customerId: "1",
      customerName: "John Doe",
      date: "2024-01-15",
      items: [
        {
          productId: "1",
          productName: "Laptop Dell Inspiron",
          quantity: 1,
          unitPrice: 1200,
          discount: 0,
          tax: 120,
          subtotal: 1320,
        },
      ],
      subtotal: 1200,
      tax: 120,
      discount: 0,
      shipping: 0,
      total: 1320,
      paid: 1320,
      due: 0,
      status: "completed",
      paymentStatus: "paid",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
    },
  ]

  return mockSales
})

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSales.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSales.fulfilled, (state, action) => {
        state.loading = false
        state.sales = action.payload
      })
      .addCase(fetchSales.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch sales"
      })
  },
})

export const { clearError } = salesSlice.actions
export default salesSlice.reducer
