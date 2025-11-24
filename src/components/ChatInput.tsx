import React, { forwardRef, useEffect, useRef, useState } from 'react'
import { Paperclip, X as XIcon, Mic, MicOff, Send } from 'lucide-react'

type Props = {
  input: string
  setInput: (v: string) => void
  send: () => void
  isRecording: boolean
  toggleRecording: () => void
  canSend: boolean
  files: File[]
  setFiles: (files: File[]) => void
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
  showSlashMenu?: boolean
  executeSlashCommand?: (cmd: string) => void
}

const ChatInput = forwardRef<HTMLTextAreaElement, Props>(function ChatInput(
  { input, setInput, send, isRecording, toggleRecording, canSend, files, setFiles, onKeyDown, showSlashMenu, executeSlashCommand },
  ref
) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const [selected, setSelected] = useState<string | null>(null)

  const setRefs = (el: HTMLTextAreaElement | null) => {
    textareaRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref && typeof (ref as any) === 'object') (ref as any).current = el
  }

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (!el) return
    try {
      const cs = window.getComputedStyle(el)
      const lineH = parseFloat(cs.lineHeight || '20') || 20
      const pt = parseFloat(cs.paddingTop || '0') || 0
      const pb = parseFloat(cs.paddingBottom || '0') || 0
      const maxPx = Math.ceil(lineH * 8 + pt + pb)
      el.style.height = 'auto'
      const next = Math.min(el.scrollHeight, maxPx)
      el.style.height = `${next}px`
      el.style.overflowY = el.scrollHeight > maxPx ? 'auto' : 'hidden'
    } catch {}
  }

  useEffect(() => { autoResize(textareaRef.current) }, [])
  useEffect(() => { autoResize(textareaRef.current) }, [input])

  return (
    <footer data-chat-input className="sticky bottom-0 inset-x-0 bg-white/80 dark:bg-neutral-900/80 backdrop-blur">
      <div className="max-w-[880px] mx-auto p-3">
        <div className="flex flex-col gap-2 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-2">
          <textarea
            ref={setRefs}
            value={input}
            onChange={e => { 
              if (selected) setSelected(null)
              setInput(e.target.value); 
              autoResize(e.currentTarget) 
            }}
            onInput={e => autoResize(e.currentTarget)}
            onKeyDown={onKeyDown}
            placeholder="Type a message..."
            className="w-full bg-transparent outline-none resize-none px-2 py-2 text-sm border-0 focus:ring-0"
            rows={1}
            style={{ minHeight: '2.25rem' }}
          />

          <div className="flex items-center gap-2">
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

            {['Sales', 'Finances', 'Team', 'Process', 'Founder'].map(item => (
              <button
                key={item}
                onClick={() => {
                  if (selected === item) {
                    setSelected(null)
                    setInput('')
                  } else {
                    setSelected(item)
                    setInput(item)
                  }
                }}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selected === item
                    ? 'bg-blue-600 text-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100'
                }`}
              >
                {item}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              {/* Voice toggle */}
              <button
                type="button"
                onClick={toggleRecording}
                title={isRecording ? 'Stop recording' : 'Start recording'}
                className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${isRecording ? 'bg-red-50 dark:bg-red-900/30' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
              >
                {isRecording ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4 text-neutral-700 dark:text-neutral-200" />}
              </button>

              <button
                onClick={send}
                disabled={!canSend}
                className={`h-8 px-4 inline-flex items-center justify-center rounded-md ${canSend ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
                title="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Selected files indicator */}
        {files.length > 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-600 dark:text-neutral-300">
            <span className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800">
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

        {/* Simple slash menu (optional) */}
        {showSlashMenu && executeSlashCommand && (
          <div className="mt-2 rounded-md bg-white dark:bg-neutral-900 shadow-sm p-2 text-sm">
            <div className="font-semibold mb-1 text-neutral-700 dark:text-neutral-200">Commands</div>
            <div className="flex flex-wrap gap-2">
              {['/summarize', '/explain', '/draft', '/analyze'].map(cmd => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => executeSlashCommand(cmd)}
                  className="px-2 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-100"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </footer>
  )
})

export default ChatInput
