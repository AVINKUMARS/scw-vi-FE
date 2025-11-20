import React, { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../lib/api'
import Markdown from './Markdown'
import { Paperclip, X as XIcon, ChevronDown, ThumbsUp, ThumbsDown, Share2, Copy as CopyIcon, Edit3 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

type Msg = { id: string; role: 'user' | 'assistant'; content: string }

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex py-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[520px] rounded-xl px-3 py-2 ${isUser ? 'text-white bg-gradient-to-r from-brand1 via-brand2 to-brand3' : 'bg-neutral-200/60 dark:bg-neutral-800/60'}`}>
        {isUser ? (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        ) : (
          <Markdown>{msg.content}</Markdown>
        )}
      </div>
    </div>
  )
}

export default function EmbeddedChat() {
  const nav = useNavigate()
  const location = useLocation()
  const [chatId, setChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const canSend = useMemo(() => (input.trim().length > 0 || files.length > 0) && !loading && !!chatId, [input, files.length, loading, chatId])
  const [thinkingId, setThinkingId] = useState<string | null>(null)
  const [atBottom, setAtBottom] = useState(true)
  const [hideDelay, setHideDelay] = useState(false)
  const hideTimerRef = useRef<number | null>(null)
  const [reactions, setReactions] = useState<Record<string, 'like' | 'dislike' | undefined>>({})

  // Load latest chat or create one
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/chat')
        const arr = Array.isArray(data) ? data : []
        const id = arr.length > 0 ? String(arr[0].id) : null
        let finalId = id
        if (!finalId) {
          const created = await api.post('/chat/new', { title: 'New Chat' })
          finalId = String(created.data?.chat_id)
        }
        setChatId(finalId)
      } catch (e: any) {
        setError(e?.response?.data?.error ?? 'Failed to load chat list')
      }
    })()
  }, [])

  // Load messages when chatId is ready
  useEffect(() => {
    if (!chatId) return
    ;(async () => {
      try {
        setError(null)
        const res = await api.get(`/chat/${chatId}/messages`)
        const raw = res.data || []
        const mapped: Msg[] = (Array.isArray(raw) ? raw : []).map((m: any, idx: number) => ({
          id: String(m.id ?? idx),
          role: (m.role ?? m.sender ?? 'assistant').toLowerCase() === 'user' ? 'user' : 'assistant',
          content: String(m.content ?? m.text ?? m.message ?? '')
        }))
        setMessages(mapped)
      } catch (e: any) {
        setError(e?.response?.data?.error ?? e?.message ?? 'Failed to load messages')
      }
    })()
  }, [chatId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
    // Keep the jump-to-latest icon visible briefly after new messages
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
    setHideDelay(true)
    hideTimerRef.current = window.setTimeout(() => {
      setHideDelay(false)
      setAtBottom(true)
    }, 1200)
  }, [messages.length])

  // Track whether the user is at/near the bottom to show the "jump to latest" button when scrolled up
  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const check = () => {
      const gap = el.scrollHeight - (el.scrollTop + el.clientHeight)
      const threshold = 2 // be strict so button is hidden when truly at bottom
      // If hideDelay is active, keep the icon visible regardless of exact bottom
      setAtBottom(hideDelay ? false : gap <= threshold)
    }
    check()
    el.addEventListener('scroll', check)
    return () => { el.removeEventListener('scroll', check) }
  }, [])

  const send = async () => {
    if (!canSend || !chatId) return
    const content = input.trim().length > 0 ? input.trim() : files.map(f => f.name).join(', ')
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    // Show thinking placeholder
    const tId = `typing-${crypto.randomUUID()}`
    setThinkingId(tId)
    const thinkingMsg: Msg = { id: tId, role: 'assistant', content: 'Thinking…' }
    setMessages((m) => [...m, thinkingMsg])
    try {
      const form = new FormData()
      form.append('chat_id', chatId)
      form.append('message', content)
      for (const f of files) {
        form.append('file', f)
      }
      const { data } = await api.post('/chat/send', form)
      const replyText = data?.reply ?? data?.answer ?? data?.message ?? data?.content
      // Remove thinking message
      setMessages((m) => m.filter(msg => msg.id !== tId))
      setThinkingId(null)
      if (replyText) {
        const reply: Msg = { id: crypto.randomUUID(), role: 'assistant', content: String(replyText) }
        setMessages((m) => [...m, reply])
      }
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to send message')
      // Remove thinking message on error
      setMessages((m) => m.filter(msg => msg.id !== tId))
      setThinkingId(null)
    } finally {
      setLoading(false)
      setFiles([])
      try { if (fileInputRef.current) fileInputRef.current.value = '' } catch {}
    }
  }

  return (
    <div className="h-full max-h-full min-h-0 w-full flex flex-col">
      <header className="px-3 py-2 border-b border-neutral-200/70 dark:border-neutral-800/60 bg-white/60 dark:bg-neutral-900/60 backdrop-blur shrink-0">
        <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Chat</div>
      </header>
      <div className="relative flex-1 min-h-0" style={{ background: 'var(--bg)' }}>
        <div ref={listRef} className="absolute inset-0 overflow-auto no-scrollbar pane-scroll p-3">
          {messages.map(m => (
            <div key={m.id} className="mb-1.5">
              <Bubble msg={m} />
              {/* Action toolbar */}
              {m.role === 'assistant' ? (
                <div className="mt-1 flex items-center gap-1.5 pl-2">
                  <button
                    type="button"
                    title="Like"
                    onClick={() => setReactions(prev => ({ ...prev, [m.id]: prev[m.id] === 'like' ? undefined : 'like' }))}
                    className={`inline-flex items-center justify-center w-6 h-6 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 ${reactions[m.id]==='like' ? 'text-blue-600' : 'text-neutral-600 dark:text-neutral-300'}`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Dislike"
                    onClick={() => setReactions(prev => ({ ...prev, [m.id]: prev[m.id] === 'dislike' ? undefined : 'dislike' }))}
                    className={`inline-flex items-center justify-center w-6 h-6 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60 ${reactions[m.id]==='dislike' ? 'text-red-600' : 'text-neutral-600 dark:text-neutral-300'}`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Copy"
                    onClick={async () => { try { await navigator.clipboard.writeText(m.content) } catch {} }}
                    className="inline-flex items-center justify-center w-6 h-6 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
                  >
                    <CopyIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    title="Share"
                    onClick={async () => {
                      try {
                        const shareData: any = { text: m.content }
                        if ((navigator as any).share) await (navigator as any).share(shareData)
                        else await navigator.clipboard.writeText(m.content)
                      } catch {}
                    }}
                    className="inline-flex items-center justify-center w-6 h-6 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                // User message: show edit icon
                <div className="mt-1 flex items-center gap-1.5 pr-2 justify-end">
                  <button
                    type="button"
                    title="Edit message"
                    onClick={() => { setInput(m.content); const el = document.querySelector('textarea'); (el as HTMLTextAreaElement | null)?.focus() }}
                    className="inline-flex items-center justify-center w-6 h-6 rounded text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-700/60"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))}
          {error && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>
          )}
        </div>
        {(!atBottom || hideDelay) && messages.length > 0 && (
          <button
            type="button"
            onClick={() => {
              listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
              if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current)
              setHideDelay(false)
              setAtBottom(true)
            }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 transform z-10 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 shadow hover:bg-white dark:hover:bg-neutral-800"
            title="Jump to latest"
            aria-label="Jump to latest"
          >
            <ChevronDown className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
          </button>
        )}
      </div>
      <footer className="border-t border-neutral-200/70 dark:border-neutral-800/60 p-2 shrink-0">
        {/* Page navigation chips (above chatbox) */}
        <nav className="mb-2 -mx-1 px-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { key: 'all', label: 'All', to: '/home' },
            { key: 'team', label: 'Team', to: '/team' },
            { key: 'finance', label: 'Finance', to: '/finance' },
            { key: 'process', label: 'Process', to: '/process' },
            { key: 'sales', label: 'Sales', to: '/sales' },
            { key: 'founder', label: 'Founder', to: '/founder' },
          ].map(tab => {
            const p = location.pathname.replace(/\/$/, '') || '/'
            const active = tab.key === 'all'
              ? p === '/' || p.startsWith('/home') || p.startsWith('/dashboard')
              : p.startsWith(`/${tab.key}`)
            return (
              <button
                key={tab.key}
                onClick={() => nav(tab.to)}
                className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  active
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white/70 dark:bg-neutral-800/70 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                style={{ marginLeft: 4, marginRight: 4 }}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>
        <div className="composer ml-2 flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 px-2 py-1">
          {/* Attach button */}
          <button
            type="button"
            title="Attach files"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <Paperclip className="w-4 h-4 text-neutral-700 dark:text-neutral-200" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              const list = Array.from(e.target.files || [])
              setFiles(list)
            }}
          />
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (canSend) send()
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-0 outline-none resize-none px-1 py-1 text-sm"
            rows={1}
            style={{ minHeight: '2.25rem', maxHeight: '6rem' }}
          />
          {/* Selected files indicator */}
          {files.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-neutral-600 dark:text-neutral-300">
              <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                {files.length} file{files.length > 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={() => { setFiles([]); try { if (fileInputRef.current) fileInputRef.current.value = '' } catch {} }}
                className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title="Clear attachments"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button
            onClick={send}
            disabled={!canSend}
            className={`h-9 px-3 text-sm font-semibold rounded-md ${canSend ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
          >Send</button>
        </div>
      </footer>
    </div>
  )
}
