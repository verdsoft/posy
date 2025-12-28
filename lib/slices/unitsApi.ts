import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../api-url'

export interface Unit {
  id: number
  name: string
  short_name: string
  base_unit?: string
  operator: string
  operation_value: number
  created_at?: string
  updated_at?: string
}

export interface CreateUnitInput {
  name: string
  short_name: string
  base_unit?: string
  operator: string
  operation_value: number
}

export interface UpdateUnitInput {
  id: number
  name: string
  short_name: string
  base_unit?: string
  operator: string
  operation_value: number
}

export const unitsApi = createApi({
  reducerPath: 'unitsApi',
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v2/settings/units" }),
  tagTypes: ['Unit'],
  endpoints: (builder) => ({
    getUnits: builder.query<Unit[], void>({
      query: () => '',
      transformResponse: (response: Unit[] | { data?: Unit[] }) => {
        if (Array.isArray(response)) {
          return response
        }
        if (response && typeof response === 'object' && 'data' in response && Array.isArray(response.data)) {
          return response.data
        }
        return []
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Unit' as const, id })),
              { type: 'Unit', id: 'LIST' },
            ]
          : [{ type: 'Unit', id: 'LIST' }],
    }),
    createUnit: builder.mutation<Unit, CreateUnitInput>({
      query: (unitData) => ({
        url: '',
        method: 'POST',
        body: unitData,
      }),
      invalidatesTags: [{ type: 'Unit', id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            unitsApi.util.updateQueryData('getUnits', undefined, (draft) => {
              draft.push(data)
            })
          )
        } catch {}
      },
    }),
    updateUnit: builder.mutation<Unit, UpdateUnitInput>({
      query: ({ id, ...unitData }) => ({
        url: `?id=${id}`,
        method: 'PUT',
        body: unitData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Unit', id },
        { type: 'Unit', id: 'LIST' },
      ],
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            unitsApi.util.updateQueryData('getUnits', undefined, (draft) => {
              const index = draft.findIndex((unit) => unit.id === id)
              if (index !== -1) {
                draft[index] = data
              }
            })
          )
        } catch {}
      },
    }),
    deleteUnit: builder.mutation<void, number>({
      query: (id) => ({
        url: `?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Unit', id },
        { type: 'Unit', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          unitsApi.util.updateQueryData('getUnits', undefined, (draft) => {
            const index = draft.findIndex((unit) => unit.id === id)
            if (index !== -1) {
              draft.splice(index, 1)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
    }),
  }),
})

export const {
  useGetUnitsQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,
} = unitsApi
