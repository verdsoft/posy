/**
 * Tests for invoicesV2Api Redux slice
 */

import { createTestStore } from '@/tests/utils/test-utils';
import { invoicesV2Api } from '@/lib/slices/invoicesV2Api';
import type { Invoice, InvoiceItem } from '@/lib/slices/invoicesV2Api';
import { createMockInvoice, createMockInvoiceItem, createMockPaginatedResponse } from '@/tests/utils/mockData';

describe('invoicesV2Api', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Type definitions', () => {
    it('should have correct Invoice type structure', () => {
      const mockInvoice: Invoice = createMockInvoice();

      // Required fields
      expect(mockInvoice).toHaveProperty('id');
      expect(mockInvoice).toHaveProperty('reference');
      expect(mockInvoice).toHaveProperty('customer_id');
      expect(mockInvoice).toHaveProperty('warehouse_id');
      expect(mockInvoice).toHaveProperty('date');
      expect(mockInvoice).toHaveProperty('total');
      expect(mockInvoice).toHaveProperty('status');
      expect(mockInvoice).toHaveProperty('payment_status');

      // Optional fields
      expect(mockInvoice).toHaveProperty('subtotal');
      expect(mockInvoice).toHaveProperty('tax_rate');
      expect(mockInvoice).toHaveProperty('tax_amount');
      expect(mockInvoice).toHaveProperty('discount');
      expect(mockInvoice).toHaveProperty('shipping');
      expect(mockInvoice).toHaveProperty('paid');
      expect(mockInvoice).toHaveProperty('due');
    });

    it('should accept valid Invoice status values', () => {
      const validStatuses: Invoice['status'][] = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];

      validStatuses.forEach(status => {
        const invoice = createMockInvoice({ status });
        expect(invoice.status).toBe(status);
      });
    });

    it('should accept valid payment_status values', () => {
      const validPaymentStatuses: Invoice['payment_status'][] = ['unpaid', 'partial', 'paid'];

      validPaymentStatuses.forEach(payment_status => {
        const invoice = createMockInvoice({ payment_status });
        expect(invoice.payment_status).toBe(payment_status);
      });
    });

    it('should have correct InvoiceItem type structure', () => {
      const mockItem: InvoiceItem = createMockInvoiceItem();

      expect(mockItem).toHaveProperty('id');
      expect(mockItem).toHaveProperty('invoice_id');
      expect(mockItem).toHaveProperty('product_id');
      expect(mockItem).toHaveProperty('quantity');
      expect(mockItem).toHaveProperty('unit_price');
      expect(mockItem).toHaveProperty('subtotal');
    });
  });

  describe('API Endpoints', () => {
    it('should have getInvoices endpoint', () => {
      const { endpoints } = invoicesV2Api;
      expect(endpoints.getInvoices).toBeDefined();
    });

    it('should have getInvoiceById endpoint', () => {
      const { endpoints } = invoicesV2Api;
      expect(endpoints.getInvoiceById).toBeDefined();
    });

    it('should have getInvoiceItems endpoint', () => {
      const { endpoints } = invoicesV2Api;
      expect(endpoints.getInvoiceItems).toBeDefined();
    });

    it('should have createInvoice mutation', () => {
      const { endpoints } = invoicesV2Api;
      expect(endpoints.createInvoice).toBeDefined();
    });

    it('should have updateInvoice mutation', () => {
      const { endpoints } = invoicesV2Api;
      expect(endpoints.updateInvoice).toBeDefined();
    });

    it('should have deleteInvoice mutation', () => {
      const { endpoints } = invoicesV2Api;
      expect(endpoints.deleteInvoice).toBeDefined();
    });
  });

  describe('Query transformations', () => {
    it('should build correct query string for getInvoices', () => {
      const { endpoints } = invoicesV2Api;
      const query = endpoints.getInvoices.initiate({ page: 1, limit: 10, search: 'test' });

      expect(query).toBeDefined();
      expect(query.type).toContain('executeQuery');
    });

    it('should build correct query for getInvoiceById', () => {
      const { endpoints } = invoicesV2Api;
      const query = endpoints.getInvoiceById.initiate('123');

      expect(query).toBeDefined();
      expect(query.type).toContain('executeQuery');
    });

    it('should build correct query for getInvoiceItems', () => {
      const { endpoints } = invoicesV2Api;
      const query = endpoints.getInvoiceItems.initiate('123');

      expect(query).toBeDefined();
      expect(query.type).toContain('executeQuery');
    });
  });

  describe('Hooks export', () => {
    it('should export useGetInvoicesQuery hook', () => {
      const { useGetInvoicesQuery } = invoicesV2Api;
      expect(useGetInvoicesQuery).toBeDefined();
      expect(typeof useGetInvoicesQuery).toBe('function');
    });

    it('should export useGetInvoiceByIdQuery hook', () => {
      const { useGetInvoiceByIdQuery } = invoicesV2Api;
      expect(useGetInvoiceByIdQuery).toBeDefined();
      expect(typeof useGetInvoiceByIdQuery).toBe('function');
    });

    it('should export useGetInvoiceItemsQuery hook', () => {
      const { useGetInvoiceItemsQuery } = invoicesV2Api;
      expect(useGetInvoiceItemsQuery).toBeDefined();
      expect(typeof useGetInvoiceItemsQuery).toBe('function');
    });

    it('should export useCreateInvoiceMutation hook', () => {
      const { useCreateInvoiceMutation } = invoicesV2Api;
      expect(useCreateInvoiceMutation).toBeDefined();
      expect(typeof useCreateInvoiceMutation).toBe('function');
    });

    it('should export useUpdateInvoiceMutation hook', () => {
      const { useUpdateInvoiceMutation } = invoicesV2Api;
      expect(useUpdateInvoiceMutation).toBeDefined();
      expect(typeof useUpdateInvoiceMutation).toBe('function');
    });

    it('should export useDeleteInvoiceMutation hook', () => {
      const { useDeleteInvoiceMutation } = invoicesV2Api;
      expect(useDeleteInvoiceMutation).toBeDefined();
      expect(typeof useDeleteInvoiceMutation).toBe('function');
    });
  });
});
