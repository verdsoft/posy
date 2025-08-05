export interface SalesReturn {
    id: string;
    date: string;
    reference: string;
    customer_id: string;
    customer_name?: string;
    warehouse_id: string;
    warehouse_name?: string;
    sale_id: string;
    sale_reference?: string;
    status: string;
    total: number;
    tax: number;
    discount: number;
    shipping: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface PaginatedSalesReturnsResponse {
    data: SalesReturn[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        nextPage: number | null;
        prevPage: number | null;
    };
} 