import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: string
  position: string
  salary: number
  hireDate: string
  status: "active" | "inactive"
}

interface HRMState {
  employees: Employee[]
  departments: string[]
  loading: boolean
  error: string | null
}

const initialState: HRMState = {
  employees: [],
  departments: [],
  loading: false,
  error: null,
}

export const fetchEmployees = createAsyncThunk("hrm/fetchEmployees", async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  return []
})

const hrmSlice = createSlice({
  name: "hrm",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false
        state.employees = action.payload
      })
  },
})

export default hrmSlice.reducer
