export * from './adjustment';
export * from './api';
export * from './product';
export * from './quotation';
export * from './purchase';
export * from './sale';
export * from './customer';
export * from './supplier';
export * from './purchase-return';
export * from './sales-return';

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        nextPage: number | null;
        prevPage: number | null;
    };
}
