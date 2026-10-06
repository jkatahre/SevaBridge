import { useEffect, useRef, type ReactNode } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  description?: ReactNode
  children?: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Prevent closing via backdrop/Escape (e.g. while submitting). */
  locked?: boolean
}

const SIZES = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

export default function Modal({ open, onClose, title, description, children, footer, size = 'md', locked }: ModalProps) {
  const panel = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && !locked && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, locked, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => !locked && onClose()} aria-hidden />
      <div
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        className={`relative flex max-h-[92vh] w-full ${SIZES[size]} flex-col rounded-t-2xl bg-white shadow-xl outline-none sm:rounded-xl`}
      >
        {(title || description) && (
          <div className="flex items-start gap-4 border-b border-slate-200 px-5 py-4">
            <div className="flex-1">
              {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
              {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
            </div>
            {!locked && (
              <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close">
                <X className="size-5" />
              </button>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-slate-200 px-5 py-3 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  )
}

interface ConfirmProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  danger?: boolean
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, busy, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      size="sm"
      locked={busy}
      footer={
        <>
          <button className="btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className={danger ? 'btn bg-red-600 text-white hover:bg-red-700' : 'btn-primary'} onClick={onConfirm} disabled={busy}>
            {busy ? 'Please wait…' : confirmLabel}
          </button>
        </>
      }
    >
      <div className="flex gap-3">
        {danger && (
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="size-5 text-red-600" />
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <div className="mt-1 text-sm text-slate-600">{message}</div>
        </div>
      </div>
    </Modal>
  )
}
