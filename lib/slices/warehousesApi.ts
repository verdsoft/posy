import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../api-url'

export interface Warehouse {
  id: number
  name: string
  phone: string
  country: string
  city: string
  email: string
  zip_code?: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface CreateWarehouseInput {
  name: string
  phone: string
  country: string
  city: string
  email: string
  zip_code?: string
}

export interface UpdateWarehouseInput {
  id: number
  name: string
  phone: string
  country: string
  city: string
  email: string
  zip_code?: string
}

export const warehousesApi = createApi({
  reducerPath: 'warehousesApi',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}/settings/warehouses` }),
  tagTypes: ['Warehouse'],
  endpoints: (builder) => ({
    getWarehouses: builder.query<Warehouse[], void>({
      query: () => '',
      transformResponse: (response: Warehouse[] | { data?: Warehouse[] }) => {
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
              ...result.map(({ id }) => ({ type: 'Warehouse' as const, id })),
              { type: 'Warehouse', id: 'LIST' },
            ]
          : [{ type: 'Warehouse', id: 'LIST' }],
    }),
    createWarehouse: builder.mutation<Warehouse, CreateWarehouseInput>({
      query: (warehouseData) => ({
        url: '',
        method: 'POST',
        body: warehouseData,
      }),
      invalidatesTags: [{ type: 'Warehouse', id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            warehousesApi.util.updateQueryData('getWarehouses', undefined, (draft) => {
              draft.push(data)
            })
          )
        } catch {}
      },
    }),
    updateWarehouse: builder.mutation<Warehouse, UpdateWarehouseInput>({
      query: ({ id, ...warehouseData }) => ({
        url: '',
        method: 'PUT',
        body: { id, ...warehouseData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Warehouse', id },
        { type: 'Warehouse', id: 'LIST' },
      ],
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            warehousesApi.util.updateQueryData('getWarehouses', undefined, (draft) => {
              const index = draft.findIndex((warehouse) => warehouse.id === id)
              if (index !== -1) {
                draft[index] = data
              }
            })
          )
        } catch {}
      },
    }),
    deleteWarehouse: builder.mutation<void, number>({
      query: (id) => ({
        url: '',
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Warehouse', id },
        { type: 'Warehouse', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          warehousesApi.util.updateQueryData('getWarehouses', undefined, (draft) => {
            const index = draft.findIndex((warehouse) => warehouse.id === id)
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
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
} = warehousesApi
