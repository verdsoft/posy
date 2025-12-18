import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../api-url'

export interface Currency {
  id: number
  code: string
  name: string
  symbol: string
  created_at?: string
  updated_at?: string
}

export interface CreateCurrencyInput {
  code: string
  name: string
  symbol: string
  exchange_rate?: number
}

export interface UpdateCurrencyInput {
  id: number
  code: string
  name: string
  symbol: string
  exchange_rate?: number
}

export const currenciesApi = createApi({
  reducerPath: 'currenciesApi',
  baseQuery: fetchBaseQuery({ baseUrl: "/api/v2/settings/currencies" }),
  tagTypes: ['Currency'],
  endpoints: (builder) => ({
    getCurrencies: builder.query<Currency[], void>({
      query: () => '',
      transformResponse: (response: Currency[] | { data?: Currency[] }) => {
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
            ...result.map(({ id }) => ({ type: 'Currency' as const, id })),
            { type: 'Currency', id: 'LIST' },
          ]
          : [{ type: 'Currency', id: 'LIST' }],
    }),
    createCurrency: builder.mutation<Currency, CreateCurrencyInput>({
      query: (currencyData) => ({
        url: '',
        method: 'POST',
        body: currencyData,
      }),
      invalidatesTags: [{ type: 'Currency', id: 'LIST' }],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            currenciesApi.util.updateQueryData('getCurrencies', undefined, (draft) => {
              draft.push(data)
            })
          )
        } catch { }
      },
    }),
    updateCurrency: builder.mutation<Currency, UpdateCurrencyInput>({
      query: ({ id, ...currencyData }) => ({
        url: `?id=${id}`,
        method: 'PUT',
        body: { id, ...currencyData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Currency', id },
        { type: 'Currency', id: 'LIST' },
      ],
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            currenciesApi.util.updateQueryData('getCurrencies', undefined, (draft) => {
              const index = draft.findIndex((currency) => currency.id === id)
              if (index !== -1) {
                draft[index] = data
              }
            })
          )
        } catch { }
      },
    }),
    deleteCurrency: builder.mutation<void, number>({
      query: (id) => ({
        url: `?id=${id}`,
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Currency', id },
        { type: 'Currency', id: 'LIST' },
      ],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          currenciesApi.util.updateQueryData('getCurrencies', undefined, (draft) => {
            const index = draft.findIndex((currency) => currency.id === id)
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
  useGetCurrenciesQuery,
  useCreateCurrencyMutation,
  useUpdateCurrencyMutation,
  useDeleteCurrencyMutation,
} = currenciesApi
