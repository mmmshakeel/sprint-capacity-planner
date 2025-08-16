import React from 'react';

interface ChipProps {
  children?: React.ReactNode;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium';
  icon?: React.ReactNode;
  label?: string;
  color?: 'primary' | 'secondary' | 'default';
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'outlined',
  size = 'medium',
  icon,
  label,
  color = 'default',
}) => {
  const content = label || children;
  
  const colorStyles = {
    primary: {
      backgroundColor: variant === 'filled' ? 'var(--md-sys-color-primary-container)' : 'transparent',
      color: 'var(--md-sys-color-on-primary-container)',
      border: `1px solid var(--md-sys-color-primary)`,
    },
    secondary: {
      backgroundColor: variant === 'filled' ? 'var(--md-sys-color-secondary-container)' : 'transparent',
      color: 'var(--md-sys-color-on-secondary-container)',
      border: `1px solid var(--md-sys-color-secondary)`,
    },
    default: {
      backgroundColor: variant === 'filled' ? 'var(--md-sys-color-surface-variant)' : 'transparent',
      color: 'var(--md-sys-color-on-surface-variant)',
      border: `1px solid var(--md-sys-color-outline)`,
    },
  };

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: size === 'small' ? '4px 8px' : '6px 12px',
      borderRadius: 'var(--md-sys-shape-corner-small)',
      fontSize: size === 'small' 
        ? 'var(--md-sys-typescale-label-small-size)' 
        : 'var(--md-sys-typescale-label-medium-size)',
      fontWeight: '500',
      ...colorStyles[color],
    }}>
      {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
      {content}
    </div>
  );
};