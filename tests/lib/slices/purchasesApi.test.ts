/**
 * Tests for purchasesApi
 */

import { purchasesApi } from '@/lib/slices/purchasesApi';

describe('purchasesApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(purchasesApi.reducerPath).toBe('purchasesApi');
    });

    it('should export reducer', () => {
      expect(purchasesApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(purchasesApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('should have getPurchases endpoint', () => {
      const { endpoints } = purchasesApi;
      expect(endpoints.getPurchases).toBeDefined();
      expect(endpoints.getPurchases.name).toBe('getPurchases');
    });

    it('should have getPurchaseById endpoint', () => {
      const { endpoints } = purchasesApi;
      expect(endpoints.getPurchaseById).toBeDefined();
    });

    it('should have createPurchase mutation', () => {
      const { endpoints } = purchasesApi;
      expect(endpoints.createPurchase).toBeDefined();
    });

    it('should have updatePurchase mutation', () => {
      const { endpoints } = purchasesApi;
      expect(endpoints.updatePurchase).toBeDefined();
    });

    it('should have deletePurchase mutation', () => {
      const { endpoints } = purchasesApi;
      expect(endpoints.deletePurchase).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetPurchasesQuery hook', () => {
      const { useGetPurchasesQuery } = purchasesApi;
      expect(useGetPurchasesQuery).toBeDefined();
      expect(typeof useGetPurchasesQuery).toBe('function');
    });

    it('should export useCreatePurchaseMutation hook', () => {
      const { useCreatePurchaseMutation } = purchasesApi;
      expect(useCreatePurchaseMutation).toBeDefined();
      expect(typeof useCreatePurchaseMutation).toBe('function');
    });

    it('should export useDeletePurchaseMutation hook', () => {
      const { useDeletePurchaseMutation } = purchasesApi;
      expect(useDeletePurchaseMutation).toBeDefined();
      expect(typeof useDeletePurchaseMutation).toBe('function');
    });
  });
});
