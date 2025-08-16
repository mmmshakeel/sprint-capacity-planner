import React from 'react';
import { createComponent } from '@lit/react';
import { MdFilledSelect } from '@material/web/select/filled-select';
import { MdOutlinedSelect } from '@material/web/select/outlined-select';
import { MdSelectOption } from '@material/web/select/select-option';

const MdFilledSelectReact = createComponent({
  tagName: 'md-filled-select',
  elementClass: MdFilledSelect,
  react: React,
});

const MdOutlinedSelectReact = createComponent({
  tagName: 'md-outlined-select',
  elementClass: MdOutlinedSelect,
  react: React,
});

const MdSelectOptionReact = createComponent({
  tagName: 'md-select-option',
  elementClass: MdSelectOption,
  react: React,
});

interface SelectProps {
  variant?: 'filled' | 'outlined';
  value?: string | number;
  onChange?: (value: string | number) => void;
  children: React.ReactNode;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  style?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({
  variant = 'outlined',
  children,
  onChange,
  value,
  ...props
}) => {
  const handleChange = (e: any) => {
    const target = e.target as any;
    if (onChange) {
      onChange(target.value);
    }
  };
  
  const commonProps = {
    ...props,
    value: String(value || ''),
    onInput: handleChange,
    children,
  };

  if (variant === 'filled') {
    return <MdFilledSelectReact {...commonProps} />;
  }

  return <MdOutlinedSelectReact {...commonProps} />;
};

export const SelectOption: React.FC<{
  value: string | number;
  children: React.ReactNode;
}> = ({ children, value, ...props }) => {
  return <MdSelectOptionReact value={String(value)} {...props}>{children}</MdSelectOptionReact>;
};