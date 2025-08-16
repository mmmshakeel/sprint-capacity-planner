import React from 'react';
import { createComponent } from '@lit/react';
import { MdDialog } from '@material/web/dialog/dialog';

const MdDialogReact = createComponent({
  tagName: 'md-dialog',
  elementClass: MdDialog,
  react: React,
});

interface DialogProps {
  open?: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  headline?: string;
  maxWidth?: string;
  fullWidth?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  children,
  headline,
  open,
  onClose,
  maxWidth,
  fullWidth,
}) => {
  if (!open) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--md-sys-color-surface-container-high)',
          borderRadius: 'var(--md-sys-shape-corner-extra-large)',
          padding: '24px',
          maxWidth: maxWidth === 'sm' ? '560px' : '800px',
          width: fullWidth ? '90vw' : 'auto',
          maxHeight: '90vh',
          overflow: 'auto',
          margin: '20px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {headline && (
          <h2 style={{
            margin: '0 0 16px 0',
            fontSize: 'var(--md-sys-typescale-headline-small-size)',
            fontWeight: 'var(--md-sys-typescale-headline-small-weight)',
            color: 'var(--md-sys-color-on-surface)'
          }}>
            {headline}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
};

export const DialogActions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ 
      display: 'flex', 
      gap: '8px', 
      justifyContent: 'flex-end',
      marginTop: '24px',
      paddingTop: '16px',
      borderTop: '1px solid var(--md-sys-color-outline-variant)'
    }}>
      {children}
    </div>
  );
};