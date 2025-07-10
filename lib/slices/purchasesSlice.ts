import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface Purchase {
  id: string
  reference: string
  supplierId: string
  supplierName: string
  date: string
  total: number
  paid: number
  due: number
  status: "pending" | "received" | "cancelled"
  createdAt: string
}

interface PurchasesState {
  purchases: Purchase[]
  loading: boolean
  error: string | null
}

const initialState: PurchasesState = {
  purchases: [],
  loading: false,
  error: null,
}

export const fetchPurchases = createAsyncThunk("purchases/fetchPurchases", async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return []
})

const purchasesSlice = createSlice({
  name: "purchases",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchases.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchPurchases.fulfilled, (state, action) => {
        state.loading = false
        state.purchases = action.payload
      })
  },
})

export default purchasesSlice.reducer
