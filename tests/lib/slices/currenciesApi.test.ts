/**
 * Tests for currenciesApi
 */

import { currenciesApi } from '@/lib/slices/currenciesApi';

describe('currenciesApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(currenciesApi.reducerPath).toBe('currenciesApi');
    });

    it('should export reducer', () => {
      expect(currenciesApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(currenciesApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('should have getCurrencies endpoint', () => {
      const { endpoints } = currenciesApi;
      expect(endpoints.getCurrencies).toBeDefined();
    });

    it('should have createCurrency mutation', () => {
      const { endpoints } = currenciesApi;
      expect(endpoints.createCurrency).toBeDefined();
    });

    it('should have updateCurrency mutation', () => {
      const { endpoints } = currenciesApi;
      expect(endpoints.updateCurrency).toBeDefined();
    });

    it('should have deleteCurrency mutation', () => {
      const { endpoints } = currenciesApi;
      expect(endpoints.deleteCurrency).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetCurrenciesQuery hook', () => {
      const { useGetCurrenciesQuery } = currenciesApi;
      expect(useGetCurrenciesQuery).toBeDefined();
      expect(typeof useGetCurrenciesQuery).toBe('function');
    });

    it('should export useCreateCurrencyMutation hook', () => {
      const { useCreateCurrencyMutation } = currenciesApi;
      expect(useCreateCurrencyMutation).toBeDefined();
      expect(typeof useCreateCurrencyMutation).toBe('function');
    });

    it('should export useUpdateCurrencyMutation hook', () => {
      const { useUpdateCurrencyMutation } = currenciesApi;
      expect(useUpdateCurrencyMutation).toBeDefined();
      expect(typeof useUpdateCurrencyMutation).toBe('function');
    });

    it('should export useDeleteCurrencyMutation hook', () => {
      const { useDeleteCurrencyMutation } = currenciesApi;
      expect(useDeleteCurrencyMutation).toBeDefined();
      expect(typeof useDeleteCurrencyMutation).toBe('function');
    });
  });
});
