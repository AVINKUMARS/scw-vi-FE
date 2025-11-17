import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import Icon from '../components/Icon'

type ChatItem = { id: number; title?: string; created_at?: string; last_message_at?: string }

export default function ChatHistory() {
  const [items, setItems] = useState<ChatItem[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const nav = useNavigate()

  const load = async () => {
    setLoading(true); setErr('')
    try {
      const { data } = await api.get('/chat')
      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) { setErr(e?.response?.data?.error ?? 'Failed to load chats') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const onEdit = (it: ChatItem) => { setEditingId(it.id); setEditingTitle(it.title ?? '') }
  const onCancel = () => { setEditingId(null); setEditingTitle('') }
  const onSave = async (id: number) => {
    try { await api.put(`/chat/${id}/title`, { title: editingTitle || '' }); await load(); onCancel() }
    catch (e: any) { setErr(e?.response?.data?.error ?? 'Failed to rename') }
  }
  const onDelete = async (id: number) => {
    if (!confirm('Delete this chat?')) return
    try { await api.delete(`/chat/${id}`); await load() } catch (e: any) { setErr(e?.response?.data?.error ?? 'Failed to delete') }
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Chat History</h2>
        <button onClick={load} disabled={loading}>Refresh</button>
      </div>
      {err && <p style={{ color: 'crimson' }}>{err}</p>}
      {items.length === 0 && !loading && <p>No chats yet.</p>}
      <div style={{ display: 'grid', gap: 8 }}>
        {items.map(it => (
          <div key={it.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, background: 'var(--panel)', display: 'grid', gap: 6 }}>
            {editingId === it.id ? (
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={editingTitle} onChange={e => setEditingTitle(e.target.value)} placeholder="Chat title" style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
                <button onClick={() => onSave(it.id)} title="Save" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}>
                  <Icon name="check" />
                </button>
                <button onClick={onCancel} title="Cancel" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}>
                  <Icon name="x" />
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <b>{it.title || 'Untitled chat'}</b>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    Created: {it.created_at || '—'}{it.last_message_at ? ` • Last: ${it.last_message_at}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => nav(`/chat/${it.id}`)} title="Open" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}>↗</button>
                  <button onClick={() => onEdit(it)} title="Rename" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}>
                    <Icon name="edit" />
                  </button>
                  <button onClick={() => onDelete(it.id)} title="Delete" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}>
                    <Icon name="trash" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
