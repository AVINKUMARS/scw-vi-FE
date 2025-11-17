import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  children?: ReactNode
  footer?: ReactNode
}

export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      aria-modal
      role="dialog"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.28)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(560px, 92vw)',
          background: 'var(--bg)', color: 'var(--text)',
          border: '1px solid var(--border)', borderRadius: 12,
          boxShadow: '0 10px 30px rgba(0,0,0,0.18)'
        }}
      >
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <strong>{title}</strong>
        </div>
        <div style={{ padding: 16 }}>
          {children}
        </div>
        <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          {footer ?? (
            <button onClick={onClose} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}>Close</button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

