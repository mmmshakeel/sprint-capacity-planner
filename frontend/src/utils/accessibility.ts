/**
 * Accessibility utilities for color contrast validation and theme enhancements
 */

/**
 * Convert hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Convert RGBA string to RGB values
 */
function rgbaToRgb(rgba: string): { r: number; g: number; b: number } | null {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  return match
    ? {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
      }
    : null;
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 specification
 */
function getRelativeLuminance(color: string): number {
  let rgb = hexToRgb(color) || rgbaToRgb(color);
  
  if (!rgb) {
    // Handle special color values
    if (color === '#ffffff' || color === 'white') rgb = { r: 255, g: 255, b: 255 };
    else if (color === '#000000' || color === 'black') rgb = { r: 0, g: 0, b: 0 };
    else return 0; // Default fallback
  }

  // Convert to sRGB
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getRelativeLuminance(foreground);
  const l2 = getRelativeLuminance(background);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function meetsWCAGAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

/**
 * Check if contrast ratio meets WCAG AAA standards
 */
export function meetsWCAGAAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Validate color combinations for accessibility
 */
export interface ColorCombination {
  foreground: string;
  background: string;
  context: string;
  isLargeText?: boolean;
}

export interface ContrastValidationResult {
  combination: ColorCombination;
  ratio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  recommendation?: string;
}

/**
 * Validate multiple color combinations
 */
export function validateColorContrast(combinations: ColorCombination[]): ContrastValidationResult[] {
  return combinations.map((combination) => {
    const ratio = getContrastRatio(combination.foreground, combination.background);
    const meetsAA = meetsWCAGAA(combination.foreground, combination.background, combination.isLargeText);
    const meetsAAA = meetsWCAGAAA(combination.foreground, combination.background, combination.isLargeText);
    
    let recommendation: string | undefined;
    if (!meetsAA) {
      recommendation = `Contrast ratio ${ratio.toFixed(2)} is below WCAG AA standard. Consider using darker/lighter colors.`;
    } else if (!meetsAAA) {
      recommendation = `Meets AA but not AAA standard. Consider improving contrast for better accessibility.`;
    }
    
    return {
      combination,
      ratio,
      meetsAA,
      meetsAAA,
      recommendation,
    };
  });
}

/**
 * Generate accessible focus outline styles
 */
export function getFocusOutlineStyles(theme: any) {
  return {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: '2px',
    borderRadius: theme.shape.borderRadius,
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get transition duration based on user preference
 */
export function getAccessibleTransitionDuration(normalDuration: number): number {
  return prefersReducedMotion() ? 0 : normalDuration;
}