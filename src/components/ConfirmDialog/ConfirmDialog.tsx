import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';

export function ConfirmDialog({ open, title, description, saving, error, onClose, onConfirm }: {
  open: boolean; title: string; description: string; saving: boolean; error?: string | null;
  onClose: () => void; onConfirm: () => void;
}) {
  return <Modal open={open} title={title} saving={saving} onClose={onClose}>
    <p className="break-words text-sm text-muted">{description}</p>
    {error && <p role="alert" className="mt-3 text-sm text-danger">{error}</p>}
    <div className="mt-6 flex justify-end gap-2">
      <Button variant="outline" disabled={saving} onClick={onClose}>Cancelar</Button>
      <Button variant="danger" disabled={saving} onClick={onConfirm}>{saving ? 'Excluindo...' : 'Confirmar exclusão'}</Button>
    </div>
  </Modal>;
}
