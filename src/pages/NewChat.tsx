import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '../components/Icon'
import Markdown from '../components/Markdown'
import { api } from '../lib/api'

type Msg = { id: string; role: 'user' | 'assistant'; content: string }

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex py-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[720px] rounded-xl px-3 py-2 ${isUser ? 'text-white bg-gradient-to-r from-brand1 via-brand2 to-brand3' : 'border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'}`}>
        {isUser ? (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        ) : (
          <Markdown>{msg.content}</Markdown>
        )}
      </div>
    </div>
  )
}

export default function NewChat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [files, setFiles] = useState<File[]>([])

  const canSend = useMemo(() => (input.trim().length > 0 || files.length > 0) && !loading, [input, files.length, loading])

  useEffect(() => {
    // Auto-scroll to bottom on new messages
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length])

  // Auto-size textarea as user types (start single-line, grow without scrollbar)
  useEffect(() => {
    const el = textRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
    el.style.overflowY = 'hidden'
  }, [input])

  useEffect(() => {
    // Create a new chat on page load, then try to fetch existing messages
    (async () => {
      try {
        setError(null)
        const { data } = await api.post('/chat/new')
        const id = data?.id || data?.chat_id || data?.chat?.id
        if (!id) throw new Error('Invalid response from /chat/new')
        setChatId(String(id))
        try {
          const res = await api.get(`/chat/${id}/messages`)
          const raw = res.data || []
          const mapped: Msg[] = (Array.isArray(raw) ? raw : []).map((m: any, idx: number) => ({
            id: String(m.id ?? idx),
            role: (m.role ?? m.sender ?? 'assistant').toLowerCase() === 'user' ? 'user' : 'assistant',
            content: String(m.content ?? m.text ?? m.message ?? '')
          }))
          if (mapped.length) setMessages(mapped)
        } catch { /* ignore if empty */ }
      } catch (e: any) {
        setError(e?.response?.data?.error ?? e?.message ?? 'Failed to start chat')
      }
    })()
  }, [])

  const send = async () => {
    if (!canSend) return
    const content = input.trim().length > 0 ? input.trim() : files.map(f => f.name).join(', ')
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      // If files are attached, send each to /data/upload-analyze
      if (files.length > 0) {
        for (const f of files) {
          const form = new FormData()
          form.append('file', f)
          const { data } = await api.post('/data/upload-analyze', form)
          const metrics = data?.metrics || {}
          const meta = data?.meta || {}
          const cleaning = data?.cleaning || {}
          const parts: string[] = []
          if (data?.summary) parts.push(String(data.summary))
          const mline = [
            metrics.total_sales != null ? `total_sales: ${metrics.total_sales}` : null,
            metrics.bill_row_count != null ? `bill_row_count: ${metrics.bill_row_count}` : null,
            metrics.unique_bill_count != null ? `unique_bill_count: ${metrics.unique_bill_count}` : null,
          ].filter(Boolean).join(', ')
          if (mline) parts.push(`Metrics → ${mline}`)
          if (meta?.file_name) parts.push(`File: ${meta.file_name}`)
          const cline = [
            cleaning.dropped_blank_rows != null ? `dropped_blank_rows: ${cleaning.dropped_blank_rows}` : null,
            cleaning.dropped_totalish_second_col != null ? `dropped_totalish_second_col: ${cleaning.dropped_totalish_second_col}` : null,
            cleaning.dropped_summary_rows != null ? `dropped_summary_rows: ${cleaning.dropped_summary_rows}` : null,
            cleaning.final_rows_used != null ? `final_rows_used: ${cleaning.final_rows_used}` : null,
          ].filter(Boolean).join(', ')
          if (cline) parts.push(`Cleaning → ${cline}`)
          const reply: Msg = { id: crypto.randomUUID(), role: 'assistant', content: parts.join('\n') || 'Upload analyzed.' }
          setMessages(m => [...m, reply])
        }
        setFiles([])
      } else {
        // No files: use normal chat message API
        const cidNum = chatId ? Number(chatId) : undefined
        const payload: any = { chat_id: cidNum, message: content }
        if (!cidNum) delete payload.chat_id
        const { data } = await api.post('/chat/send', payload)
        if (Array.isArray(data?.messages)) {
          const mapped: Msg[] = data.messages.map((m: any, idx: number) => ({
            id: String(m.id ?? idx),
            role: (m.role ?? m.sender ?? 'assistant').toLowerCase() === 'user' ? 'user' : 'assistant',
            content: String(m.content ?? m.text ?? m.message ?? '')
          }))
          setMessages((m) => {
            const extra = mapped.filter(mm => mm.role === 'assistant')
            return [...m, ...extra]
          })
        } else {
          const replyText = data?.reply ?? data?.answer ?? data?.message ?? data?.content
          if (replyText) {
            const reply: Msg = { id: crypto.randomUUID(), role: 'assistant', content: String(replyText) }
            setMessages((m) => [...m, reply])
          }
        }
        const returnedId = data?.chat_id || data?.id || data?.chat?.id
        if (returnedId && !chatId) setChatId(String(returnedId))
      }
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }


  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateRows: '1fr auto' }}>
      {/* Messages */}
      <div ref={listRef} style={{ overflowY: 'auto', padding: 16 }}>
        {messages.length === 0 && (
          <div style={{ maxWidth: 720, margin: '14vh auto', textAlign: 'center', opacity: 0.7 }}>
            <h2 style={{ margin: 0 }}>Start a new conversation</h2>
            <p>Ask anything about your business processes, sales, or finance.</p>
          </div>
        )}
        {error && (
          <div style={{ maxWidth: 720, margin: '8px auto 0', color: 'crimson' }}>{error}</div>
        )}
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
        </div>
      </div>

      {/* Composer */}
      <div className="p-3">
        <div className="max-w-[880px] mx-auto grid gap-2">
          <div className="composer relative rounded-xl border border-neutral-300 dark:border-neutral-700 overflow-hidden focus-within:border-transparent">
            <textarea
              ref={textRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="w-full pr-12 pl-12 py-3 bg-transparent text-inherit resize-none border-0 outline-none"
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const list = e.target.files
                if (!list) return
                const arr = Array.from(list)
                setFiles(prev => [...prev, ...arr])
                e.currentTarget.value = ''
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              type="button"
              title="Add files"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 z-10"
            >
              <Icon name="plus" />
            </button>
            <button
              onClick={send}
              disabled={!canSend}
              title="Send"
              className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-md border border-neutral-300 dark:border-neutral-700 text-white ${canSend ? 'bg-gradient-to-r from-brand1 via-brand2 to-brand3' : 'bg-neutral-300 dark:bg-neutral-700 opacity-60'} z-10`}
              type="button"
            >
              <Icon name="send" />
            </button>
          </div>
          {files.length > 0 && (
            <div className="flex flex-wrap gap-1.5 text-sm">
              {files.map((f, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
                  {f.name}
                  <button type="button" title="Remove" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} className="w-5 h-5 inline-flex items-center justify-center rounded border border-neutral-300 dark:border-neutral-700 bg-transparent">
                    <Icon name="x" size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
          {/* Removed Clear button per request */}
        </div>
      </div>
    </div>
  )
}
