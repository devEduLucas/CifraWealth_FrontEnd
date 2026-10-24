import { useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useModalFocus } from '../../hooks/useModalFocus';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  saving?: boolean;
  stickyHeader?: boolean;
  size?: 'md' | 'lg';
}

export function Modal({
  open,
  title,
  onClose,
  children,
  saving = false,
  stickyHeader = false,
  size = 'md',
}: ModalProps) {
  const dialogRef = useModalFocus(open, saving, onClose);
  const titleId = useId();
  const close = () => {
    if (!saving) onClose();
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/60 p-4"
      onMouseDown={close}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={saving}
        tabIndex={-1}
        className={`max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-2xl border border-line bg-surface p-5 sm:p-6 ${size === 'lg' ? 'max-w-2xl' : 'max-w-md'} ${stickyHeader ? 'scroll-pt-24' : ''}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          className={
            stickyHeader
              ? 'sticky -top-5 z-10 -mx-5 -mt-5 mb-5 flex items-center justify-between gap-3 border-b border-line bg-surface px-5 py-4 sm:-top-6 sm:-mx-6 sm:-mt-6 sm:px-6'
              : 'mb-5 flex items-center justify-between'
          }
        >
          <h2
            id={titleId}
            className="min-w-0 text-lg font-bold text-foreground"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={close}
            disabled={saving}
            aria-label="Fechar"
            data-modal-initial-focus={stickyHeader ? '' : undefined}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-foreground"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
