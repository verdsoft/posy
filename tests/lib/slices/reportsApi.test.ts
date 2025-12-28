import { reportsApi } from '@/lib/slices/reportsApi';

describe('reportsApi', () => {
  it('should have the correct reducer path', () => {
    expect(reportsApi.reducerPath).toBe('reportsApi');
  });

  it('should have the correct base URL', () => {
    expect(reportsApi.reducerPath).toBe('reportsApi');
  });

  describe('endpoints', () => {
    it('should define getProfitLoss endpoint', () => {
      const endpoint = reportsApi.endpoints.getProfitLoss;
      expect(endpoint).toBeDefined();
    });

    it('should define getCustomers endpoint', () => {
      const endpoint = reportsApi.endpoints.getCustomers;
      expect(endpoint).toBeDefined();
    });

    it('should define getSuppliers endpoint', () => {
      const endpoint = reportsApi.endpoints.getSuppliers;
      expect(endpoint).toBeDefined();
    });

    it('should define getSalesReport endpoint', () => {
      const endpoint = reportsApi.endpoints.getSalesReport;
      expect(endpoint).toBeDefined();
    });

    it('should define getPurchasesReport endpoint', () => {
      const endpoint = reportsApi.endpoints.getPurchasesReport;
      expect(endpoint).toBeDefined();
    });

    it('should define getSalesReturnsReport endpoint', () => {
      const endpoint = reportsApi.endpoints.getSalesReturnsReport;
      expect(endpoint).toBeDefined();
    });

    it('should define getPurchaseReturnsReport endpoint', () => {
      const endpoint = reportsApi.endpoints.getPurchaseReturnsReport;
      expect(endpoint).toBeDefined();
    });

    it('should define getBestCustomers endpoint', () => {
      const endpoint = reportsApi.endpoints.getBestCustomers;
      expect(endpoint).toBeDefined();
    });

    it('should define getTopSellingProducts endpoint', () => {
      const endpoint = reportsApi.endpoints.getTopSellingProducts;
      expect(endpoint).toBeDefined();
    });

    it('should define getQuantityAlerts endpoint', () => {
      const endpoint = reportsApi.endpoints.getQuantityAlerts;
      expect(endpoint).toBeDefined();
    });

    it('should define getWarehouseReport endpoint', () => {
      const endpoint = reportsApi.endpoints.getWarehouseReport;
      expect(endpoint).toBeDefined();
    });

    it('should define getSalesPaymentsReport endpoint', () => {
      const endpoint = reportsApi.endpoints.getSalesPaymentsReport;
      expect(endpoint).toBeDefined();
    });

    it('should define getPurchasesPaymentsReport endpoint', () => {
      const endpoint = reportsApi.endpoints.getPurchasesPaymentsReport;
      expect(endpoint).toBeDefined();
    });

    it('should define getSalesReturnsPaymentsReport endpoint', () => {
      const endpoint = reportsApi.endpoints.getSalesReturnsPaymentsReport;
      expect(endpoint).toBeDefined();
    });

    it('should define getPurchaseReturnsPaymentsReport endpoint', () => {
      const endpoint = reportsApi.endpoints.getPurchaseReturnsPaymentsReport;
      expect(endpoint).toBeDefined();
    });
  });

  describe('hooks', () => {
    it('should export useGetProfitLossQuery', () => {
      expect(reportsApi.useGetProfitLossQuery).toBeDefined();
    });

    it('should export useGetCustomersQuery', () => {
      expect(reportsApi.useGetCustomersQuery).toBeDefined();
    });

    it('should export useGetSuppliersQuery', () => {
      expect(reportsApi.useGetSuppliersQuery).toBeDefined();
    });

    it('should export useGetSalesReportQuery', () => {
      expect(reportsApi.useGetSalesReportQuery).toBeDefined();
    });

    it('should export useGetPurchasesReportQuery', () => {
      expect(reportsApi.useGetPurchasesReportQuery).toBeDefined();
    });

    it('should export useGetSalesReturnsReportQuery', () => {
      expect(reportsApi.useGetSalesReturnsReportQuery).toBeDefined();
    });

    it('should export useGetPurchaseReturnsReportQuery', () => {
      expect(reportsApi.useGetPurchaseReturnsReportQuery).toBeDefined();
    });

    it('should export useGetBestCustomersQuery', () => {
      expect(reportsApi.useGetBestCustomersQuery).toBeDefined();
    });

    it('should export useGetTopSellingProductsQuery', () => {
      expect(reportsApi.useGetTopSellingProductsQuery).toBeDefined();
    });

    it('should export useGetQuantityAlertsQuery', () => {
      expect(reportsApi.useGetQuantityAlertsQuery).toBeDefined();
    });

    it('should export useGetWarehouseReportQuery', () => {
      expect(reportsApi.useGetWarehouseReportQuery).toBeDefined();
    });

    it('should export useGetSalesPaymentsReportQuery', () => {
      expect(reportsApi.useGetSalesPaymentsReportQuery).toBeDefined();
    });

    it('should export useGetPurchasesPaymentsReportQuery', () => {
      expect(reportsApi.useGetPurchasesPaymentsReportQuery).toBeDefined();
    });

    it('should export useGetSalesReturnsPaymentsReportQuery', () => {
      expect(reportsApi.useGetSalesReturnsPaymentsReportQuery).toBeDefined();
    });

    it('should export useGetPurchaseReturnsPaymentsReportQuery', () => {
      expect(reportsApi.useGetPurchaseReturnsPaymentsReportQuery).toBeDefined();
    });
  });

  describe('API configuration', () => {
    it('should have correct configuration', () => {
      expect(reportsApi.reducerPath).toBe('reportsApi');
      expect(reportsApi.reducer).toBeDefined();
      expect(reportsApi.middleware).toBeDefined();
    });
  });
});
