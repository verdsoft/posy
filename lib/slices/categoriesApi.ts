import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../api-url'

export interface Category {
  id: number
  code: string
  name: string
  created_at?: string
  updated_at?: string
}

export interface CreateCategoryInput {
  code: string
  name: string
}

export interface UpdateCategoryInput {
  id: number
  code: string
  name: string
}

export const categoriesApi = createApi({
  reducerPath: 'categoriesApi',
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v2/settings/categories" }),
  tagTypes: ['Category'],
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '',
      transformResponse: (response: Category[] | { data?: Category[] }) => {
        // Handle both array and object with data property
        if (Array.isArray(response)) {
          return response
        }
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          return response.data
        }
        return []
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Category' as const, id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    createCategory: builder.mutation<Category, CreateCategoryInput>({
      query: (categoryData) => ({
        url: '',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            categoriesApi.util.updateQueryData('getCategories', undefined, (draft) => {
              draft.push(data)
            })
          )
        } catch {}
      },
    }),
    updateCategory: builder.mutation<Category, UpdateCategoryInput>({
      query: ({ id, ...categoryData }) => ({
        url: '',
        method: 'PUT',
        body: { id, ...categoryData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            categoriesApi.util.updateQueryData('getCategories', undefined, (draft) => {
              const index = draft.findIndex((cat) => cat.id === id)
              if (index !== -1) {
                draft[index] = data
              }
            })
          )
        } catch {}
      },
    }),
    deleteCategory: builder.mutation<void, number>({
      query: (id) => ({
        url: '',
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Category', id },
        { type: 'Category', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          categoriesApi.util.updateQueryData('getCategories', undefined, (draft) => {
            const index = draft.findIndex((cat) => cat.id === id)
            if (index !== -1) {
              draft.splice(index, 1)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
})

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = categoriesApi