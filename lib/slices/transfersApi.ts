import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface TransferItem {
  product_id: string
  quantity: number
  cost?: number
}

export interface Transfer {
  id: string
  reference: string
  from_warehouse_id: string
  to_warehouse_id: string
  date: string
  status: string
  notes?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export const transfersApi = createApi({
  reducerPath: 'transfersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v2' }),
  tagTypes: ['Transfers'],
  endpoints: (builder) => ({
    getTransfers: builder.query<PaginatedResponse<Transfer>, { page: number; limit: number; search?: string }>({
      query: ({ page, limit, search = '' }) => ({
        url: `transfers`,
        params: { page, limit, search },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((t) => ({ type: 'Transfers' as const, id: t.id })),
              { type: 'Transfers' as const, id: 'LIST' },
            ]
          : [{ type: 'Transfers' as const, id: 'LIST' }],
    }),
    createTransfer: builder.mutation<{ success: boolean; id: string; reference: string }, any>({
      query: (body) => ({ url: `transfers`, method: 'POST', body }),
      invalidatesTags: [{ type: 'Transfers', id: 'LIST' }],
    }),
    updateTransfer: builder.mutation<{ success: boolean }, { id: string } & Partial<Transfer>>({
      query: ({ id, ...body }) => ({ url: `transfers`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'Transfers', id: arg.id }, { type: 'Transfers', id: 'LIST' }],
    }),
    deleteTransfer: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `transfers?id=${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Transfers', id: 'LIST' }],
    }),
  }),
})

export const { useGetTransfersQuery, useCreateTransferMutation, useUpdateTransferMutation, useDeleteTransferMutation } = transfersApi


