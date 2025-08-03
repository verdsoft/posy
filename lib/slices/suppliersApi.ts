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

export const suppliersApi = createApi({
  reducerPath: "suppliersApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/suppliers" }),
  tagTypes: ["Supplier"],
  endpoints: (builder) => ({
    getSuppliers: builder.query<Supplier[], void>({
      query: () => "",
      providesTags: ["Supplier"],
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

export const { useGetSuppliersQuery, useUpdateSupplierMutation, useDeleteSupplierMutation } = suppliersApi
