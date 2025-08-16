import React from 'react';
import { createComponent } from '@lit/react';
import { MdFilledTextField } from '@material/web/textfield/filled-text-field';
import { MdOutlinedTextField } from '@material/web/textfield/outlined-text-field';

const MdFilledTextFieldReact = createComponent({
  tagName: 'md-filled-text-field',
  elementClass: MdFilledTextField,
  react: React,
});

const MdOutlinedTextFieldReact = createComponent({
  tagName: 'md-outlined-text-field',
  elementClass: MdOutlinedTextField,
  react: React,
});

interface TextFieldProps {
  variant?: 'filled' | 'outlined';
  label?: string;
  value?: string;
  onChange?: (e: any) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  type?: 'email' | 'number' | 'password' | 'search' | 'tel' | 'text' | 'url';
  name?: string;
  style?: React.CSSProperties;
}

export const TextField: React.FC<TextFieldProps> = ({
  variant = 'outlined',
  helperText,
  error,
  style,
  ...props
}) => {
  const { onChange, ...restProps } = props;
  
  const commonProps = {
    ...restProps,
    'supporting-text': helperText,
    error: error,
    onInput: onChange,
    style,
  };

  if (variant === 'filled') {
    return <MdFilledTextFieldReact {...commonProps} />;
  }

  return <MdOutlinedTextFieldReact {...commonProps} />;
};