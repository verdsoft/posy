/**
 * Tests for brandsApi
 */

import { brandsApi } from '@/lib/slices/brandsApi';

describe('brandsApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(brandsApi.reducerPath).toBe('brandsApi');
    });

    it('should export reducer', () => {
      expect(brandsApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(brandsApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('should have getBrands endpoint', () => {
      const { endpoints } = brandsApi;
      expect(endpoints.getBrands).toBeDefined();
    });

    it('should have createBrand mutation', () => {
      const { endpoints } = brandsApi;
      expect(endpoints.createBrand).toBeDefined();
    });

    it('should have updateBrand mutation', () => {
      const { endpoints } = brandsApi;
      expect(endpoints.updateBrand).toBeDefined();
    });

    it('should have deleteBrand mutation', () => {
      const { endpoints } = brandsApi;
      expect(endpoints.deleteBrand).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetBrandsQuery hook', () => {
      const { useGetBrandsQuery } = brandsApi;
      expect(useGetBrandsQuery).toBeDefined();
      expect(typeof useGetBrandsQuery).toBe('function');
    });

    it('should export useCreateBrandMutation hook', () => {
      const { useCreateBrandMutation } = brandsApi;
      expect(useCreateBrandMutation).toBeDefined();
      expect(typeof useCreateBrandMutation).toBe('function');
    });

    it('should export useUpdateBrandMutation hook', () => {
      const { useUpdateBrandMutation } = brandsApi;
      expect(useUpdateBrandMutation).toBeDefined();
      expect(typeof useUpdateBrandMutation).toBe('function');
    });

    it('should export useDeleteBrandMutation hook', () => {
      const { useDeleteBrandMutation } = brandsApi;
      expect(useDeleteBrandMutation).toBeDefined();
      expect(typeof useDeleteBrandMutation).toBe('function');
    });
  });
});
