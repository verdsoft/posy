import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Product } from '../types';

export interface PaginatedProductsResponse {
    data: Product[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export const productsApi = createApi({
    reducerPath: 'productsApi',
    baseQuery: fetchBaseQuery({ baseUrl: '/api/products' }),
    tagTypes: ['Product'],
    endpoints: (builder) => ({
        getProducts: builder.query<PaginatedProductsResponse, { page?: number, limit?: number, search?: string }>({
            query: ({ page = 1, limit = 10, search = '' }) => `?page=${page}&limit=${limit}&search=${search}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'Product', id } as const)),
                        { type: 'Product', id: 'LIST' },
                    ]
                    : [{ type: 'Product', id: 'LIST' }],
        }),
        getProductById: builder.query<Product, string>({
            query: (id) => `/${id}`,
            providesTags: (result, error, id) => [{ type: 'Product', id }],
        }),
        createProduct: builder.mutation<Product, FormData>({
            query: (newProduct) => ({
                url: '',
                method: 'POST',
                body: newProduct,
            }),
            invalidatesTags: [{ type: 'Product', id: 'LIST' }],
        }),
        updateProduct: builder.mutation<Product, { id: string, data: FormData }>({
            query: ({ id, data }) => ({
                url: `/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Product', id }],
        }),
        deleteProduct: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `?id=${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Product', id }, { type: 'Product', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = productsApi;
