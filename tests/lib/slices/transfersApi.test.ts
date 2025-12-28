/**
 * Tests for transfersApi
 */

import { transfersApi } from '@/lib/slices/transfersApi';

describe('transfersApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(transfersApi.reducerPath).toBe('transfersApi');
    });

    it('should export reducer', () => {
      expect(transfersApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(transfersApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('should have getTransfers endpoint', () => {
      const { endpoints } = transfersApi;
      expect(endpoints.getTransfers).toBeDefined();
      expect(endpoints.getTransfers.name).toBe('getTransfers');
    });

    it('should have createTransfer mutation', () => {
      const { endpoints } = transfersApi;
      expect(endpoints.createTransfer).toBeDefined();
    });

    it('should have updateTransfer mutation', () => {
      const { endpoints } = transfersApi;
      expect(endpoints.updateTransfer).toBeDefined();
    });

    it('should have deleteTransfer mutation', () => {
      const { endpoints } = transfersApi;
      expect(endpoints.deleteTransfer).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetTransfersQuery hook', () => {
      const { useGetTransfersQuery } = transfersApi;
      expect(useGetTransfersQuery).toBeDefined();
      expect(typeof useGetTransfersQuery).toBe('function');
    });

    it('should export useCreateTransferMutation hook', () => {
      const { useCreateTransferMutation } = transfersApi;
      expect(useCreateTransferMutation).toBeDefined();
      expect(typeof useCreateTransferMutation).toBe('function');
    });

    it('should export useUpdateTransferMutation hook', () => {
      const { useUpdateTransferMutation } = transfersApi;
      expect(useUpdateTransferMutation).toBeDefined();
      expect(typeof useUpdateTransferMutation).toBe('function');
    });

    it('should export useDeleteTransferMutation hook', () => {
      const { useDeleteTransferMutation } = transfersApi;
      expect(useDeleteTransferMutation).toBeDefined();
      expect(typeof useDeleteTransferMutation).toBe('function');
    });
  });
});
