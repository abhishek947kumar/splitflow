import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts } = useApp();

  if (!toasts.length) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        let Icon = Info;
        let borderColor = 'rgba(255, 255, 255, 0.15)';
        let iconColor = 'var(--primary)';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderColor = 'var(--positive-border)';
          iconColor = 'var(--positive)';
        } else if (toast.type === 'warning' || toast.type === 'error') {
          Icon = AlertCircle;
          borderColor = 'var(--negative-border)';
          iconColor = 'var(--negative)';
        }

        return (
          <div
            key={toast.id}
            className="animate-fade"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 18px',
              background: 'var(--bg-card-solid)',
              border: `1px solid ${borderColor}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              fontWeight: 500,
              maxWidth: '380px',
            }}
          >
            <Icon size={18} color={iconColor} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
