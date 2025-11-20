import { NavLink, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronUp, ChevronDown, Edit, Trash, Check, X } from 'lucide-react'
import Modal from './Modal'
import { api } from '../lib/api'

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const ICON_SIZE = 22
  const nav = useNavigate()
  const [creating, setCreating] = useState(false)
  const [biz, setBiz] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/me')
        setBiz(data?.business_name || '')
        setUserName(data?.name || '')
      } catch {}
    })()
  }, [])
  const itemsTop: { to: string; label: string; icon: string }[] = [
    { to: '/new-chat', label: 'New Chat', icon: 'chat' },
    { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: '/team', label: 'Team', icon: 'team' },
    { to: '/finance', label: 'Finance', icon: 'finance' },
    { to: '/process', label: 'Process', icon: 'process' },
    { to: '/sales', label: 'Sales', icon: 'sales' },
    { to: '/founder', label: 'Founder', icon: 'founder' },
  ]

  // Chat history integrated section
  type ChatItem = { id: number; title?: string; created_at?: string; last_message_at?: string }
  const [historyOpen, setHistoryOpen] = useState(true)
  const [chats, setChats] = useState<ChatItem[]>([])
  const [loadingChats, setLoadingChats] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [titleDraft, setTitleDraft] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'rename' | 'delete' | null>(null)
  const [modalChat, setModalChat] = useState<ChatItem | null>(null)
  const [modalDraft, setModalDraft] = useState('')
  const [modalBusy, setModalBusy] = useState(false)
  const [plan, setPlan] = useState<string>('free')

  const loadChats = async () => {
    try {
      setLoadingChats(true)
      const { data } = await api.get('/chat')
      setChats(Array.isArray(data) ? data : [])
    } catch {
      // no-op
    } finally { setLoadingChats(false) }
  }
  const loadPlan = async () => {
    try {
      const { data } = await api.get('/tokens/usage')
      const p = (data?.plan || '').toString()
      if (p) setPlan(p)
    } catch {}
  }

  useEffect(() => { loadChats() }, [])
  useEffect(() => { loadPlan() }, [])

  // Re-load plan when user comes back from pricing page
  useEffect(() => {
    const timer = setInterval(loadPlan, 5000) // Poll every 5 seconds
    return () => clearInterval(timer)
  }, [])

  const getInitials = (name: string) => {
    if (!name) return ''
    const parts = name.split(' ').filter(Boolean)
    if (parts.length > 1) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return (parts[0]?.[0] || '').toUpperCase()
  }

  return (
    <aside
      className={`relative z-20 h-full border-r border-neutral-200/70 dark:border-neutral-800/50 bg-neutral-100/80 dark:bg-neutral-900/80 transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${
        collapsed ? 'w-16 p-2' : 'w-60 p-3'
      }`}
    >
      <div className={`flex items-center justify-between gap-2.5 mb-2 ${collapsed ? 'p-2' : 'p-2.5'}`}>
        {collapsed ? (
          <button onClick={onToggle} title={biz} className="w-7 h-7 flex items-center justify-center text-neutral-800 dark:text-neutral-200">
            <Icon name="business" size={ICON_SIZE} />
          </button>
        ) : (
          <div title={biz} className="flex items-center min-w-0 gap-2.5">
            <span className="w-7 flex items-center justify-center text-brand-500">
              <Icon name="business" size={ICON_SIZE} />
            </span>
            <span className="font-medium overflow-hidden text-ellipsis whitespace-nowrap text-neutral-800 dark:text-neutral-200">
              {biz || '—'}
            </span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            title="Collapse"
            className="w-7 h-7 flex items-center justify-center p-0 rounded-md bg-transparent border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <ChevronLeft size={ICON_SIZE} />
          </button>
        )}
      </div>
      <div className="h-px bg-neutral-200/70 dark:bg-neutral-800/50 my-1" />
      <div className="flex flex-col gap-1.5 min-h-0 flex-1">
        <nav className="grid gap-1.5">
          {itemsTop.map(i =>
            i.to === '/new-chat' ? (
              <button
                key={i.to}
                title={i.label}
                disabled={creating}
                onClick={async () => {
                  if (creating) return
                  setCreating(true)
                  try {
                    const { data } = await api.post('/chat/new')
                    const id = data?.chat_id || data?.id || data?.chat?.id
                    if (id) {
                      nav(`/chat/${id}`)
                      loadChats()
                    }
                  } finally {
                    setCreating(false)
                  }
                }}
                className={`flex items-center rounded-lg text-neutral-800 dark:text-neutral-200 transition-colors ${
                  collapsed ? 'p-2.5 justify-center' : 'p-2.5 gap-2.5'
                } hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <span className="w-7 flex items-center justify-center text-brand-500">
                  <Icon name={i.icon} size={ICON_SIZE} />
                </span>
                {!collapsed && <span>{creating ? 'Creating…' : i.label}</span>}
              </button>
            ) : (
              <NavLink
                key={i.to}
                to={i.to}
                title={i.label}
                className={({ isActive }) =>
                  `flex items-center rounded-lg text-neutral-800 dark:text-neutral-200 transition-colors ${
                    collapsed ? 'p-2.5 justify-center' : 'p-2.5 gap-2.5'
                  } ${
                    isActive
                      ? 'bg-brand-500/10 dark:bg-brand-400/10 text-brand-600 dark:text-brand-300'
                      : 'hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70'
                  }`
                }
              >
                <span className="w-7 flex items-center justify-center">
                  <Icon name={i.icon} size={ICON_SIZE} />
                </span>
                {!collapsed && <span>{i.label}</span>}
              </NavLink>
            ),
          )}
        </nav>

        {/* Chat History collapsible */}
        <button
          onClick={() => setHistoryOpen(o => !o)}
          className={`flex items-center rounded-lg text-neutral-800 dark:text-neutral-200 transition-colors w-full ${
            collapsed ? 'p-2.5 justify-center' : 'p-2.5 gap-2.5'
          } hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70`}
        >
          <span className="w-7 flex items-center justify-center text-brand-500">
            <Icon name={'chat'} size={ICON_SIZE} />
          </span>
          {!collapsed && <span className="flex-1 text-left">Chat History</span>}
          {!collapsed && (historyOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
        </button>

        <div className="flex-1 min-h-0 overflow-y-auto text-neutral-800 dark:text-neutral-200 [&::-webkit-scrollbar]:hidden">
          {historyOpen && !collapsed && (
            <div className="grid gap-1 text-sm">
              {loadingChats && <span className="opacity-70 px-2.5">Loading…</span>}
              {!loadingChats && chats.length === 0 && <span className="opacity-70 px-2.5">No chats</span>}
              {chats.map(c => (
                <div key={c.id} className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg">
                  <span className="w-7 flex items-center justify-center text-brand-500">
                    <Icon name={'chat'} size={18} />
                  </span>
                  {editId === c.id ? (
                    <>
                      <input
                        value={titleDraft}
                        onChange={e => setTitleDraft(e.target.value)}
                        className="flex-1 p-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900"
                      />
                      <button
                        title={'Save'}
                        onClick={async () => {
                          try {
                            await api.put(`/chat/${c.id}/title`, { title: titleDraft || '' })
                            setEditId(null)
                            setTitleDraft('')
                            loadChats()
                          } catch {}
                        }}
                        className="p-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-brand-500"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        title={'Cancel'}
                        onClick={() => {
                          setEditId(null)
                          setTitleDraft('')
                        }}
                        className="p-1.5 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-brand-500"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => nav(`/chat/${c.id}`)}
                        title={c.title || 'Untitled chat'}
                        className="flex-1 text-left bg-transparent border-none cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {c.title || 'Untitled chat'}
                      </button>
                      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title={'Rename'}
                          onClick={() => { setModalChat(c); setModalMode('rename'); setModalDraft(c.title || ''); setModalOpen(true) }}
                          className="p-1.5 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          title={'Delete'}
                          onClick={async () => { setModalChat(c); setModalMode('delete'); setModalOpen(true) }}
                          className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom profile section */}
        <div className="mt-auto border-t border-neutral-200/70 dark:border-neutral-800/50 pt-2 group">
          <NavLink
            to="/profile"
            className="flex items-center min-w-0 gap-2.5 p-2.5 rounded-lg hover:bg-neutral-200/70 dark:hover:bg-neutral-800/70"
          >
            <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs">
              {getInitials(userName)}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium overflow-hidden text-ellipsis whitespace-nowrap text-neutral-800 dark:text-neutral-200 text-sm">
                  {userName || 'Profile'}
                </p>
                <button onClick={() => nav('/pricing')} className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                  {plan ? `${String(plan).charAt(0).toUpperCase()+String(plan).slice(1)} Plan` : 'Free Plan'} — Pricing
                </button>
              </div>
            )}
          </NavLink>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={modalMode === 'rename' ? 'Rename Chat' : modalMode === 'delete' ? 'Delete Chat' : ''}
        onClose={() => { if (modalBusy) return; setModalOpen(false); setModalMode(null); setModalChat(null); setModalDraft('') }}
        footer={modalMode ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button disabled={modalBusy} onClick={() => { setModalOpen(false); setModalMode(null); setModalChat(null); setModalDraft('') }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}>Cancel</button>
            {modalMode === 'rename' && (
              <button disabled={modalBusy || !modalChat} onClick={async () => {
                if (!modalChat) return; setModalBusy(true)
                try { await api.put(`/chat/${modalChat.id}/title`, { title: modalDraft || '' }); setModalOpen(false); setModalMode(null); setModalChat(null); setModalDraft(''); loadChats() } finally { setModalBusy(false) }
              }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'linear-gradient(90deg, #702ABD, #305FB3)', color: 'white' }}>{modalBusy ? 'Saving…' : 'Save'}</button>
            )}
            {modalMode === 'delete' && (
              <button disabled={modalBusy || !modalChat} onClick={async () => {
                if (!modalChat) return; setModalBusy(true)
                try { await api.delete(`/chat/${modalChat.id}`); setModalOpen(false); setModalMode(null); setModalChat(null); loadChats() } finally { setModalBusy(false) }
              }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #b91c1c', background: '#ef4444', color: 'white' }}>{modalBusy ? 'Deleting…' : 'Delete'}</button>
            )}
          </div>
        ) : undefined}
      >
        {modalMode === 'rename' && (
          <div style={{ display: 'grid', gap: 8 }}>
            <label style={{ fontSize: 13, opacity: .8 }}>New title</label>
            <input value={modalDraft} onChange={e => setModalDraft(e.target.value)} placeholder={modalChat?.title || 'Untitled chat'} style={{ padding: 10, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }} />
          </div>
        )}
        {modalMode === 'delete' && (
          <div style={{ display: 'grid', gap: 8 }}>
            <p>Are you sure you want to delete “{modalChat?.title || 'Untitled chat'}”? This cannot be undone.</p>
          </div>
        )}
      </Modal>
    </aside>
  )
}
