/**
 * Tests for organizationApi
 */

import { organizationApi } from '@/lib/slices/organizationApi';

describe('organizationApi', () => {
  describe('API structure', () => {
    it('should have correct reducer path', () => {
      expect(organizationApi.reducerPath).toBe('organizationApi');
    });

    it('should export reducer', () => {
      expect(organizationApi.reducer).toBeDefined();
    });

    it('should export middleware', () => {
      expect(organizationApi.middleware).toBeDefined();
    });
  });

  describe('Endpoints', () => {
    const { endpoints } = organizationApi;

    it('should have getOrganization endpoint', () => {
      expect(endpoints.getOrganization).toBeDefined();
    });

    it('should have updateOrganization endpoint', () => {
      expect(endpoints.updateOrganization).toBeDefined();
    });
  });

  describe('Hooks export', () => {
    it('should export useGetOrganizationQuery hook', () => {
      const { useGetOrganizationQuery } = organizationApi;
      expect(useGetOrganizationQuery).toBeDefined();
      expect(typeof useGetOrganizationQuery).toBe('function');
    });

    it('should export useUpdateOrganizationMutation hook', () => {
      const { useUpdateOrganizationMutation } = organizationApi;
      expect(useUpdateOrganizationMutation).toBeDefined();
      expect(typeof useUpdateOrganizationMutation).toBe('function');
    });
  });
});
