import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Employee {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  [key: string]: any
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export const hrmApi = createApi({
  reducerPath: 'hrmApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v2' }),
  tagTypes: ['Employees'],
  endpoints: (builder) => ({
    getEmployees: builder.query<PaginatedResponse<Employee>, { page: number; limit: number; search?: string }>({
      query: ({ page, limit, search = '' }) => ({
        url: `hrm/employees`,
        params: { page, limit, search },
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((e) => ({ type: 'Employees' as const, id: e.id })),
              { type: 'Employees' as const, id: 'LIST' },
            ]
          : [{ type: 'Employees' as const, id: 'LIST' }],
    }),
    createEmployee: builder.mutation<{ success: boolean }, Partial<Employee>>({
      query: (body) => ({ url: `hrm/employees`, method: 'POST', body }),
      invalidatesTags: [{ type: 'Employees', id: 'LIST' }],
    }),
    updateEmployee: builder.mutation<{ success: boolean }, { id: string } & Partial<Employee>>({
      query: ({ id, ...body }) => ({ url: `hrm/employees`, method: 'PUT', body: { id, ...body } }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'Employees', id: arg.id }, { type: 'Employees', id: 'LIST' }],
    }),
    deleteEmployee: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `hrm/employees?id=${encodeURIComponent(id)}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Employees', id: 'LIST' }],
    }),
  }),
})

export const { useGetEmployeesQuery, useCreateEmployeeMutation, useUpdateEmployeeMutation, useDeleteEmployeeMutation } = hrmApi


