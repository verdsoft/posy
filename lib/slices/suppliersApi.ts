import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  country: string
  city: string
  address: string
}

export interface PaginatedSuppliersResponse {
    data: Supplier[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const suppliersApi = createApi({
  reducerPath: "suppliersApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/suppliers" }),
  tagTypes: ["Supplier"],
  endpoints: (builder) => ({
    getSuppliers: builder.query<PaginatedSuppliersResponse, { page: number; limit: number; search: string }>({
        query: ({ page, limit, search }) => `?page=${page}&limit=${limit}&search=${search}`,
        providesTags: (result) =>
            result
                ? [
                    ...result.data.map(({ id }) => ({ type: 'Supplier' as const, id })),
                    { type: 'Supplier', id: 'LIST' },
                ]
                : [{ type: 'Supplier', id: 'LIST' }],
    }),
    createSupplier: builder.mutation<Supplier, Partial<Supplier>>({
        query: (supplier) => ({
          url: ``,
          method: 'POST',
          body: supplier,
        }),
        invalidatesTags: ['Supplier'],
      }),
    updateSupplier: builder.mutation<Supplier, Partial<Supplier> & { id: string }>({
        query: ({ id, ...patch }) => ({
          url: ``,
          method: 'PUT',
          body: { id, ...patch },
        }),
        invalidatesTags: ['Supplier'],
      }),
      deleteSupplier: builder.mutation<{ success: boolean; id: string }, string>({
        query: (id) => ({
          url: `?id=${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: ['Supplier'],
      }),
  }),
})

export const { useGetSuppliersQuery, useCreateSupplierMutation, useUpdateSupplierMutation, useDeleteSupplierMutation } = suppliersApi
