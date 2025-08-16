import React from 'react';
import { createComponent } from '@lit/react';
import { MdFilledButton } from '@material/web/button/filled-button';
import { MdOutlinedButton } from '@material/web/button/outlined-button';
import { MdTextButton } from '@material/web/button/text-button';
import { MdElevatedButton } from '@material/web/button/elevated-button';
import { MdFilledTonalButton } from '@material/web/button/filled-tonal-button';

const MdFilledButtonReact = createComponent({
  tagName: 'md-filled-button',
  elementClass: MdFilledButton,
  react: React,
});

const MdOutlinedButtonReact = createComponent({
  tagName: 'md-outlined-button',
  elementClass: MdOutlinedButton,
  react: React,
});

const MdTextButtonReact = createComponent({
  tagName: 'md-text-button',
  elementClass: MdTextButton,
  react: React,
});

const MdElevatedButtonReact = createComponent({
  tagName: 'md-elevated-button',
  elementClass: MdElevatedButton,
  react: React,
});

const MdTonalButtonReact = createComponent({
  tagName: 'md-filled-tonal-button',
  elementClass: MdFilledTonalButton,
  react: React,
});

interface ButtonProps {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal' | 'danger';
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  style?: React.CSSProperties;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  children,
  style,
  ...props
}) => {
  const commonProps = {
    ...props,
    children,
    style,
  };

  switch (variant) {
    case 'outlined':
      return <MdOutlinedButtonReact {...commonProps} />;
    case 'text':
      return <MdTextButtonReact {...commonProps} />;
    case 'elevated':
      return <MdElevatedButtonReact {...commonProps} />;
    case 'tonal':
      return <MdTonalButtonReact {...commonProps} />;
    case 'danger':
      return (
        <MdFilledButtonReact
          {...commonProps}
          style={{
            ...style,
            '--md-sys-color-primary': 'var(--md-sys-color-error)',
            '--md-sys-color-on-primary': 'var(--md-sys-color-on-error)',
          } as React.CSSProperties}
        />
      );
    case 'filled':
    default:
      return <MdFilledButtonReact {...commonProps} />;
  }
};