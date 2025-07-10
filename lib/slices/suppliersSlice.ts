import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  taxNumber?: string
  totalPurchases: number
  totalPaid: number
  totalDue: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface SuppliersState {
  suppliers: Supplier[]
  loading: boolean
  error: string | null
}

const initialState: SuppliersState = {
  suppliers: [],
  loading: false,
  error: null,
}

export const fetchSuppliers = createAsyncThunk("suppliers/fetchSuppliers", async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const mockSuppliers: Supplier[] = [
    {
      id: "1",
      name: "Tech Supplies Inc",
      email: "contact@techsupplies.com",
      phone: "+1234567890",
      address: "456 Business Ave",
      city: "Los Angeles",
      country: "USA",
      totalPurchases: 25000,
      totalPaid: 20000,
      totalDue: 5000,
      status: "active",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ]

  return mockSuppliers
})

const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuppliers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSuppliers.fulfilled, (state, action) => {
        state.loading = false
        state.suppliers = action.payload
      })
      .addCase(fetchSuppliers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch suppliers"
      })
  },
})

export const { clearError } = suppliersSlice.actions
export default suppliersSlice.reducer
