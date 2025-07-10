import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import mysql from "mysql2/promise"
import { createClient } from "@supabase/supabase-js"

interface DatabaseConfig {
  type: "mysql" | "supabase"
  host?: string
  port?: number
  database?: string
  username?: string
  password?: string
  supabaseUrl?: string
  supabaseKey?: string
}

interface DatabaseState {
  isConfigured: boolean
  config: DatabaseConfig | null
  loading: boolean
  error: string | null
  connectionStatus: "disconnected" | "connecting" | "connected" | "error"
}

const initialState: DatabaseState = {
  isConfigured: false,
  config: null,
  loading: false,
  error: null,
  connectionStatus: "disconnected",
}

// ...existing code...
export const testConnection = createAsyncThunk("database/testConnection", async (config: DatabaseConfig) => {
  if (config.type === "mysql") {
    const response = await fetch("/api/test-mysql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
      }),
    })
    const data = await response.json()
    if (!data.success) throw new Error(data.error || "MySQL connection failed")
  } else if (config.type === "supabase") {
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error("Missing required Supabase configuration")
    }
    // Supabase JS client can be used in the browser
    const supabase = createClient(config.supabaseUrl, config.supabaseKey)
    const { error } = await supabase.auth.getUser()
    if (error) throw new Error("Supabase connection failed: " + error.message)
  } else {
    throw new Error("Unknown database type")
  }
  return config
})
// ...existing code...

export const setupDatabase = createAsyncThunk("database/setup", async (config: DatabaseConfig) => {
  // Simulate database setup
  await new Promise((resolve) => setTimeout(resolve, 3000))

  // Store configuration
  localStorage.setItem("dbConfig", JSON.stringify(config))

  return config
})

const databaseSlice = createSlice({
  name: "database",
  initialState,
  reducers: {
    setDatabaseConfig: (state, action: PayloadAction<DatabaseConfig>) => {
      state.config = action.payload
      state.isConfigured = true
      state.connectionStatus = "connected"
    },
    clearError: (state) => {
      state.error = null
    },
    resetDatabase: (state) => {
      state.isConfigured = false
      state.config = null
      state.connectionStatus = "disconnected"
      localStorage.removeItem("dbConfig")
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(testConnection.pending, (state) => {
        state.loading = true
        state.error = null
        state.connectionStatus = "connecting"
      })
      .addCase(testConnection.fulfilled, (state, action) => {
        state.loading = false
        state.connectionStatus = "connected"
      })
      .addCase(testConnection.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Connection failed"
        state.connectionStatus = "error"
      })
      .addCase(setupDatabase.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(setupDatabase.fulfilled, (state, action) => {
        state.loading = false
        state.config = action.payload
        state.isConfigured = true
        state.connectionStatus = "connected"
      })
      .addCase(setupDatabase.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Database setup failed"
      })
  },
})

export const { setDatabaseConfig, clearError, resetDatabase } = databaseSlice.actions
export default databaseSlice.reducer
