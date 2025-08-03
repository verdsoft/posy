export interface Adjustment {
  id: string;
  reference: string;
  warehouse_id: string;
  warehouse_name: string;
  date: Date;
  type: 'addition' | 'subtraction';
  notes?: string;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
  item_count: number; // for frontend use
}

export interface AdjustmentItem {
  id: string;
  adjustment_id: string;
  product_id: string;
  product_name?: string;
  product_code?: string;
  quantity: number;
  type: 'addition' | 'subtraction';
  created_at: Date;
}

export interface AdjustmentDetails extends Adjustment {
  items: AdjustmentItem[];
}

export interface PaginatedAdjustmentResponse {
  data: Adjustment[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}