import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', danger, loading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-lg bg-amber-500/8 p-3">
        <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-500" />
        <p className="text-[13px] leading-relaxed text-ink-soft">This action is recorded in the audit log and may affect live operations.</p>
      </div>
    </Modal>
  )
}