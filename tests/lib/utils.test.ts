/**
 * Tests for utility functions
 */

import { cn, formatCurrency } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('cn (className merge)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'conditional', false && 'excluded');
      expect(result).toContain('base');
      expect(result).toContain('conditional');
      expect(result).not.toContain('excluded');
    });

    it('should merge tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      // Should only have px-4 (later value wins)
      expect(result).toContain('px-4');
      expect(result).not.toContain('px-2');
      expect(result).toContain('py-1');
    });

    it('should handle empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle undefined and null', () => {
      const result = cn('class1', undefined, null, 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD currency by default', () => {
      const result = formatCurrency(1234.56);
      expect(result).toBe('$1,234.56');
    });

    it('should format whole numbers', () => {
      const result = formatCurrency(1000);
      expect(result).toBe('$1,000.00');
    });

    it('should format decimals correctly', () => {
      const result = formatCurrency(1234.567);
      expect(result).toBe('$1,234.57'); // Rounded to 2 decimals
    });

    it('should handle zero', () => {
      const result = formatCurrency(0);
      expect(result).toBe('$0.00');
    });

    it('should handle negative numbers', () => {
      const result = formatCurrency(-100.50);
      expect(result).toBe('-$100.50');
    });

    it('should support different currencies', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toContain('1,234.56');
      // May include € or EUR depending on locale
    });

    it('should format large numbers with commas', () => {
      const result = formatCurrency(1234567.89);
      expect(result).toBe('$1,234,567.89');
    });

    it('should format small decimal values', () => {
      const result = formatCurrency(0.99);
      expect(result).toBe('$0.99');
    });
  });
});
