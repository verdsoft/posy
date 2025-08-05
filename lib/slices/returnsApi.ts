import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { PurchaseReturn, PaginatedPurchaseReturnsResponse, SalesReturn, PaginatedSalesReturnsResponse } from "@/lib/types";

export const returnsApi = createApi({
  reducerPath: "returnsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
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
    deleteSalesReturn: builder.mutation<void, string>({
      query: (id) => ({
        url: `sales-returns/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["SalesReturn"],
    }),

    // Purchase Return endpoints
    getPurchaseReturns: builder.query<PaginatedPurchaseReturnsResponse, { page: number; limit: number; search: string }>({
    query: ({ page, limit, search }) => `/purchases-return?page=${page}&limit=${limit}&search=${search}`,
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
        url: "purchases-return",
        method: "POST",
        body,
      }),
      invalidatesTags: ["PurchaseReturn"],
    }),
    deletePurchaseReturn: builder.mutation<void, string>({
      query: (id) => ({
        url: `purchases-return?id=${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [{ type: 'PurchaseReturn', id }],
    }),
  }),
})

export const {
  useGetSalesReturnsQuery,
  useCreateSalesReturnMutation,
  useDeleteSalesReturnMutation,
  useGetPurchaseReturnsQuery,
  useCreatePurchaseReturnMutation,
  useDeletePurchaseReturnMutation,
} = returnsApi
