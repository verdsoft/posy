import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"

interface Product {
  id: string
  name: string
  code: string
  category: string
  brand: string
  unit: string
  cost: number
  price: number
  stock: number
  alertQuantity: number
  description?: string
  image?: string
  barcode?: string
  warehouse: string
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
}

interface ProductsState {
  products: Product[]
  loading: boolean
  error: string | null
  currentProduct: Product | null
  filters: {
    category: string
    brand: string
    warehouse: string
    status: string
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
}

const initialState: ProductsState = {
  products: [],
  loading: false,
  error: null,
  currentProduct: null,
  filters: {
    category: "",
    brand: "",
    warehouse: "",
    status: "",
  },
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
  },
}

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ page = 1, limit = 10, filters = {} }: { page?: number; limit?: number; filters?: any }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Laptop Dell Inspiron",
        code: "DELL001",
        category: "Electronics",
        brand: "Dell",
        unit: "Piece",
        cost: 800,
        price: 1200,
        stock: 15,
        alertQuantity: 5,
        warehouse: "Main Warehouse",
        status: "active",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
      {
        id: "2",
        name: "Office Chair",
        code: "CHAIR001",
        category: "Furniture",
        brand: "Generic",
        unit: "Piece",
        cost: 150,
        price: 250,
        stock: 8,
        alertQuantity: 3,
        warehouse: "Main Warehouse",
        status: "active",
        createdAt: "2024-01-01",
        updatedAt: "2024-01-01",
      },
    ]

    return {
      products: mockProducts,
      total: mockProducts.length,
    }
  },
)

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return newProduct
  },
)

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, data }: { id: string; data: Partial<Product> }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return { id, data: { ...data, updatedAt: new Date().toISOString() } }
  },
)

export const deleteProduct = createAsyncThunk("products/deleteProduct", async (id: string) => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  return id
})

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setCurrentProduct: (state, action: PayloadAction<Product | null>) => {
      state.currentProduct = action.payload
    },
    setFilters: (state, action: PayloadAction<Partial<typeof initialState.filters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    setPagination: (state, action: PayloadAction<Partial<typeof initialState.pagination>>) => {
      state.pagination = { ...state.pagination, ...action.payload }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false
        state.products = action.payload.products
        state.pagination.total = action.payload.total
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch products"
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false
        state.products.unshift(action.payload)
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to create product"
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id)
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...action.payload.data }
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload)
      })
  },
})

export const { setCurrentProduct, setFilters, setPagination, clearError } = productsSlice.actions
export default productsSlice.reducer
