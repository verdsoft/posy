/**
 * Tests for categoriesApi
 */

import { categoriesApi } from '@/lib/slices/categoriesApi';

describe('categoriesApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(categoriesApi.reducerPath).toBe('categoriesApi');
    });

    it('should export reducer', () => {
      expect(categoriesApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(categoriesApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    it('should have getCategories endpoint', () => {
      const { endpoints } = categoriesApi;
      expect(endpoints.getCategories).toBeDefined();
    });

    it('should have createCategory mutation', () => {
      const { endpoints } = categoriesApi;
      expect(endpoints.createCategory).toBeDefined();
    });

    it('should have updateCategory mutation', () => {
      const { endpoints } = categoriesApi;
      expect(endpoints.updateCategory).toBeDefined();
    });

    it('should have deleteCategory mutation', () => {
      const { endpoints } = categoriesApi;
      expect(endpoints.deleteCategory).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetCategoriesQuery hook', () => {
      const { useGetCategoriesQuery } = categoriesApi;
      expect(useGetCategoriesQuery).toBeDefined();
      expect(typeof useGetCategoriesQuery).toBe('function');
    });

    it('should export useCreateCategoryMutation hook', () => {
      const { useCreateCategoryMutation } = categoriesApi;
      expect(useCreateCategoryMutation).toBeDefined();
      expect(typeof useCreateCategoryMutation).toBe('function');
    });

    it('should export useUpdateCategoryMutation hook', () => {
      const { useUpdateCategoryMutation } = categoriesApi;
      expect(useUpdateCategoryMutation).toBeDefined();
      expect(typeof useUpdateCategoryMutation).toBe('function');
    });

    it('should export useDeleteCategoryMutation hook', () => {
      const { useDeleteCategoryMutation } = categoriesApi;
      expect(useDeleteCategoryMutation).toBeDefined();
      expect(typeof useDeleteCategoryMutation).toBe('function');
    });
  });
});
