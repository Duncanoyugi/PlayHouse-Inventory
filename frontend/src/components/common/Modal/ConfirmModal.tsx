import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from '../Buttons/Button'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  tone?: 'danger' | 'primary' | 'success'
  onConfirm: () => Promise<unknown> | unknown
  onClose: () => void
}

export function ConfirmModal({ isOpen, title, message, confirmLabel = 'Confirm', tone = 'danger', onConfirm, onClose }: ConfirmModalProps) {
  const [busy, setBusy] = useState(false)

  const run = async () => {
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      /* the caller shows the error toast; keep the dialog open so the user can retry */
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      locked={busy}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant={tone} onClick={run} isLoading={busy}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
        </span>
        <p className="text-sm leading-6 text-muted">{message}</p>
      </div>
    </Modal>
  )
}
