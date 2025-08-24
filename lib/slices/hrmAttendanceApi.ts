import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface PaginatedResponse<T> {
  data: T[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export interface Attendance { id: string; employee_name?: string; date: string; time_in?: string; time_out?: string; [k:string]: any }

export const hrmAttendanceApi = createApi({
  reducerPath: 'hrmAttendanceApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v2/hrm' }),
  endpoints: (builder) => ({
    getAttendance: builder.query<PaginatedResponse<Attendance>, { page: number; limit: number; search?: string }>({
      query: ({ page, limit, search = '' }) => ({ url: 'attendance', params: { page, limit, search } }),
    }),
  }),
})

export const { useGetAttendanceQuery } = hrmAttendanceApi


