/**
 * Tests for warehousesApi
 */

import { warehousesApi } from '@/lib/slices/warehousesApi';

describe('warehousesApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(warehousesApi.reducerPath).toBe('warehousesApi');
    });

    it('should export reducer', () => {
      expect(warehousesApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(warehousesApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('should have getWarehouses endpoint', () => {
      const { endpoints } = warehousesApi;
      expect(endpoints.getWarehouses).toBeDefined();
      expect(endpoints.getWarehouses.name).toBe('getWarehouses');
    });

    it('should have createWarehouse mutation', () => {
      const { endpoints } = warehousesApi;
      expect(endpoints.createWarehouse).toBeDefined();
    });

    it('should have updateWarehouse mutation', () => {
      const { endpoints } = warehousesApi;
      expect(endpoints.updateWarehouse).toBeDefined();
    });

    it('should have deleteWarehouse mutation', () => {
      const { endpoints } = warehousesApi;
      expect(endpoints.deleteWarehouse).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetWarehousesQuery hook', () => {
      const { useGetWarehousesQuery } = warehousesApi;
      expect(useGetWarehousesQuery).toBeDefined();
      expect(typeof useGetWarehousesQuery).toBe('function');
    });

    it('should export useCreateWarehouseMutation hook', () => {
      const { useCreateWarehouseMutation } = warehousesApi;
      expect(useCreateWarehouseMutation).toBeDefined();
      expect(typeof useCreateWarehouseMutation).toBe('function');
    });

    it('should export useUpdateWarehouseMutation hook', () => {
      const { useUpdateWarehouseMutation } = warehousesApi;
      expect(useUpdateWarehouseMutation).toBeDefined();
      expect(typeof useUpdateWarehouseMutation).toBe('function');
    });

    it('should export useDeleteWarehouseMutation hook', () => {
      const { useDeleteWarehouseMutation } = warehousesApi;
      expect(useDeleteWarehouseMutation).toBeDefined();
      expect(typeof useDeleteWarehouseMutation).toBe('function');
    });
  });
});
