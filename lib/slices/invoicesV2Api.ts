import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_URL } from '../api-url'

// Types
export interface Invoice {
  id: number
  reference: string
  customer_id: number
  warehouse_id: number
  sale_id?: number | null
  quotation_id?: number | null
  date: string
  due_date?: string | null
  subtotal?: number
  tax_rate?: number
  tax_amount?: number
  discount?: number
  shipping?: number
  total: number
  paid?: number
  due?: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  payment_status: 'unpaid' | 'partial' | 'paid'
  notes?: string | null
  created_by: number
  created_at?: string
  updated_at?: string
  customers?: { id: number; name: string; email?: string }
  warehouses?: { id: number; name: string }
  invoice_items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: number
  invoice_id: number
  product_id: number
  quantity: number
  unit_price: number
  discount?: number
  tax?: number
  subtotal: number
  created_at?: string
  products?: { id: number; name: string; code: string }
  name?: string
  code?: string
}

export interface Transfer {
  id: number
  reference: string
  from_warehouse_id: number
  to_warehouse_id: number
  date: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount: number
  shipping: number
  total: number
  status: 'pending' | 'sent' | 'completed' | 'cancelled'
  notes?: string
  created_at?: string
  updated_at?: string
  warehouses_transfers_from_warehouse_idTowerehouses?: { id: number; name: string }
  warehouses_transfers_to_warehouse_idTowerehouses?: { id: number; name: string }
  transfer_items?: TransferItem[]
}

export interface TransferItem {
  id: number
  transfer_id: number
  product_id: number
  quantity: number
  unit_price: number
  discount: number
  tax: number
  subtotal: number
  created_at?: string
  products?: { id: number; name: string; code: string }
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

export const invoicesV2Api = createApi({
  reducerPath: 'invoicesV2Api',
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}` }),
  tagTypes: ['Invoice', 'Transfer'],
  endpoints: (builder) => ({
    // Invoices
    getInvoices: builder.query<PaginatedResponse<Invoice & { customer_name?: string; warehouse_name?: string }>, QueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.search) searchParams.append('search', params.search)
        return `/invoices?${searchParams.toString()}`
      },
      transformResponse: (response: PaginatedResponse<Invoice>) => ({
        ...response,
        data: response.data.map(invoice => ({
          ...invoice,
          customer_name: invoice.customers?.name,
          warehouse_name: invoice.warehouses?.name,
        })),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Invoice' as const, id })),
              { type: 'Invoice', id: 'LIST' },
            ]
          : [{ type: 'Invoice', id: 'LIST' }],
    }),
    getInvoiceById: builder.query<Invoice, string>({
      query: (id) => `/invoices/${id}`,
      providesTags: (result, error, id) => [{ type: 'Invoice', id }],
    }),
    getInvoiceItems: builder.query<InvoiceItem[], string>({
      query: (invoiceId) => `/invoices/items?invoice_id=${invoiceId}`,
      transformResponse: (response: { success: boolean; data: InvoiceItem[] }) => response.data || [],
      providesTags: (result, error, invoiceId) => [{ type: 'Invoice', id: invoiceId }],
    }),
    createInvoice: builder.mutation<{ success: boolean; data: Invoice }, Omit<Invoice, 'id' | 'created_at' | 'updated_at'> & { items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'name' | 'code'>[] }>({
      query: (invoiceData) => ({
        url: '/invoices',
        method: 'POST',
        body: invoiceData,
      }),
      invalidatesTags: [{ type: 'Invoice', id: 'LIST' }],
    }),
    updateInvoice: builder.mutation<{ success: boolean; data: Invoice }, { id: number; items?: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at' | 'name' | 'code'>[] } & Partial<Invoice>>({
      query: ({ id, ...invoiceData }) => ({
        url: '/invoices',
        method: 'PUT',
        body: { id, ...invoiceData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),
    deleteInvoice: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/invoices?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Invoice', id },
        { type: 'Invoice', id: 'LIST' },
      ],
    }),

    // Transfers
    getTransfers: builder.query<PaginatedResponse<Transfer>, QueryParams>({
      query: (params) => {
        const searchParams = new URLSearchParams()
        if (params.page) searchParams.append('page', params.page.toString())
        if (params.limit) searchParams.append('limit', params.limit.toString())
        if (params.search) searchParams.append('search', params.search)
        return `/transfers?${searchParams.toString()}`
      },
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Transfer' as const, id })),
              { type: 'Transfer', id: 'LIST' },
            ]
          : [{ type: 'Transfer', id: 'LIST' }],
    }),
    createTransfer: builder.mutation<{ success: boolean; data: Transfer }, Omit<Transfer, 'id'> & { items: Omit<TransferItem, 'id' | 'transfer_id'>[] }>({
      query: (transferData) => ({
        url: '/transfers',
        method: 'POST',
        body: transferData,
      }),
      invalidatesTags: [{ type: 'Transfer', id: 'LIST' }],
    }),
    updateTransfer: builder.mutation<{ success: boolean; data: Transfer }, Transfer & { items: Omit<TransferItem, 'transfer_id'>[] }>({
      query: ({ id, ...transferData }) => ({
        url: '/transfers',
        method: 'PUT',
        body: { id, ...transferData },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Transfer', id },
        { type: 'Transfer', id: 'LIST' },
      ],
    }),
    deleteTransfer: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/transfers?id=${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Transfer', id },
        { type: 'Transfer', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  // Invoices
  useGetInvoicesQuery,
  useGetInvoiceByIdQuery,
  useGetInvoiceItemsQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,

  // Transfers
  useGetTransfersQuery,
  useCreateTransferMutation,
  useUpdateTransferMutation,
  useDeleteTransferMutation,
} = invoicesV2Api