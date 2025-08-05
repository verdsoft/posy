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

export interface PaginatedCustomersResponse {
    data: Customer[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Customer'],
  endpoints: (builder) => ({
    getCustomers: builder.query<PaginatedCustomersResponse, { page: number; limit: number; search: string }>({
        query: ({ page, limit, search }) => `/customers?page=${page}&limit=${limit}&search=${search}`,
        providesTags: (result) =>
            result
                ? [
                    ...result.data.map(({ id }) => ({ type: 'Customer' as const, id })),
                    { type: 'Customer', id: 'LIST' },
                ]
                : [{ type: 'Customer', id: 'LIST' }],
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