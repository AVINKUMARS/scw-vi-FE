import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  open: boolean
  title?: string
  onClose: () => void
  children?: ReactNode
  footer?: ReactNode
  noBackdrop?: boolean
}

export default function Modal({ open, title, onClose, children, footer, noBackdrop }: ModalProps) {
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
        background: noBackdrop ? 'transparent' : 'rgba(0,0,0,0.28)',
        backdropFilter: noBackdrop ? 'none' : 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 'min(560px, 92vw)',
          background: noBackdrop ? 'transparent' : 'var(--bg)',
          color: 'var(--text)',
          border: noBackdrop ? 'none' : '1px solid var(--border)',
          borderRadius: 12,
          boxShadow: noBackdrop ? 'none' : '0 10px 30px rgba(0,0,0,0.18)'
        }}
      >
        {title ? (
          <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
            <strong>{title}</strong>
          </div>
        ) : null}
        <div style={{ padding: 16 }}>
          {children}
        </div>
        {footer !== undefined ? (
          <div style={{ padding: 12, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}
