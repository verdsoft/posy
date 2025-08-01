import { createSlice, type PayloadAction } from "@reduxjs/toolkit"

interface Settings {
  companyName: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  currency: string
  taxRate: number
  theme: "light" | "dark"
  language: string
}

interface SettingsState {
  settings: Settings
  loading: boolean
  error: string | null
}

const initialState: SettingsState = {
  settings: {
    companyName: "  BMS",
    companyEmail: "info@.com",
    companyPhone: "+1234567890",
    companyAddress: "123 Business Street",
    currency: "USD",
    taxRate: 10,
    theme: "light",
    language: "en",
  },
  loading: false,
  error: null,
}

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<Settings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
  },
})

export const { updateSettings } = settingsSlice.actions
export default settingsSlice.reducer
