import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../api-url'

export interface Brand {
  id: number
  name: string
  description: string
  image?: string | null
  created_at?: string
  updated_at?: string
}

export interface CreateBrandInput {
  name: string
  description: string
}

export interface UpdateBrandInput {
  id: number
  name: string
  description: string
}

export const brandsApi = createApi({
  reducerPath: 'brandsApi',
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v2/settings/brands" }),
  tagTypes: ['Brand'],
  endpoints: (builder) => ({
    getBrands: builder.query<Brand[], void>({
      query: () => '',
      transformResponse: (response: Brand[] | { data?: Brand[] }) => {
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
              ...result.map(({ id }) => ({ type: 'Brand' as const, id })),
              { type: 'Brand', id: 'LIST' },
            ]
          : [{ type: 'Brand', id: 'LIST' }],
    }),
    createBrand: builder.mutation<Brand, CreateBrandInput>({
      query: (brandData) => ({
        url: '',
        method: 'POST',
        body: brandData,
      }),
      invalidatesTags: [{ type: 'Brand', id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            brandsApi.util.updateQueryData('getBrands', undefined, (draft) => {
              draft.push(data)
            })
          )
        } catch {}
      },
    }),
    updateBrand: builder.mutation<Brand, UpdateBrandInput>({
      query: ({ id, ...brandData }) => ({
        url: '',
        method: 'PUT',
        body: { id, ...brandData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Brand', id },
        { type: 'Brand', id: 'LIST' },
      ],
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            brandsApi.util.updateQueryData('getBrands', undefined, (draft) => {
              const index = draft.findIndex((brand) => brand.id === id)
              if (index !== -1) {
                draft[index] = data
              }
            })
          )
        } catch {}
      },
    }),
    deleteBrand: builder.mutation<void, number>({
      query: (id) => ({
        url: '',
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Brand', id },
        { type: 'Brand', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          brandsApi.util.updateQueryData('getBrands', undefined, (draft) => {
            const index = draft.findIndex((brand) => brand.id === id)
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
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
} = brandsApi
