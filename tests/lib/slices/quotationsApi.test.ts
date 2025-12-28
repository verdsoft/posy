/**
 * Tests for quotationsApi
 */

import { quotationsApi } from '@/lib/slices/quotationsApi';

describe('quotationsApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(quotationsApi.reducerPath).toBe('quotationsApi');
    });

    it('should export reducer', () => {
      expect(quotationsApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(quotationsApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('should have getQuotations endpoint', () => {
      const { endpoints } = quotationsApi;
      expect(endpoints.getQuotations).toBeDefined();
      expect(endpoints.getQuotations.name).toBe('getQuotations');
    });

    it('should have getQuotationById endpoint', () => {
      const { endpoints } = quotationsApi;
      expect(endpoints.getQuotationById).toBeDefined();
    });

    it('should have getQuotationItems endpoint', () => {
      const { endpoints } = quotationsApi;
      expect(endpoints.getQuotationItems).toBeDefined();
    });

    it('should have createQuotation mutation', () => {
      const { endpoints } = quotationsApi;
      expect(endpoints.createQuotation).toBeDefined();
    });

    it('should have updateQuotation mutation', () => {
      const { endpoints } = quotationsApi;
      expect(endpoints.updateQuotation).toBeDefined();
    });

    it('should have deleteQuotation mutation', () => {
      const { endpoints } = quotationsApi;
      expect(endpoints.deleteQuotation).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetQuotationsQuery hook', () => {
      const { useGetQuotationsQuery } = quotationsApi;
      expect(useGetQuotationsQuery).toBeDefined();
      expect(typeof useGetQuotationsQuery).toBe('function');
    });

    it('should export useGetQuotationByIdQuery hook', () => {
      const { useGetQuotationByIdQuery } = quotationsApi;
      expect(useGetQuotationByIdQuery).toBeDefined();
      expect(typeof useGetQuotationByIdQuery).toBe('function');
    });

    it('should export useGetQuotationItemsQuery hook', () => {
      const { useGetQuotationItemsQuery } = quotationsApi;
      expect(useGetQuotationItemsQuery).toBeDefined();
      expect(typeof useGetQuotationItemsQuery).toBe('function');
    });

    it('should export useCreateQuotationMutation hook', () => {
      const { useCreateQuotationMutation } = quotationsApi;
      expect(useCreateQuotationMutation).toBeDefined();
      expect(typeof useCreateQuotationMutation).toBe('function');
    });

    it('should export useUpdateQuotationMutation hook', () => {
      const { useUpdateQuotationMutation } = quotationsApi;
      expect(useUpdateQuotationMutation).toBeDefined();
      expect(typeof useUpdateQuotationMutation).toBe('function');
    });

    it('should export useDeleteQuotationMutation hook', () => {
      const { useDeleteQuotationMutation } = quotationsApi;
      expect(useDeleteQuotationMutation).toBeDefined();
      expect(typeof useDeleteQuotationMutation).toBe('function');
    });
  });
});
