import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface Expense {
  id: string
  reference: string
  category: string
  amount: number
  date: string
  description: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

interface ExpensesState {
  expenses: Expense[]
  loading: boolean
  error: string | null
}

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
}

export const fetchExpenses = createAsyncThunk("expenses/fetchExpenses", async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return []
})

const expensesSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false
        state.expenses = action.payload
      })
  },
})

export default expensesSlice.reducer
