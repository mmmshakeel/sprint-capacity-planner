/**
 * Theme contrast validation utility
 * Tests all color combinations in light and dark themes for WCAG compliance
 */

import { Theme } from '@mui/material/styles';
import { validateColorContrast, ColorCombination, ContrastValidationResult } from './accessibility';

/**
 * Extract color combinations from a theme for validation
 */
function extractThemeColorCombinations(theme: Theme, themeName: string): ColorCombination[] {
  const combinations: ColorCombination[] = [];
  
  // Primary text on backgrounds
  combinations.push(
    {
      foreground: theme.palette.text.primary,
      background: theme.palette.background.default,
      context: `${themeName} - Primary text on default background`,
    },
    {
      foreground: theme.palette.text.primary,
      background: theme.palette.background.paper,
      context: `${themeName} - Primary text on paper background`,
    },
    {
      foreground: theme.palette.text.secondary,
      background: theme.palette.background.default,
      context: `${themeName} - Secondary text on default background`,
    },
    {
      foreground: theme.palette.text.secondary,
      background: theme.palette.background.paper,
      context: `${themeName} - Secondary text on paper background`,
    }
  );

  // Primary button colors
  combinations.push(
    {
      foreground: theme.palette.primary.contrastText,
      background: theme.palette.primary.main,
      context: `${themeName} - Primary button text`,
    },
    {
      foreground: theme.palette.primary.contrastText,
      background: theme.palette.primary.dark,
      context: `${themeName} - Primary button text (dark variant)`,
    }
  );

  // Secondary button colors
  combinations.push(
    {
      foreground: theme.palette.secondary.contrastText,
      background: theme.palette.secondary.main,
      context: `${themeName} - Secondary button text`,
    },
    {
      foreground: theme.palette.secondary.contrastText,
      background: theme.palette.secondary.dark,
      context: `${themeName} - Secondary button text (dark variant)`,
    }
  );

  // Error colors (if available)
  if (theme.palette.error) {
    combinations.push({
      foreground: theme.palette.error.contrastText || '#ffffff',
      background: theme.palette.error.main,
      context: `${themeName} - Error text`,
    });
  }

  // Warning colors (if available)
  if (theme.palette.warning) {
    combinations.push({
      foreground: theme.palette.warning.contrastText || '#000000',
      background: theme.palette.warning.main,
      context: `${themeName} - Warning text`,
    });
  }

  // Success colors (if available)
  if (theme.palette.success) {
    combinations.push({
      foreground: theme.palette.success.contrastText || '#ffffff',
      background: theme.palette.success.main,
      context: `${themeName} - Success text`,
    });
  }

  // Info colors (if available)
  if (theme.palette.info) {
    combinations.push({
      foreground: theme.palette.info.contrastText || '#ffffff',
      background: theme.palette.info.main,
      context: `${themeName} - Info text`,
    });
  }

  return combinations;
}

/**
 * Validate contrast ratios for a theme
 */
export function validateThemeContrast(theme: Theme, themeName: string): ContrastValidationResult[] {
  const combinations = extractThemeColorCombinations(theme, themeName);
  return validateColorContrast(combinations);
}

/**
 * Generate a contrast validation report
 */
export function generateContrastReport(results: ContrastValidationResult[]): string {
  let report = 'WCAG Contrast Validation Report\n';
  report += '================================\n\n';
  
  const passed = results.filter(r => r.meetsAA);
  const failed = results.filter(r => !r.meetsAA);
  
  report += `Summary: ${passed.length}/${results.length} combinations pass WCAG AA\n\n`;
  
  if (failed.length > 0) {
    report += 'FAILED COMBINATIONS:\n';
    report += '-------------------\n';
    failed.forEach(result => {
      report += `❌ ${result.combination.context}\n`;
      report += `   Ratio: ${result.ratio.toFixed(2)} (Required: 4.5)\n`;
      report += `   Colors: ${result.combination.foreground} on ${result.combination.background}\n`;
      if (result.recommendation) {
        report += `   Recommendation: ${result.recommendation}\n`;
      }
      report += '\n';
    });
  }
  
  if (passed.length > 0) {
    report += 'PASSED COMBINATIONS:\n';
    report += '-------------------\n';
    passed.forEach(result => {
      const status = result.meetsAAA ? '✅ AAA' : '✅ AA';
      report += `${status} ${result.combination.context}\n`;
      report += `   Ratio: ${result.ratio.toFixed(2)}\n`;
      report += `   Colors: ${result.combination.foreground} on ${result.combination.background}\n\n`;
    });
  }
  
  return report;
}

/**
 * Log contrast validation results to console
 */
export function logContrastValidation(theme: Theme, themeName: string): void {
  const results = validateThemeContrast(theme, themeName);
  const report = generateContrastReport(results);
  console.log(report);
}