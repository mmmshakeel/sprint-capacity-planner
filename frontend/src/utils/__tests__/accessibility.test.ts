/**
 * Tests for accessibility utilities and contrast validation
 */

import { getContrastRatio, meetsWCAGAA, meetsWCAGAAA, validateColorContrast } from '../accessibility';

describe('Accessibility Utils', () => {
  describe('getContrastRatio', () => {
    it('should calculate correct contrast ratio for black and white', () => {
      const ratio = getContrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 1); // Maximum contrast ratio
    });

    it('should calculate correct contrast ratio for same colors', () => {
      const ratio = getContrastRatio('#ffffff', '#ffffff');
      expect(ratio).toBeCloseTo(1, 1); // Minimum contrast ratio
    });

    it('should handle hex colors correctly', () => {
      const ratio = getContrastRatio('#1565c0', '#ffffff');
      expect(ratio).toBeGreaterThan(4.5); // Should meet WCAG AA
    });

    it('should handle rgba colors correctly', () => {
      const ratio = getContrastRatio('rgba(0, 0, 0, 0.87)', '#ffffff');
      expect(ratio).toBeGreaterThan(4.5);
    });
  });

  describe('meetsWCAGAA', () => {
    it('should return true for high contrast combinations', () => {
      expect(meetsWCAGAA('#000000', '#ffffff')).toBe(true);
      expect(meetsWCAGAA('#ffffff', '#000000')).toBe(true);
    });

    it('should return false for low contrast combinations', () => {
      expect(meetsWCAGAA('#cccccc', '#ffffff')).toBe(false);
      expect(meetsWCAGAA('#999999', '#ffffff')).toBe(false);
    });

    it('should handle large text correctly', () => {
      // Use a color that falls between 3 and 4.5 contrast ratio
      const ratio = getContrastRatio('#888888', '#ffffff');
      expect(ratio).toBeGreaterThan(3);
      expect(ratio).toBeLessThan(4.5);
      
      expect(meetsWCAGAA('#888888', '#ffffff', false)).toBe(false); // Normal text
      expect(meetsWCAGAA('#888888', '#ffffff', true)).toBe(true);   // Large text
    });
  });

  describe('meetsWCAGAAA', () => {
    it('should return true for very high contrast combinations', () => {
      expect(meetsWCAGAAA('#000000', '#ffffff')).toBe(true);
    });

    it('should return false for medium contrast combinations', () => {
      // A combination that meets AA but not AAA
      expect(meetsWCAGAAA('#666666', '#ffffff')).toBe(false);
    });
  });

  describe('validateColorContrast', () => {
    it('should validate multiple color combinations', () => {
      const combinations = [
        {
          foreground: '#000000',
          background: '#ffffff',
          context: 'Black on white',
        },
        {
          foreground: '#cccccc',
          background: '#ffffff',
          context: 'Light gray on white',
        },
      ];

      const results = validateColorContrast(combinations);
      
      expect(results).toHaveLength(2);
      expect(results[0].meetsAA).toBe(true);
      expect(results[1].meetsAA).toBe(false);
      expect(results[1].recommendation).toBeDefined();
    });
  });
});