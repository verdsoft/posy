import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

// Define interfaces for Expense and ExpenseCategory
export interface ExpenseCategory {
  id: string
  name: string
  description?: string
  status?: string
}

export interface Expense {
  id: string
  date: string
  reference: string
  warehouse_id: string
  category_id: string
  amount: number
  description?: string
  status?: string
  category_name?: string // Joined from categories table
  warehouse_name?: string // Joined from warehouses table
}

export const expensesApi = createApi({
  reducerPath: "expensesApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  tagTypes: ["Expense", "ExpenseCategory"],
  endpoints: (builder) => ({
    // Expense Category Endpoints
    getExpenseCategories: builder.query<ExpenseCategory[], void>({
      query: () => "expenses-categories",
      providesTags: (result) =>
        result ? [...result.map(({ id }) => ({ type: "ExpenseCategory" as const, id })), { type: "ExpenseCategory", id: "LIST" }] : [{ type: "ExpenseCategory", id: "LIST" }],
    }),
    createExpenseCategory: builder.mutation<ExpenseCategory, Partial<ExpenseCategory>>({
      query: (body) => ({
        url: "expenses-categories",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "ExpenseCategory", id: "LIST" }],
    }),
    updateExpenseCategory: builder.mutation<ExpenseCategory, { id: string; body: Partial<ExpenseCategory> }>({
      query: ({ id, body }) => ({
        url: `expenses-categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "ExpenseCategory", id }],
    }),
    deleteExpenseCategory: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `expenses-categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "ExpenseCategory", id }],
    }),

    // Expense Endpoints
    getExpenses: builder.query<PaginatedExpensesResponse, { page: number; limit: number; search: string }>({
    query: ({ page, limit, search }) => `/expenses?page=${page}&limit=${limit}&search=${search}`,
    providesTags: (result) =>
        result
            ? [
                ...result.data.map(({ id }) => ({ type: 'Expense' as const, id })),
                { type: 'Expense', id: 'LIST' },
            ]
            : [{ type: 'Expense', id: 'LIST' }],
}),
    createExpense: builder.mutation<Expense, Partial<Expense>>({
      query: (body) => ({
        url: "expenses",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Expense", id: "LIST" }],
    }),
    updateExpense: builder.mutation<Expense, { id: string; body: Partial<Expense> }>({
      query: ({ id, body }) => ({
        url: `expenses/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Expense", id }],
    }),
    deleteExpense: builder.mutation<{ success: boolean; id: string }, string>({
      query: (id) => ({
        url: `expenses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Expense", id }],
    }),
  }),
})

export const {
  useGetExpenseCategoriesQuery,
  useCreateExpenseCategoryMutation,
  useUpdateExpenseCategoryMutation,
  useDeleteExpenseCategoryMutation,
  useGetExpensesQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expensesApi
