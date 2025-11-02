import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { PurchaseReturn, PaginatedPurchaseReturnsResponse, SalesReturn, PaginatedSalesReturnsResponse } from "@/lib/types";

export const returnsApi = createApi({
  reducerPath: "returnsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v2" }),
  tagTypes: ["SalesReturn", "PurchaseReturn"],
  endpoints: (builder) => ({
    // Sales Return endpoints
    getSalesReturns: builder.query<PaginatedSalesReturnsResponse, { page: number; limit: number; search: string }>({
    query: ({ page, limit, search }) => `/sales-returns?page=${page}&limit=${limit}&search=${search}`,
    providesTags: (result) =>
        result
            ? [
                ...result.data.map(({ id }) => ({ type: 'SalesReturn' as const, id })),
                { type: 'SalesReturn', id: 'LIST' },
            ]
            : [{ type: 'SalesReturn', id: 'LIST' }],
}),
    createSalesReturn: builder.mutation<SalesReturn, Partial<SalesReturn>>({
      query: (body) => ({
        url: "sales-returns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["SalesReturn"],
    }),
    updateSalesReturn: builder.mutation<SalesReturn, Partial<SalesReturn>>({
      query: (body) => ({
        url: `sales-returns?id=${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'SalesReturn', id }, { type: 'SalesReturn', id: 'LIST' }],
    }),
    deleteSalesReturn: builder.mutation<void, string>({
      query: (id) => ({
        url: `sales-returns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesReturn"],
    }),

    // Purchase Return endpoints
    getPurchaseReturns: builder.query<PaginatedPurchaseReturnsResponse, { page: number; limit: number; search: string }>({
    query: ({ page, limit, search }) => `/purchases-returns?page=${page}&limit=${limit}&search=${search}`,
    providesTags: (result) =>
        result
            ? [
                ...result.data.map(({ id }) => ({ type: 'PurchaseReturn' as const, id })),
                { type: 'PurchaseReturn', id: 'LIST' },
            ]
            : [{ type: 'PurchaseReturn', id: 'LIST' }],
}),
    createPurchaseReturn: builder.mutation<PurchaseReturn, Partial<PurchaseReturn>>({
      query: (body) => ({
        url: "purchases-returns",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseReturn"],
    }),
    updatePurchaseReturn: builder.mutation<PurchaseReturn, Partial<PurchaseReturn>>({
      query: (body) => ({
        url: `purchases-returns?id=${body.id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'PurchaseReturn', id }, { type: 'PurchaseReturn', id: 'LIST' }],
    }),
    deletePurchaseReturn: builder.mutation<void, string>({
      query: (id) => ({
        url: `purchases-returns?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: 'PurchaseReturn', id }],
    }),
  }),
})

export const {
  useGetSalesReturnsQuery,
  useCreateSalesReturnMutation,
  useUpdateSalesReturnMutation,
  useDeleteSalesReturnMutation,
  useGetPurchaseReturnsQuery,
  useCreatePurchaseReturnMutation,
  useUpdatePurchaseReturnMutation,
  useDeletePurchaseReturnMutation,
} = returnsApi
