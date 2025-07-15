import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
}

export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Login failed")
      return data
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ name, email, password }: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Signup failed")
      return data
    } catch (err: any) {
      return rejectWithValue(err.message)
    }
  }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.removeItem("token")
      
    },
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        // Store in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("token", action.payload.token)
          localStorage.setItem("username", action.payload.user.name)
          localStorage.setItem("email", action.payload.user.email)
          localStorage.setItem("UserRole", action.payload.user.role)
          localStorage.setItem("UserId", action.payload.user.id)
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Login failed"
      })
      .addCase(signupUser.pending, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        // Do NOT set isAuthenticated here!
        state.loading = false
        state.error = null
        // Optionally, you can clear user/token here
        state.user = null
        state.token = null
        state.isAuthenticated = false
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Signup failed"
      })
      .addCase(logout, (state) => {
        state.user = null
        state.token = null
        state.isAuthenticated = false
        if (typeof window !== "undefined") {
          localStorage.removeItem("username")
          localStorage.removeItem("email")
          localStorage.removeItem("token")
        }
      })
  },
})

export const { logout, clearError, setUser } = authSlice.actions
export default authSlice.reducer
