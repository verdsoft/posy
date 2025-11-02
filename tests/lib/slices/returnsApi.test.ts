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

  describe('Endpoints', () => {
    it('should have getSalesReturns endpoint', () => {
      const { endpoints } = returnsApi;
      expect(endpoints.getSalesReturns).toBeDefined();
    });

    it('should have getPurchaseReturns endpoint', () => {
      const { endpoints } = returnsApi;
      expect(endpoints.getPurchaseReturns).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetSalesReturnsQuery hook', () => {
      const { useGetSalesReturnsQuery } = returnsApi;
      expect(useGetSalesReturnsQuery).toBeDefined();
      expect(typeof useGetSalesReturnsQuery).toBe('function');
    });

    it('should export useGetPurchaseReturnsQuery hook', () => {
      const { useGetPurchaseReturnsQuery } = returnsApi;
      expect(useGetPurchaseReturnsQuery).toBeDefined();
      expect(typeof useGetPurchaseReturnsQuery).toBe('function');
    });
  });
});
