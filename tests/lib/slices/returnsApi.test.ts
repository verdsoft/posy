/**
 * Tests for returnsApi
 */

import { returnsApi } from '@/lib/slices/returnsApi';

describe('returnsApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(returnsApi.reducerPath).toBe('returnsApi');
    });

    it('should export reducer', () => {
      expect(returnsApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(returnsApi.middleware).toBeDefined();
    });
  });

  describe('Sales Return Endpoints', () => {
    it('should have getSalesReturns endpoint', () => {
      const { endpoints } = returnsApi;
      expect(endpoints.getSalesReturns).toBeDefined();
    });

    it('should have createSalesReturn endpoint', () => {
      const { endpoints } = returnsApi;
      expect(endpoints.createSalesReturn).toBeDefined();
    });

    it('should have updateSalesReturn endpoint', () => {
      const { endpoints } = returnsApi;
      expect(endpoints.updateSalesReturn).toBeDefined();
    });

    it('should have deleteSalesReturn endpoint', () => {
      const { endpoints } = returnsApi;
      expect(endpoints.deleteSalesReturn).toBeDefined();
    });
  });

  describe('Purchase Return Endpoints', () => {
    it('should have getPurchaseReturns endpoint', () => {
      const { endpoints } = returnsApi;
      expect(endpoints.getPurchaseReturns).toBeDefined();
    });

    it('should have createPurchaseReturn endpoint', () => {
      const { endpoints } = returnsApi;
      expect(endpoints.createPurchaseReturn).toBeDefined();
    });

    it('should have updatePurchaseReturn endpoint', () => {
      const { endpoints } = returnsApi;
      expect(endpoints.updatePurchaseReturn).toBeDefined();
    });

    it('should have deletePurchaseReturn endpoint', () => {
      const { endpoints } = returnsApi;
      expect(endpoints.deletePurchaseReturn).toBeDefined();
    });
  });

  describe('Sales Return Hooks export', () => {
    it('should export useGetSalesReturnsQuery hook', () => {
      const { useGetSalesReturnsQuery } = returnsApi;
      expect(useGetSalesReturnsQuery).toBeDefined();
      expect(typeof useGetSalesReturnsQuery).toBe('function');
    });

    it('should export useCreateSalesReturnMutation hook', () => {
      const { useCreateSalesReturnMutation } = returnsApi;
      expect(useCreateSalesReturnMutation).toBeDefined();
      expect(typeof useCreateSalesReturnMutation).toBe('function');
    });

    it('should export useUpdateSalesReturnMutation hook', () => {
      const { useUpdateSalesReturnMutation } = returnsApi;
      expect(useUpdateSalesReturnMutation).toBeDefined();
      expect(typeof useUpdateSalesReturnMutation).toBe('function');
    });

    it('should export useDeleteSalesReturnMutation hook', () => {
      const { useDeleteSalesReturnMutation } = returnsApi;
      expect(useDeleteSalesReturnMutation).toBeDefined();
      expect(typeof useDeleteSalesReturnMutation).toBe('function');
    });
  });

  describe('Purchase Return Hooks export', () => {
    it('should export useGetPurchaseReturnsQuery hook', () => {
      const { useGetPurchaseReturnsQuery } = returnsApi;
      expect(useGetPurchaseReturnsQuery).toBeDefined();
      expect(typeof useGetPurchaseReturnsQuery).toBe('function');
    });

    it('should export useCreatePurchaseReturnMutation hook', () => {
      const { useCreatePurchaseReturnMutation } = returnsApi;
      expect(useCreatePurchaseReturnMutation).toBeDefined();
      expect(typeof useCreatePurchaseReturnMutation).toBe('function');
    });

    it('should export useUpdatePurchaseReturnMutation hook', () => {
      const { useUpdatePurchaseReturnMutation } = returnsApi;
      expect(useUpdatePurchaseReturnMutation).toBeDefined();
      expect(typeof useUpdatePurchaseReturnMutation).toBe('function');
    });

    it('should export useDeletePurchaseReturnMutation hook', () => {
      const { useDeletePurchaseReturnMutation } = returnsApi;
      expect(useDeletePurchaseReturnMutation).toBeDefined();
      expect(typeof useDeletePurchaseReturnMutation).toBe('function');
    });
  });
});
