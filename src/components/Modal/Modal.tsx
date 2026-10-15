import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useModalFocus } from '../../hooks/useModalFocus';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  saving?: boolean;
}

export function Modal({ open, title, onClose, children, saving = false }: ModalProps) {
  const dialogRef = useModalFocus(open, saving, onClose);
  const close = () => { if (!saving) onClose(); };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onMouseDown={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-line bg-surface p-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button
            type="button"
            onClick={close}
            disabled={saving}
            aria-label="Fechar"
            className="rounded-lg p-1 text-muted transition-colors hover:bg-hover hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
