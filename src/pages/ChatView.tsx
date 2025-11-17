import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import Icon from '../components/Icon'
import { api } from '../lib/api'
import Markdown from '../components/Markdown'

type Msg = { id: string; role: 'user' | 'assistant'; content: string }

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex py-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[720px] rounded-xl px-3 py-2 ${isUser ? 'text-white bg-gradient-to-r from-brand1 via-brand2 to-brand3' : 'bg-neutral-200/60 dark:bg-neutral-800/60'}`}
      >
        {isUser ? (
          <span className="whitespace-pre-wrap">{msg.content}</span>
        ) : (
          <Markdown>{msg.content}</Markdown>
        )}
      </div>
    </div>
  )
}

export default function ChatView() {
  const { id } = useParams()
  const chatId = id ? String(id) : null
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const textRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const canSend = useMemo(() => (input.trim().length > 0 || files.length > 0) && !loading && !!chatId, [input, files.length, loading, chatId])

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
  }, [messages.length])

  // Auto-size textarea as user types (grow without scrollbar)
  useEffect(() => {
    const el = textRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
    el.style.overflowY = 'hidden'
  }, [input])

  const send = async () => {
    if (!canSend || !chatId) return
    const content = input.trim().length > 0 ? input.trim() : files.map(f => f.name).join(', ')
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      // Use unified /chat/send endpoint for both text and file uploads
      const form = new FormData()
      form.append('chat_id', chatId)
      form.append('message', content)

      // Add all files to the form
      for (const f of files) {
        form.append('file', f)
      }

      const { data } = await api.post('/chat/send', form)

      // Handle the assistant reply
      const replyText = data?.reply ?? data?.answer ?? data?.message ?? data?.content
      if (replyText) {
        const reply: Msg = { id: crypto.randomUUID(), role: 'assistant', content: String(replyText) }
        setMessages((m) => [...m, reply])
      }

      // If there were ingestions (file processing results), add them as additional info
      if (data?.ingestions && Array.isArray(data.ingestions)) {
        const ingestionInfo: string[] = []
        for (const ing of data.ingestions) {
          if (ing.type === 'sales_metrics' && ing.metrics) {
            const lines = [`📊 Sales Metrics (${ing.file_name || 'File'}):`]
            if (ing.metrics.total_sales != null) lines.push(`  • Total Sales: ${ing.metrics.total_sales}`)
            if (ing.metrics.bill_row_count != null) lines.push(`  • Bill Rows: ${ing.metrics.bill_row_count}`)
            if (ing.metrics.unique_bill_count != null) lines.push(`  • Unique Bills: ${ing.metrics.unique_bill_count}`)
            ingestionInfo.push(lines.join('\n'))
          } else if (ing.type === 'knowledge') {
            ingestionInfo.push(`📚 Knowledge Base Updated (${ing.file_name || 'File'})\n  • ${ing.chunks_indexed || 0} chunks indexed`)
          } else if (ing.status === 'error') {
            ingestionInfo.push(`⚠️ Error processing ${ing.file_name || 'file'}: ${ing.notes || 'Unknown error'}`)
          }
        }
        if (ingestionInfo.length > 0) {
          const infoMsg: Msg = { id: crypto.randomUUID(), role: 'assistant', content: ingestionInfo.join('\n\n') }
          setMessages((m) => [...m, infoMsg])
        }
      }

      setFiles([])
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
      <div ref={listRef} style={{ overflowY: 'auto', padding: 16 }}>
        {messages.length === 0 && (
          <div style={{ maxWidth: 720, margin: '14vh auto', textAlign: 'center', opacity: 0.7 }}>
            <h2 style={{ margin: 0 }}>New conversation</h2>
            <p>Ask anything business-related. Press Enter to send.</p>
          </div>
        )}
        {error && (
          <div style={{ maxWidth: 720, margin: '8px auto 0', color: 'crimson' }}>{error}</div>
        )}
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          {messages.map((m) => (
            <Bubble key={m.id} msg={m} />
          ))}
          {loading && (
            <div className="flex py-1 justify-start">
              <div className="max-w-[720px] rounded-xl whitespace-pre-wrap px-3 py-2 bg-neutral-200/60 dark:bg-neutral-800/60 animate-pulse">
                Thinking...
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: 12 }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          {files.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {files.map((f, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--panel)', color: 'var(--text)' }}>
                  {f.name}
                  <button type="button" title="Remove" onClick={() => setFiles(prev => prev.filter((_, idx) => idx !== i))} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)' }}>
                    <Icon name="x" size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <div className="composer relative rounded-xl border border-neutral-300 dark:border-neutral-700 overflow-hidden focus-within:border-transparent">
            <textarea
              ref={textRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message..."
              rows={1}
              style={{
                width: '100%',
                padding: '12px 52px 12px 52px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                color: 'var(--text)',
                resize: 'none'
              }}
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              style={{ display: 'none' }}
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
              title="Add files"
              style={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)'
              }}
              type="button"
            >
              <Icon name="plus" />
            </button>
            <button
              onClick={send}
              disabled={!canSend}
              title="Send"
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)',
                opacity: canSend ? 1 : 0.6
              }}
              type="button"
            >
              <Icon name="send" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
