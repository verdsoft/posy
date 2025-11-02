/**
 * Tests for unitsApi
 */

import { unitsApi } from '@/lib/slices/unitsApi';

describe('unitsApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(unitsApi.reducerPath).toBe('unitsApi');
    });

    it('should export reducer', () => {
      expect(unitsApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(unitsApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('should have getUnits endpoint', () => {
      const { endpoints } = unitsApi;
      expect(endpoints.getUnits).toBeDefined();
    });

    it('should have createUnit mutation', () => {
      const { endpoints } = unitsApi;
      expect(endpoints.createUnit).toBeDefined();
    });

    it('should have updateUnit mutation', () => {
      const { endpoints } = unitsApi;
      expect(endpoints.updateUnit).toBeDefined();
    });

    it('should have deleteUnit mutation', () => {
      const { endpoints } = unitsApi;
      expect(endpoints.deleteUnit).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetUnitsQuery hook', () => {
      const { useGetUnitsQuery } = unitsApi;
      expect(useGetUnitsQuery).toBeDefined();
      expect(typeof useGetUnitsQuery).toBe('function');
    });

    it('should export useCreateUnitMutation hook', () => {
      const { useCreateUnitMutation } = unitsApi;
      expect(useCreateUnitMutation).toBeDefined();
      expect(typeof useCreateUnitMutation).toBe('function');
    });

    it('should export useUpdateUnitMutation hook', () => {
      const { useUpdateUnitMutation } = unitsApi;
      expect(useUpdateUnitMutation).toBeDefined();
      expect(typeof useUpdateUnitMutation).toBe('function');
    });

    it('should export useDeleteUnitMutation hook', () => {
      const { useDeleteUnitMutation } = unitsApi;
      expect(useDeleteUnitMutation).toBeDefined();
      expect(typeof useDeleteUnitMutation).toBe('function');
    });
  });
});
