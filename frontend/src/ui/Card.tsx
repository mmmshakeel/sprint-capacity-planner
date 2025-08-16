import React from 'react';

interface CardProps {
  children: React.ReactNode;
  elevation?: number;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  elevation = 1,
  style,
  ...props
}) => {
  const elevationVar = `var(--md-sys-elevation-level${Math.min(elevation, 5)})`;
  
  return (
    <div 
      style={{
        backgroundColor: 'var(--md-sys-color-surface-container-low)',
        borderRadius: 'var(--md-sys-shape-corner-medium)',
        boxShadow: elevationVar,
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <div 
      style={{
        padding: '16px',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};