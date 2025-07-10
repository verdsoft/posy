import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"

interface Transfer {
  id: string
  reference: string
  fromWarehouse: string
  toWarehouse: string
  date: string
  items: number
  total: number
  status: "pending" | "completed" | "cancelled"
  createdAt: string
}

interface TransfersState {
  transfers: Transfer[]
  loading: boolean
  error: string | null
}

const initialState: TransfersState = {
  transfers: [],
  loading: false,
  error: null,
}

export const fetchTransfers = createAsyncThunk("transfers/fetchTransfers", async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const mockTransfers: Transfer[] = [
    {
      id: "1",
      reference: "TR_1111",
      fromWarehouse: "Karigamombe",
      toWarehouse: "Default Warehouse",
      date: "2022-06-09",
      items: 1,
      total: 16.0,
      status: "completed",
      createdAt: "2022-06-09",
    },
  ]

  return mockTransfers
})

const transfersSlice = createSlice({
  name: "transfers",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransfers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTransfers.fulfilled, (state, action) => {
        state.loading = false
        state.transfers = action.payload
      })
  },
})

export default transfersSlice.reducer
