import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface Category {
  id: string
  code: string
  name: string
}

export interface Brand {
  id: string
  code: string
  name: string
}

export interface Warehouse {
  id: string
  code: string
  name: string
}

export interface Unit {
  id: string
  code: string
  name: string
}

export interface Backup {
    name: string;
    size: number;
    date: string;
}

export interface SystemSettings {
    system_title: string;
    system_logo: string;
}

export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/settings' }),
  tagTypes: ['Category', 'Brand', 'Warehouse', 'Unit', 'Backup', 'SystemSettings'],
  endpoints: (builder) => ({
    getSystemSettings: builder.query<SystemSettings, void>({
        query: () => 'system',
        providesTags: ['SystemSettings'],
    }),
    updateSystemSettings: builder.mutation<void, FormData>({
        query: (formData) => ({
            url: 'system',
            method: 'POST',
            body: formData,
        }),
        invalidatesTags: ['SystemSettings'],
    }),
    getBackups: builder.query<Backup[], void>({
        query: () => 'backup',
        providesTags: ['Backup'],
    }),
    createBackup: builder.mutation<void, void>({
        query: () => ({
            url: 'backup',
            method: 'POST',
        }),
        invalidatesTags: ['Backup'],
    }),
    deleteBackup: builder.mutation<void, string>({
        query: (fileName) => ({
            url: `backup?fileName=${fileName}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['Backup'],
    }),
    getCategories: builder.query<Category[], void>({
      query: () => 'categories',
      providesTags: ['Category'],
    }),
    createCategory: builder.mutation<Category, Partial<Category>>({
      query: (category) => ({
        url: 'categories',
        method: 'POST',
        body: category,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation<Category, { id: string; data: Partial<Category> }>({
      query: ({ id, data }) => ({
        url: 'categories',
        method: 'PUT',
        body: { id, ...data },
      }),
      invalidatesTags: ['Category'],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `categories`,
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: ['Category'],
    }),
    getBrands: builder.query<Brand[], void>({
      query: () => 'brands',
      providesTags: ['Brand'],
    }),
    createBrand: builder.mutation<Brand, Partial<Brand>>({
      query: (brand) => ({
        url: 'brands',
        method: 'POST',
        body: brand,
      }),
      invalidatesTags: ['Brand'],
    }),
    updateBrand: builder.mutation<Brand, { id: string; data: Partial<Brand> }>({
      query: ({ id, data }) => ({
        url: 'brands',
        method: 'PUT',
        body: { id, ...data },
      }),
      invalidatesTags: ['Brand'],
    }),
    deleteBrand: builder.mutation<void, string>({
      query: (id) => ({
        url: `brands`,
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: ['Brand'],
    }),
    getWarehouses: builder.query<Warehouse[], void>({
      query: () => 'warehouses',
      providesTags: ['Warehouse'],
    }),
    createWarehouse: builder.mutation<Warehouse, Partial<Warehouse>>({
      query: (warehouse) => ({
        url: 'warehouses',
        method: 'POST',
        body: warehouse,
      }),
      invalidatesTags: ['Warehouse'],
    }),
    updateWarehouse: builder.mutation<Warehouse, { id: string; data: Partial<Warehouse> }>({
      query: ({ id, data }) => ({
        url: 'warehouses',
        method: 'PUT',
        body: { id, ...data },
      }),
      invalidatesTags: ['Warehouse'],
    }),
    deleteWarehouse: builder.mutation<void, string>({
      query: (id) => ({
        url: `warehouses`,
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: ['Warehouse'],
    }),
    getUnits: builder.query<Unit[], void>({
      query: () => 'units',
      providesTags: ['Unit'],
    }),
    createUnit: builder.mutation<Unit, Partial<Unit>>({
      query: (unit) => ({
        url: 'units',
        method: 'POST',
        body: unit,
      }),
      invalidatesTags: ['Unit'],
    }),
    updateUnit: builder.mutation<Unit, { id: string; data: Partial<Unit> }>({
      query: ({ id, data }) => ({
        url: 'units',
        method: 'PUT',
        body: { id, ...data },
      }),
      invalidatesTags: ['Unit'],
    }),
    deleteUnit: builder.mutation<void, string>({
      query: (id) => ({
        url: `units`,
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: ['Unit'],
    }),
  }),
})

export const {
    useGetSystemSettingsQuery,
    useUpdateSystemSettingsMutation,
    useGetBackupsQuery,
    useCreateBackupMutation,
    useDeleteBackupMutation,
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useGetBrandsQuery,
  useCreateBrandMutation,
  useUpdateBrandMutation,
  useDeleteBrandMutation,
  useGetWarehousesQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = settingsApi
