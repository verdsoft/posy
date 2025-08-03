import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  total_sales?: number
  total_paid?: number
  total_due?: number
}

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], void>({
      query: () => 'customers',
      providesTags: ['Customer'],
    }),
    getCustomerById: builder.query<Customer, string>({
      query: (id) => `customers?id=${id}`,
      providesTags: (result, error, id) => [{ type: 'Customer', id }],
    }),
    createCustomer: builder.mutation<Customer, Partial<Customer>>({
      query: (customer) => ({
        url: 'customers',
        method: 'POST',
        body: customer,
      }),
      invalidatesTags: ['Customer'],
    }),
    updateCustomer: builder.mutation<Customer, { id: string; data: Partial<Customer> }>({
      query: ({ id, data }) => ({
        url: 'customers',
        method: 'PUT',
        body: { id, ...data },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Customer', id }],
    }),
    deleteCustomer: builder.mutation<void, string>({
      query: (id) => ({
        url: `customers?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Customer'],
    }),
  }),
})

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customersApi 