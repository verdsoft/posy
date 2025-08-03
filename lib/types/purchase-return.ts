export interface PurchaseReturn {
    id: string;
    date: string;
    reference: string;
    supplier_name: string;
    warehouse_name: string;
    item_count: number;
    total: number;
    status: string;
    payment_status: string;
    paid: number;
    due: number;
}

export interface PaginatedPurchaseReturnsResponse {
    data: PurchaseReturn[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        nextPage: number | null;
        prevPage: number | null;
    };
}
