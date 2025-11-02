/**
 * Tests for fdmsApi
 */

import { fdmsApi } from '@/lib/slices/fdmsApi';

describe('fdmsApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(fdmsApi.reducerPath).toBe('fdmsApi');
    });

    it('should export reducer', () => {
      expect(fdmsApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(fdmsApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    const { endpoints } = fdmsApi;

    it('should have getFDMSConfig endpoint', () => {
      expect(endpoints.getFDMSConfig).toBeDefined();
    });

    it('should have createFDMSConfig endpoint', () => {
      expect(endpoints.createFDMSConfig).toBeDefined();
    });

    it('should have toggleFDMSMode endpoint', () => {
      expect(endpoints.toggleFDMSMode).toBeDefined();
    });

    it('should have getFDMSStatus endpoint', () => {
      expect(endpoints.getFDMSStatus).toBeDefined();
    });

    it('should have performFDMSAction endpoint', () => {
      expect(endpoints.performFDMSAction).toBeDefined();
    });

    it('should have submitFiscalInvoice endpoint', () => {
      expect(endpoints.submitFiscalInvoice).toBeDefined();
    });

    it('should have getFiscalTransactions endpoint', () => {
      expect(endpoints.getFiscalTransactions).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetFDMSConfigQuery hook', () => {
      const { useGetFDMSConfigQuery } = fdmsApi;
      expect(useGetFDMSConfigQuery).toBeDefined();
      expect(typeof useGetFDMSConfigQuery).toBe('function');
    });

    it('should export useCreateFDMSConfigMutation hook', () => {
      const { useCreateFDMSConfigMutation } = fdmsApi;
      expect(useCreateFDMSConfigMutation).toBeDefined();
      expect(typeof useCreateFDMSConfigMutation).toBe('function');
    });

    it('should export useToggleFDMSModeMutation hook', () => {
      const { useToggleFDMSModeMutation } = fdmsApi;
      expect(useToggleFDMSModeMutation).toBeDefined();
      expect(typeof useToggleFDMSModeMutation).toBe('function');
    });

    it('should export useGetFDMSStatusQuery hook', () => {
      const { useGetFDMSStatusQuery } = fdmsApi;
      expect(useGetFDMSStatusQuery).toBeDefined();
      expect(typeof useGetFDMSStatusQuery).toBe('function');
    });

    it('should export usePerformFDMSActionMutation hook', () => {
      const { usePerformFDMSActionMutation } = fdmsApi;
      expect(usePerformFDMSActionMutation).toBeDefined();
      expect(typeof usePerformFDMSActionMutation).toBe('function');
    });

    it('should export useSubmitFiscalInvoiceMutation hook', () => {
      const { useSubmitFiscalInvoiceMutation } = fdmsApi;
      expect(useSubmitFiscalInvoiceMutation).toBeDefined();
      expect(typeof useSubmitFiscalInvoiceMutation).toBe('function');
    });

    it('should export useGetFiscalTransactionsQuery hook', () => {
      const { useGetFiscalTransactionsQuery } = fdmsApi;
      expect(useGetFiscalTransactionsQuery).toBeDefined();
      expect(typeof useGetFiscalTransactionsQuery).toBe('function');
    });
  });
});
