/**
 * Tests for adjustmentsApi
 */

import { adjustmentsApi } from '@/lib/slices/adjustmentsApi';

describe('adjustmentsApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(adjustmentsApi.reducerPath).toBe('adjustmentsApi');
    });

    it('should export reducer', () => {
      expect(adjustmentsApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(adjustmentsApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('should have getAdjustments endpoint', () => {
      const { endpoints } = adjustmentsApi;
      expect(endpoints.getAdjustments).toBeDefined();
      expect(endpoints.getAdjustments.name).toBe('getAdjustments');
    });

    it('should have getAdjustmentById endpoint', () => {
      const { endpoints } = adjustmentsApi;
      expect(endpoints.getAdjustmentById).toBeDefined();
    });

    it('should have createAdjustment mutation', () => {
      const { endpoints } = adjustmentsApi;
      expect(endpoints.createAdjustment).toBeDefined();
    });

    it('should have updateAdjustment mutation', () => {
      const { endpoints } = adjustmentsApi;
      expect(endpoints.updateAdjustment).toBeDefined();
    });

    it('should have deleteAdjustment mutation', () => {
      const { endpoints } = adjustmentsApi;
      expect(endpoints.deleteAdjustment).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetAdjustmentsQuery hook', () => {
      const { useGetAdjustmentsQuery } = adjustmentsApi;
      expect(useGetAdjustmentsQuery).toBeDefined();
      expect(typeof useGetAdjustmentsQuery).toBe('function');
    });

    it('should export useCreateAdjustmentMutation hook', () => {
      const { useCreateAdjustmentMutation } = adjustmentsApi;
      expect(useCreateAdjustmentMutation).toBeDefined();
      expect(typeof useCreateAdjustmentMutation).toBe('function');
    });

    it('should export useDeleteAdjustmentMutation hook', () => {
      const { useDeleteAdjustmentMutation } = adjustmentsApi;
      expect(useDeleteAdjustmentMutation).toBeDefined();
      expect(typeof useDeleteAdjustmentMutation).toBe('function');
    });
  });
});
