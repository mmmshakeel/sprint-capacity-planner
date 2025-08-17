/**
 * Tests for useAccessibility hook
 */

import { renderHook, act } from '@testing-library/react';
import { useAccessibility } from '../useAccessibility';

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => ({
  matches,
  media: '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => {
    if (query === '(prefers-reduced-motion: reduce)') {
      return mockMatchMedia(false);
    }
    if (query === '(prefers-contrast: high)') {
      return mockMatchMedia(false);
    }
    if (query === '(forced-colors: active)') {
      return mockMatchMedia(false);
    }
    return mockMatchMedia(false);
  }),
});

describe('useAccessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAccessibility());
    
    expect(result.current.reducedMotion).toBe(false);
    expect(result.current.highContrast).toBe(false);
    expect(result.current.forceFocus).toBe(false);
  });

  it('should detect reduced motion preference', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    const { result } = renderHook(() => useAccessibility());
    expect(result.current.reducedMotion).toBe(true);
  });

  it('should detect high contrast preference', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(prefers-contrast: high)') {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    const { result } = renderHook(() => useAccessibility());
    expect(result.current.highContrast).toBe(true);
  });

  it('should return correct transition duration based on reduced motion', () => {
    const { result } = renderHook(() => useAccessibility());
    
    expect(result.current.getTransitionDuration(300)).toBe(300);
    
    // Test with reduced motion enabled
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(prefers-reduced-motion: reduce)') {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    const { result: resultWithReducedMotion } = renderHook(() => useAccessibility());
    expect(resultWithReducedMotion.current.getTransitionDuration(300)).toBe(0);
  });

  it('should announce to screen reader', () => {
    const { result } = renderHook(() => useAccessibility());
    
    // Mock document.body methods
    const mockAppendChild = vi.spyOn(document.body, 'appendChild');
    const mockRemoveChild = vi.spyOn(document.body, 'removeChild');
    const mockContains = vi.spyOn(document.body, 'contains').mockReturnValue(true);
    
    act(() => {
      result.current.announceToScreenReader('Test message');
    });
    
    expect(mockAppendChild).toHaveBeenCalled();
    
    // Clean up mocks
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
    mockContains.mockRestore();
  });

  it('should return appropriate focus ring styles', () => {
    const mockTheme = {
      palette: {
        primary: { main: '#1976d2' },
        background: { paper: '#ffffff' },
      },
      shape: { borderRadius: 4 },
    };

    const { result } = renderHook(() => useAccessibility());
    
    const focusStyle = result.current.getFocusRingStyle(mockTheme);
    
    expect(focusStyle).toHaveProperty('outline');
    expect(focusStyle).toHaveProperty('outlineOffset');
    expect(focusStyle).toHaveProperty('borderRadius');
  });

  it('should return enhanced focus styles for high contrast', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(prefers-contrast: high)') {
        return mockMatchMedia(true);
      }
      return mockMatchMedia(false);
    });

    const mockTheme = {
      palette: {
        primary: { main: '#1976d2' },
        background: { paper: '#ffffff' },
      },
      shape: { borderRadius: 4 },
    };

    const { result } = renderHook(() => useAccessibility());
    
    const focusStyle = result.current.getFocusRingStyle(mockTheme);
    
    expect(focusStyle).toHaveProperty('boxShadow');
    expect(focusStyle.outline).toContain('3px');
  });
});