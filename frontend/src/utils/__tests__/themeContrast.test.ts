/**
 * Tests for theme contrast validation
 */

import { validateThemeContrast, generateContrastReport } from '../validateThemeContrast';
import { lightTheme, darkTheme } from '../../theme';

describe('Theme Contrast Validation', () => {
  describe('Light Theme', () => {
    it('should have all color combinations meet WCAG AA standards', () => {
      const results = validateThemeContrast(lightTheme, 'Light Theme');
      const failedCombinations = results.filter(result => !result.meetsAA);
      
      if (failedCombinations.length > 0) {
        console.log('Failed combinations in light theme:');
        failedCombinations.forEach(result => {
          console.log(`- ${result.combination.context}: ${result.ratio.toFixed(2)}`);
        });
      }
      
      expect(failedCombinations).toHaveLength(0);
    });

    it('should have primary text readable on default background', () => {
      const results = validateThemeContrast(lightTheme, 'Light Theme');
      const primaryTextResult = results.find(r => 
        r.combination.context.includes('Primary text on default background')
      );
      
      expect(primaryTextResult).toBeDefined();
      expect(primaryTextResult!.meetsAA).toBe(true);
      expect(primaryTextResult!.ratio).toBeGreaterThan(4.5);
    });

    it('should have button text readable on primary background', () => {
      const results = validateThemeContrast(lightTheme, 'Light Theme');
      const buttonTextResult = results.find(r => 
        r.combination.context.includes('Primary button text')
      );
      
      expect(buttonTextResult).toBeDefined();
      expect(buttonTextResult!.meetsAA).toBe(true);
    });
  });

  describe('Dark Theme', () => {
    it('should have all color combinations meet WCAG AA standards', () => {
      const results = validateThemeContrast(darkTheme, 'Dark Theme');
      const failedCombinations = results.filter(result => !result.meetsAA);
      
      if (failedCombinations.length > 0) {
        console.log('Failed combinations in dark theme:');
        failedCombinations.forEach(result => {
          console.log(`- ${result.combination.context}: ${result.ratio.toFixed(2)}`);
        });
      }
      
      expect(failedCombinations).toHaveLength(0);
    });

    it('should have primary text readable on default background', () => {
      const results = validateThemeContrast(darkTheme, 'Dark Theme');
      const primaryTextResult = results.find(r => 
        r.combination.context.includes('Primary text on default background')
      );
      
      expect(primaryTextResult).toBeDefined();
      expect(primaryTextResult!.meetsAA).toBe(true);
      expect(primaryTextResult!.ratio).toBeGreaterThan(4.5);
    });

    it('should have button text readable on primary background', () => {
      const results = validateThemeContrast(darkTheme, 'Dark Theme');
      const buttonTextResult = results.find(r => 
        r.combination.context.includes('Primary button text')
      );
      
      expect(buttonTextResult).toBeDefined();
      expect(buttonTextResult!.meetsAA).toBe(true);
    });
  });

  describe('generateContrastReport', () => {
    it('should generate a readable report', () => {
      const results = validateThemeContrast(lightTheme, 'Light Theme');
      const report = generateContrastReport(results);
      
      expect(report).toContain('WCAG Contrast Validation Report');
      expect(report).toContain('Summary:');
      expect(typeof report).toBe('string');
      expect(report.length).toBeGreaterThan(0);
    });
  });
});