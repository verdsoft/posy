import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface PaginatedResponse<T> {
  data: T[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

export interface Company { id: string; name: string; [k: string]: any }
export interface Department { id: string; department: string; [k: string]: any }
export interface Holiday { id: string; name: string; start_date: string; finish_date: string; [k: string]: any }
export interface LeaveType { id: string; name: string; [k: string]: any }
export interface Shift { id: string; name: string; [k: string]: any }
export interface LeaveRequest { id: string; employee_name: string; leave_type: string; start_date: string; finish_date: string; [k:string]: any }

export const hrmCatalogApi = createApi({
  reducerPath: 'hrmCatalogApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v2/hrm' }),
  endpoints: (builder) => ({
    getCompanies: builder.query<PaginatedResponse<Company>, { page: number; limit: number; search?: string }>({
      query: ({ page, limit, search = '' }) => ({ url: 'companies', params: { page, limit, search } }),
    }),
    createCompany: builder.mutation<{ success: boolean }, Partial<Company>>({
      query: (body) => ({ url: 'companies', method: 'POST', body }),
    }),
    updateCompany: builder.mutation<{ success: boolean }, { id: string } & Partial<Company>>({
      query: ({ id, ...body }) => ({ url: 'companies', method: 'PUT', body: { id, ...body } }),
    }),
    deleteCompany: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `companies?id=${encodeURIComponent(id)}`, method: 'DELETE' }),
    }),
    getDepartments: builder.query<PaginatedResponse<Department>, { page: number; limit: number; search?: string }>({
      query: ({ page, limit, search = '' }) => ({ url: 'departments', params: { page, limit, search } }),
    }),
    createDepartment: builder.mutation<{ success: boolean }, Partial<Department>>({
      query: (body) => ({ url: 'departments', method: 'POST', body }),
    }),
    updateDepartment: builder.mutation<{ success: boolean }, { id: string } & Partial<Department>>({
      query: ({ id, ...body }) => ({ url: 'departments', method: 'PUT', body: { id, ...body } }),
    }),
    deleteDepartment: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `departments?id=${encodeURIComponent(id)}`, method: 'DELETE' }),
    }),
    getHolidays: builder.query<PaginatedResponse<Holiday>, { page: number; limit: number; search?: string }>({
      query: ({ page, limit, search = '' }) => ({ url: 'holidays', params: { page, limit, search } }),
    }),
    createHoliday: builder.mutation<{ success: boolean }, Partial<Holiday>>({
      query: (body) => ({ url: 'holidays', method: 'POST', body }),
    }),
    updateHoliday: builder.mutation<{ success: boolean }, { id: string } & Partial<Holiday>>({
      query: ({ id, ...body }) => ({ url: 'holidays', method: 'PUT', body: { id, ...body } }),
    }),
    deleteHoliday: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `holidays?id=${encodeURIComponent(id)}`, method: 'DELETE' }),
    }),
    getLeaveTypes: builder.query<PaginatedResponse<LeaveType>, { page: number; limit: number; search?: string }>({
      query: ({ page, limit, search = '' }) => ({ url: 'leave-types', params: { page, limit, search } }),
    }),
    createLeaveType: builder.mutation<{ success: boolean }, Partial<LeaveType>>({
      query: (body) => ({ url: 'leave-types', method: 'POST', body }),
    }),
    updateLeaveType: builder.mutation<{ success: boolean }, { id: string } & Partial<LeaveType>>({
      query: ({ id, ...body }) => ({ url: 'leave-types', method: 'PUT', body: { id, ...body } }),
    }),
    deleteLeaveType: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `leave-types?id=${encodeURIComponent(id)}`, method: 'DELETE' }),
    }),
    getShifts: builder.query<PaginatedResponse<Shift>, { page: number; limit: number; search?: string }>({
      query: ({ page, limit, search = '' }) => ({ url: 'shifts', params: { page, limit, search } }),
    }),
    createShift: builder.mutation<{ success: boolean }, Partial<Shift>>({
      query: (body) => ({ url: 'shifts', method: 'POST', body }),
    }),
    updateShift: builder.mutation<{ success: boolean }, { id: string } & Partial<Shift>>({
      query: ({ id, ...body }) => ({ url: 'shifts', method: 'PUT', body: { id, ...body } }),
    }),
    deleteShift: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `shifts?id=${encodeURIComponent(id)}`, method: 'DELETE' }),
    }),
    getLeaveRequests: builder.query<PaginatedResponse<LeaveRequest>, { page: number; limit: number; search?: string }>({
      query: ({ page, limit, search = '' }) => ({ url: 'leave-requests', params: { page, limit, search } }),
    }),
    createLeaveRequest: builder.mutation<{ success: boolean }, Partial<LeaveRequest>>({
      query: (body) => ({ url: 'leave-requests', method: 'POST', body }),
    }),
    updateLeaveRequest: builder.mutation<{ success: boolean }, { id: string } & Partial<LeaveRequest>>({
      query: ({ id, ...body }) => ({ url: 'leave-requests', method: 'PUT', body: { id, ...body } }),
    }),
    deleteLeaveRequest: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `leave-requests?id=${encodeURIComponent(id)}`, method: 'DELETE' }),
    }),
  }),
})

export const { useGetCompaniesQuery, useGetDepartmentsQuery, useGetHolidaysQuery, useGetLeaveTypesQuery, useGetShiftsQuery, useGetLeaveRequestsQuery, useCreateCompanyMutation, useUpdateCompanyMutation, useDeleteCompanyMutation, useCreateDepartmentMutation, useUpdateDepartmentMutation, useDeleteDepartmentMutation, useCreateHolidayMutation, useUpdateHolidayMutation, useDeleteHolidayMutation, useCreateLeaveTypeMutation, useUpdateLeaveTypeMutation, useDeleteLeaveTypeMutation, useCreateShiftMutation, useUpdateShiftMutation, useDeleteShiftMutation, useCreateLeaveRequestMutation, useUpdateLeaveRequestMutation, useDeleteLeaveRequestMutation } = hrmCatalogApi


