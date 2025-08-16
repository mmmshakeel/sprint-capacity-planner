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
        backgroundColor: 'var(--md-sys-color-surface-variant)',
        color: 'var(--md-sys-color-on-surface-variant)',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid var(--md-sys-color-outline-variant)',
        ...style
      }}
      {...props}
    >
      {headline && (
        <h1 
          className="m3-title-large m-0"
          style={{
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
