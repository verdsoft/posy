import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../api-url'

// Types
export interface Company {
  id: number
  name: string
  email?: string
  phone?: string
  address?: string
  city?: string
  country?: string
  tax_number?: string
  logo?: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export interface Department {
  id: number
  name: string
  company_id: number
  description?: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
  companies?: { id: number; name: string }
}

export interface Employee {
  id: number
  employee_id: number
  name: string
  email?: string
  phone?: string
  department_id: number
  shift_id: number
  position?: string
  salary?: number
  hire_date?: string
  address?: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
  departments?: { id: number; name: string }
  office_shifts?: { id: number; name: string }
  companies?: { id: number; name: string }
}

export interface Shift {
  id: number
  name: string
  start_time: string
  end_time: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export interface Holiday {
  id: number
  name: string
  start_date: string
  end_date: string
  description?: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export interface LeaveType {
  id: number
  name: string
  days_allowed?: number
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

export interface Attendance {
  id: number
  employee_id: number
  date: string
  time_in?: string
  time_out?: string
  hours_worked?: number
  status: 'present' | 'absent' | 'late'
  created_at?: string
  updated_at?: string
  employees?: { id: number; name: string; employee_id: number }
}

export interface LeaveRequest {
  id: number
  employee_id: number
  leave_type_id: number
  start_date: string
  end_date: string
  reason?: string
  status: 'pending' | 'approved' | 'rejected'
  created_at?: string
  updated_at?: string
  employees?: { id: number; name: string; employee_id: number }
  leave_types?: { id: number; name: string }
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
}

export const hrmV2Api = createApi({
  reducerPath: 'hrmV2Api',
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v2/hrm" }),
  tagTypes: ['Company', 'Department', 'Employee', 'Shift', 'Holiday', 'LeaveType', 'Attendance', 'LeaveRequest'],
  endpoints: (builder) => ({
    // Companies
    getCompanies: builder.query<PaginatedResponse<Company>, QueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.search) searchParams.append('search', params.search)
        return `/companies?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'Company' as const, id })),
            { type: 'Company', id: 'LIST' },
          ]
          : [{ type: 'Company', id: 'LIST' }],
    }),
    createCompany: builder.mutation<{ success: boolean; data: Company }, Omit<Company, 'id'>>({
      query: (companyData) => ({
        url: '/companies',
        method: 'POST',
        body: companyData,
      }),
      invalidatesTags: [{ type: 'Company', id: 'LIST' }],
    }),
    updateCompany: builder.mutation<{ success: boolean; data: Company }, Company>({
      query: ({ id, ...companyData }) => ({
        url: '/companies',
        method: 'PUT',
        body: { id, ...companyData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Company', id },
        { type: 'Company', id: 'LIST' },
      ],
    }),
    deleteCompany: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/companies?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Company', id },
        { type: 'Company', id: 'LIST' },
      ],
    }),

    // Departments
    getDepartments: builder.query<PaginatedResponse<Department>, QueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.search) searchParams.append('search', params.search)
        return `/departments?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'Department' as const, id })),
            { type: 'Department', id: 'LIST' },
          ]
          : [{ type: 'Department', id: 'LIST' }],
    }),
    createDepartment: builder.mutation<{ success: boolean; data: Department }, Omit<Department, 'id'>>({
      query: (departmentData) => ({
        url: '/departments',
        method: 'POST',
        body: departmentData,
      }),
      invalidatesTags: [{ type: 'Department', id: 'LIST' }],
    }),
    updateDepartment: builder.mutation<{ success: boolean; data: Department }, Department>({
      query: ({ id, ...departmentData }) => ({
        url: '/departments',
        method: 'PUT',
        body: { id, ...departmentData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Department', id },
        { type: 'Department', id: 'LIST' },
      ],
    }),
    deleteDepartment: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/departments?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Department', id },
        { type: 'Department', id: 'LIST' },
      ],
    }),

    // Employees
    getEmployees: builder.query<PaginatedResponse<Employee>, QueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.search) searchParams.append('search', params.search)
        return `/employees?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'Employee' as const, id })),
            { type: 'Employee', id: 'LIST' },
          ]
          : [{ type: 'Employee', id: 'LIST' }],
    }),
    createEmployee: builder.mutation<{ success: boolean; data: Employee }, Omit<Employee, 'id'>>({
      query: (employeeData) => ({
        url: '/employees',
        method: 'POST',
        body: employeeData,
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),
    updateEmployee: builder.mutation<{ success: boolean; data: Employee }, Employee>({
      query: ({ id, ...employeeData }) => ({
        url: '/employees',
        method: 'PUT',
        body: { id, ...employeeData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' },
      ],
    }),
    deleteEmployee: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/employees?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' },
      ],
    }),

    // Shifts
    getShifts: builder.query<PaginatedResponse<Shift>, QueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.search) searchParams.append('search', params.search)
        return `/shifts?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'Shift' as const, id })),
            { type: 'Shift', id: 'LIST' },
          ]
          : [{ type: 'Shift', id: 'LIST' }],
    }),
    createShift: builder.mutation<{ success: boolean; data: Shift }, Omit<Shift, 'id'>>({
      query: (shiftData) => ({
        url: '/shifts',
        method: 'POST',
        body: shiftData,
      }),
      invalidatesTags: [{ type: 'Shift', id: 'LIST' }],
    }),
    updateShift: builder.mutation<{ success: boolean; data: Shift }, Shift>({
      query: ({ id, ...shiftData }) => ({
        url: '/shifts',
        method: 'PUT',
        body: { id, ...shiftData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Shift', id },
        { type: 'Shift', id: 'LIST' },
      ],
    }),
    deleteShift: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/shifts?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Shift', id },
        { type: 'Shift', id: 'LIST' },
      ],
    }),

    // Holidays
    getHolidays: builder.query<PaginatedResponse<Holiday>, QueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.search) searchParams.append('search', params.search)
        return `/holidays?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'Holiday' as const, id })),
            { type: 'Holiday', id: 'LIST' },
          ]
          : [{ type: 'Holiday', id: 'LIST' }],
    }),
    createHoliday: builder.mutation<{ success: boolean; data: Holiday }, Omit<Holiday, 'id'>>({
      query: (holidayData) => ({
        url: '/holidays',
        method: 'POST',
        body: holidayData,
      }),
      invalidatesTags: [{ type: 'Holiday', id: 'LIST' }],
    }),
    updateHoliday: builder.mutation<{ success: boolean; data: Holiday }, Holiday>({
      query: ({ id, ...holidayData }) => ({
        url: '/holidays',
        method: 'PUT',
        body: { id, ...holidayData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Holiday', id },
        { type: 'Holiday', id: 'LIST' },
      ],
    }),
    deleteHoliday: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/holidays?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Holiday', id },
        { type: 'Holiday', id: 'LIST' },
      ],
    }),

    // Leave Types
    getLeaveTypes: builder.query<PaginatedResponse<LeaveType>, QueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.search) searchParams.append('search', params.search)
        return `/leave-types?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'LeaveType' as const, id })),
            { type: 'LeaveType', id: 'LIST' },
          ]
          : [{ type: 'LeaveType', id: 'LIST' }],
    }),
    createLeaveType: builder.mutation<{ success: boolean; data: LeaveType }, Omit<LeaveType, 'id'>>({
      query: (leaveTypeData) => ({
        url: '/leave-types',
        method: 'POST',
        body: leaveTypeData,
      }),
      invalidatesTags: [{ type: 'LeaveType', id: 'LIST' }],
    }),
    updateLeaveType: builder.mutation<{ success: boolean; data: LeaveType }, LeaveType>({
      query: ({ id, ...leaveTypeData }) => ({
        url: '/leave-types',
        method: 'PUT',
        body: { id, ...leaveTypeData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'LeaveType', id },
        { type: 'LeaveType', id: 'LIST' },
      ],
    }),
    deleteLeaveType: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/leave-types?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'LeaveType', id },
        { type: 'LeaveType', id: 'LIST' },
      ],
    }),

    // Attendance
    getAttendance: builder.query<PaginatedResponse<Attendance>, QueryParams & { employee_id?: number; date?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.employee_id) searchParams.append('employee_id', params.employee_id.toString())
        if (params.date) searchParams.append('date', params.date)
        return `/attendance?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'Attendance' as const, id })),
            { type: 'Attendance', id: 'LIST' },
          ]
          : [{ type: 'Attendance', id: 'LIST' }],
    }),
    createAttendance: builder.mutation<{ success: boolean; data: Attendance }, Omit<Attendance, 'id'>>({
      query: (attendanceData) => ({
        url: '/attendance',
        method: 'POST',
        body: attendanceData,
      }),
      invalidatesTags: [{ type: 'Attendance', id: 'LIST' }],
    }),
    updateAttendance: builder.mutation<{ success: boolean; data: Attendance }, Attendance>({
      query: ({ id, ...attendanceData }) => ({
        url: '/attendance',
        method: 'PUT',
        body: { id, ...attendanceData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Attendance', id },
        { type: 'Attendance', id: 'LIST' },
      ],
    }),
    deleteAttendance: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/attendance?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Attendance', id },
        { type: 'Attendance', id: 'LIST' },
      ],
    }),

    // Leave Requests
    getLeaveRequests: builder.query<PaginatedResponse<LeaveRequest>, QueryParams & { employee_id?: number; status?: string }>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.employee_id) searchParams.append('employee_id', params.employee_id.toString())
        if (params.status) searchParams.append('status', params.status)
        return `/leave-requests?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
            ...result.data.map(({ id }) => ({ type: 'LeaveRequest' as const, id })),
            { type: 'LeaveRequest', id: 'LIST' },
          ]
          : [{ type: 'LeaveRequest', id: 'LIST' }],
    }),
    createLeaveRequest: builder.mutation<{ success: boolean; data: LeaveRequest }, Omit<LeaveRequest, 'id'>>({
      query: (leaveRequestData) => ({
        url: '/leave-requests',
        method: 'POST',
        body: leaveRequestData,
      }),
      invalidatesTags: [{ type: 'LeaveRequest', id: 'LIST' }],
    }),
    updateLeaveRequest: builder.mutation<{ success: boolean; data: LeaveRequest }, LeaveRequest>({
      query: ({ id, ...leaveRequestData }) => ({
        url: '/leave-requests',
        method: 'PUT',
        body: { id, ...leaveRequestData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'LeaveRequest', id },
        { type: 'LeaveRequest', id: 'LIST' },
      ],
    }),
    deleteLeaveRequest: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/leave-requests?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'LeaveRequest', id },
        { type: 'LeaveRequest', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  // Companies
  useGetCompaniesQuery,
  useCreateCompanyMutation,
  useUpdateCompanyMutation,
  useDeleteCompanyMutation,

  // Departments
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,

  // Employees
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,

  // Shifts
  useGetShiftsQuery,
  useCreateShiftMutation,
  useUpdateShiftMutation,
  useDeleteShiftMutation,

  // Holidays
  useGetHolidaysQuery,
  useCreateHolidayMutation,
  useUpdateHolidayMutation,
  useDeleteHolidayMutation,

  // Leave Types
  useGetLeaveTypesQuery,
  useCreateLeaveTypeMutation,
  useUpdateLeaveTypeMutation,
  useDeleteLeaveTypeMutation,

  // Attendance
  useGetAttendanceQuery,
  useCreateAttendanceMutation,
  useUpdateAttendanceMutation,
  useDeleteAttendanceMutation,

  // Leave Requests
  useGetLeaveRequestsQuery,
  useCreateLeaveRequestMutation,
  useUpdateLeaveRequestMutation,
  useDeleteLeaveRequestMutation,
} = hrmV2Api

export { useGetOrganizationQuery } from './settingsV2Api'