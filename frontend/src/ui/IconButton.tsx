import React from 'react';
import { createComponent } from '@lit/react';
import { MdIconButton } from '@material/web/iconbutton/icon-button';

const MdIconButtonReact = createComponent({
  tagName: 'md-icon-button',
  elementClass: MdIconButton,
  react: React,
});

interface IconButtonProps {
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  children,
  ariaLabel,
  ...props
}) => {
  return (
    <MdIconButtonReact 
      {...props}
      aria-label={ariaLabel}
    >
      {children}
    </MdIconButtonReact>
  );
};