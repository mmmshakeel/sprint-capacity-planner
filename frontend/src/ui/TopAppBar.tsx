import React from 'react';

interface TopAppBarProps {
  children: React.ReactNode;
  headline?: string;
  style?: React.CSSProperties;
  onHeadlineClick?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  children,
  headline,
  style,
  onHeadlineClick,
  ...props
}) => {
  return (
    <header 
      style={{
        backgroundColor: 'var(--md-sys-color-surface-container)',
        color: 'var(--md-sys-color-on-surface)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        boxShadow: 'var(--md-sys-elevation-level2)',
        ...style
      }}
      {...props}
    >
      {headline && (
        <h1 
          style={{
            margin: 0,
            fontSize: 'var(--md-sys-typescale-title-large-size)',
            fontWeight: 'var(--md-sys-typescale-title-large-weight)',
            lineHeight: 'var(--md-sys-typescale-title-large-line-height)',
            flexGrow: 1,
            cursor: onHeadlineClick ? 'pointer' : 'default'
          }}
          onClick={onHeadlineClick}
        >
          {headline}
        </h1>
      )}
      {children}
    </header>
  );
};