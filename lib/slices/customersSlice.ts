import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  taxNumber?: string
  creditLimit: number
  totalSales: number
  totalPaid: number
  totalDue: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface CustomersState {
  customers: Customer[]
  loading: boolean
  error: string | null
  currentCustomer: Customer | null
  pagination: {
    page: number
    limit: number
    total: number
  }
}

const initialState: CustomersState = {
  customers: [],
  loading: false,
  error: null,
  currentCustomer: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
}

export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockCustomers: Customer[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        address: "123 Main St",
        city: "New York",
        country: "USA",
        creditLimit: 5000,
        totalSales: 12500,
        totalPaid: 10000,
        totalDue: 2500,
        status: "active",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ]

    return { customers: mockCustomers, total: mockCustomers.length }
  },
)

export const createCustomer = createAsyncThunk(
  "customers/createCustomer",
  async (customerData: Omit<Customer, "id" | "createdAt" | "updatedAt" | "totalSales" | "totalPaid" | "totalDue">) => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      totalSales: 0,
      totalPaid: 0,
      totalDue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return newCustomer
  },
)

const customersSlice = createSlice({
  name: "customers",
  initialState,
  reducers: {
    setCurrentCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.currentCustomer = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.customers = action.payload.customers
        state.pagination.total = action.payload.total
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch customers"
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload)
      })
  },
})

export const { setCurrentCustomer, clearError } = customersSlice.actions
export default customersSlice.reducer
