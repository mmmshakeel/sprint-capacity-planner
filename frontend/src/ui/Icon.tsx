import React from 'react';

interface IconProps {
  name: string;
  size?: number;
  style?: React.CSSProperties;
  filled?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  style,
  filled = false,
  ...props
}) => {
  return (
    <span 
      className={`material-symbols-${filled ? 'sharp' : 'outlined'}`}
      style={{
        fontSize: `${size}px`,
        color: 'var(--md-sys-color-on-surface)',
        userSelect: 'none',
        ...style
      }}
      {...props}
    >
      {name}
    </span>
  );
};