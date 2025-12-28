/**
 * Tests for salesApi
 */

import { salesApi } from '@/lib/slices/salesApi';

describe('salesApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(salesApi.reducerPath).toBe('salesApi');
    });

    it('should export reducer', () => {
      expect(salesApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(salesApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('should have getSales endpoint', () => {
      const { endpoints } = salesApi;
      expect(endpoints.getSales).toBeDefined();
      expect(endpoints.getSales.name).toBe('getSales');
    });

    it('should have getSaleById endpoint', () => {
      const { endpoints } = salesApi;
      expect(endpoints.getSaleById).toBeDefined();
    });

    it('should have createSale mutation', () => {
      const { endpoints } = salesApi;
      expect(endpoints.createSale).toBeDefined();
    });

    it('should have updateSale mutation', () => {
      const { endpoints } = salesApi;
      expect(endpoints.updateSale).toBeDefined();
    });

    it('should have deleteSale mutation', () => {
      const { endpoints } = salesApi;
      expect(endpoints.deleteSale).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetSalesQuery hook', () => {
      const { useGetSalesQuery } = salesApi;
      expect(useGetSalesQuery).toBeDefined();
      expect(typeof useGetSalesQuery).toBe('function');
    });

    it('should export useGetSaleByIdQuery hook', () => {
      const { useGetSaleByIdQuery } = salesApi;
      expect(useGetSaleByIdQuery).toBeDefined();
      expect(typeof useGetSaleByIdQuery).toBe('function');
    });

    it('should export useCreateSaleMutation hook', () => {
      const { useCreateSaleMutation } = salesApi;
      expect(useCreateSaleMutation).toBeDefined();
      expect(typeof useCreateSaleMutation).toBe('function');
    });

    it('should export useUpdateSaleMutation hook', () => {
      const { useUpdateSaleMutation } = salesApi;
      expect(useUpdateSaleMutation).toBeDefined();
      expect(typeof useUpdateSaleMutation).toBe('function');
    });

    it('should export useDeleteSaleMutation hook', () => {
      const { useDeleteSaleMutation } = salesApi;
      expect(useDeleteSaleMutation).toBeDefined();
      expect(typeof useDeleteSaleMutation).toBe('function');
    });
  });
});
