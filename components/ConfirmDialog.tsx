import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 text-center sm:p-0" style={{ zIndex: "var(--z-modal)" }}>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onCancel} 
        style={{ zIndex: "var(--z-overlay)" }}
      />

      <div className="relative transform overflow-hidden rounded-[28px] bg-surface text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-surface-border animate-fab-pop" style={{ zIndex: "var(--z-modal)" }}>
        <div className="bg-surface px-6 pb-6 pt-7">
          <div className="sm:flex sm:items-start">
            <div className="text-center sm:text-left w-full">
              <h3 className="text-xl font-black leading-6 text-text tracking-tight">{title}</h3>
              <div className="mt-3">
                <p className="text-sm font-medium text-muted leading-relaxed">{message}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-surface-mid px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
          <button
            type="button"
            className={`h-12 flex-1 rounded-2xl px-4 py-2 text-sm font-bold text-white shadow-ember active:scale-95 transition-all ${
              isDestructive ? 'bg-danger' : 'bg-success'
            }`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
          <button
            type="button"
            className="h-12 flex-1 rounded-2xl bg-surface px-4 py-2 text-sm font-bold text-text border border-surface-border active:scale-95 transition-all"
            onClick={onCancel}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
