import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  X,
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Pencil,
  RotateCcw,
  Volume2,
  Square,
  ChevronDown,
  Paperclip,
  MoreVertical,
  Maximize2,
  MonitorPlay,
  ChevronLeft,
  ChevronRight,
  Minimize2
} from 'lucide-react'
import { api } from '../lib/api'
import Markdown from '../components/Markdown'
import SalesDataCard from '../components/SalesDataCard'

type Msg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  tag?: string;
  metadata?: any;
  form_type?: string;
  form_data?: any[];
}

const getLanguageFromText = (text: string): string => {
  const regionalRegex = /[\u0B80-\u0BFF\u0C00-\u0C7F\u0900-\u097F\u0D00-\u0D7F\u0C80-\u0CFF\u0980-\u09FF\u0A80-\u0AFF]/;
  return regionalRegex.test(text) ? 'regional' : 'en-US';
};

function ThinkingAnimation() {
  return (
    <div className="flex py-4 justify-start animate-in fade-in duration-500">
      <div className="relative group rounded-2xl bg-white/40 dark:bg-neutral-900/40 border border-white/20 dark:border-neutral-800 backdrop-blur-md shadow-sm p-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-100/50 dark:via-neutral-800/50 to-transparent -translate-x-[100%] group-hover:animate-[shimmer_2s_infinite]" />
        <div className="flex items-center gap-4 px-5 py-3 relative z-10">
          <div className="relative w-6 h-6 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-[2px] border-transparent border-t-brand1 border-r-brand1/50 animate-[spin_3s_linear_infinite]" />
            <div className="absolute inset-1 rounded-full border-[2px] border-transparent border-b-brand2 border-l-brand2/50 animate-[spin_2s_linear_infinite_reverse]" />
            <div className="w-1.5 h-1.5 bg-brand3 rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-xs font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-brand1 to-brand3 uppercase opacity-90">Thinking...</span>
            <span className="text-[10px] text-neutral-400 font-medium">Analyzing data stream...</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function Bubble({ msg, onEdit, onRegenerate, onMaximize, onPresent, onSalesDataSubmit, salesSubmitting, initialSales, disabledSalesSubmit }: { msg: Msg; onEdit: (text: string) => void; onRegenerate?: () => void; onMaximize: () => void; onPresent: () => void; onSalesDataSubmit?: (data: any[], msgId: string) => void; salesSubmitting?: Record<string, boolean>; initialSales?: Array<{ period: string; total_revenue?: number; bill_count?: number }>; disabledSalesSubmit?: boolean }) {
  const isUser = msg.role === 'user'
  const [liked, setLiked] = useState<boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node) &&
        moreMenuButtonRef.current &&
        !moreMenuButtonRef.current.contains(event.target as Node)
      ) {
        setShowMoreMenu(false);
      }
    }

    if (showMoreMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMoreMenu]);

  const languageCode = useMemo(() => getLanguageFromText(msg.content), [msg.content]);
  const showSpeakButton = languageCode === 'en-US';

  const handleCopy = () => {
    const textToCopy = contentRef.current?.innerText || msg.content
    navigator.clipboard.writeText(textToCopy)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleShare = () => {
    const textToShare = contentRef.current?.innerText || msg.content
    if (navigator.share) navigator.share({ title: 'Chat Insight', text: textToShare }).catch(() => { })
    else handleCopy()
  }

  const handleSpeak = () => {
    const synth = window.speechSynthesis;
    if (isSpeaking) { synth.cancel(); setIsSpeaking(false); return; }
    const text = contentRef.current?.innerText || msg.content;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    let selectedVoice = enVoices.find(v => v.name.includes('Google US English')) || enVoices.find(v => v.name.includes('Microsoft Zira')) || enVoices.find(v => v.name.includes('Google')) || enVoices.find(v => v.name.includes('Natural')) || enVoices[0];
    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    synth.speak(utterance);
    setIsSpeaking(true);
  }

  const handleLike = () => { setLiked(prev => (prev === true ? null : true)); setShowFeedback(false); }
  const handleDislike = () => { const newState = liked === false ? null : false; setLiked(newState); setShowFeedback(newState === false); }
  const submitFeedback = () => { setFeedbackSubmitted(true); setTimeout(() => { setShowFeedback(false); setFeedbackSubmitted(false); setFeedback(''); }, 1500); }

  const salesFormPrompt = (msg as any)?.metadata?.forms?.sales
  return (
    <div className={`group flex flex-col py-2 ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        ref={contentRef}
        className={`max-w-[720px] rounded-2xl px-5 py-3.5 shadow-sm transition-all duration-200 relative ${isUser
          ? 'text-white bg-gradient-to-br from-brand1 via-brand2 to-brand3 rounded-tr-sm'
          : 'bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-tl-sm'
          } [&_ol]:list-decimal [&_ol]:ml-5 [&_ul]:list-disc [&_ul]:ml-5`}
      >
        {isUser ? <span className="whitespace-pre-wrap font-light leading-relaxed">{msg.content}</span> : <Markdown>{msg.content}</Markdown>}
      </div>

      {/* Sales Data Card - show when server provides forms.sales or when history includes a submitted sales form */}
      {!isUser && onSalesDataSubmit && (salesFormPrompt || (initialSales && initialSales.length)) && (
        <div className="mt-3 w-full flex justify-start">
          <div className="max-w-[520px]">
            <SalesDataCard prompt={salesFormPrompt} initial={initialSales as any} disabledSubmit={disabledSalesSubmit} onSubmit={(rows) => onSalesDataSubmit(rows, msg.id)} />
            {salesSubmitting?.[msg.id] && <div className="mt-2"><ThinkingAnimation /></div>}
          </div>
        </div>
      )}

      {isUser && (
        <div className="mt-1 px-1 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={() => onEdit(msg.content)} className="p-1.5 rounded-lg text-neutral-400 hover:text-brand1 hover:bg-brand1/10 transition-all" title="Edit">
            <Pencil size={14} />
          </button>
          <div className="w-px h-3 bg-neutral-200 dark:bg-neutral-800" />
          <button onClick={handleCopy} className="p-1.5 rounded-lg text-neutral-400 hover:text-brand1 hover:bg-brand1/10 transition-all" title="Copy">
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}

      {!isUser && (
        <div className="mt-2 flex items-center gap-1 px-1 relative">
          {showSpeakButton && (
            <button onClick={handleSpeak} className={`p-1.5 rounded-lg transition-all ${isSpeaking ? 'text-brand2 bg-brand2/10 ring-1 ring-brand2/20' : 'text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`} title="Read aloud">
              {isSpeaking ? <Square size={15} fill="currentColor" /> : <Volume2 size={15} />}
            </button>
          )}
          <button onClick={handleCopy} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all" title="Copy">{isCopied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}</button>
          <button onClick={handleLike} className={`p-1.5 rounded-lg transition-all ${liked === true ? 'text-green-600 bg-green-50 dark:bg-green-900/20' : 'text-neutral-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`} title="Like"><ThumbsUp size={15} /></button>
          <button onClick={handleDislike} className={`p-1.5 rounded-lg transition-all ${liked === false ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'}`} title="Dislike"><ThumbsDown size={15} /></button>
          {onRegenerate && (
            <button onClick={onRegenerate} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all" title="Regenerate">
              <RotateCcw size={15} />
            </button>
          )}

          <button ref={moreMenuButtonRef} onClick={() => setShowMoreMenu(!showMoreMenu)} className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all" title="More">
            <MoreVertical size={15} />
          </button>

          {showMoreMenu && (
            <div ref={moreMenuRef} className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 z-30">
              <button onClick={() => { onMaximize(); setShowMoreMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-brand1/10 hover:text-brand1 transition-colors"><Maximize2 size={14} /> Focus View</button>
              <button onClick={() => { onPresent(); setShowMoreMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-purple-600/10 hover:text-purple-600 transition-colors"><MonitorPlay size={14} /> Presentation Mode</button>
            </div>
          )}
        </div>
      )}

      {!isUser && showFeedback && (
        <div className="mt-3 w-full max-w-[480px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 shadow-sm animate-in slide-in-from-top-2">
          {feedbackSubmitted ? (
            <div className="text-sm text-green-600 flex items-center gap-2 font-medium"><Check size={16} /><span>Feedback received. Thank you!</span></div>
          ) : (
            <>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Provide Feedback</p>
              <textarea className="w-full text-sm p-3 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 focus:ring-2 focus:ring-brand1/20 focus:border-brand1 outline-none resize-none transition-all" rows={2} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What was inaccurate or unhelpful?" />
              <div className="flex justify-end gap-2 mt-3">
                <button onClick={() => setShowFeedback(false)} className="text-xs px-3 py-1.5 rounded-md font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">Cancel</button>
                <button onClick={submitFeedback} className="text-xs px-4 py-1.5 rounded-md font-medium bg-neutral-900 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity">Submit Feedback</button>
              </div>
            </>
          )}
        </div>
      )}
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
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement | null>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [focusedMsg, setFocusedMsg] = useState<Msg | null>(null)
  const [presentingMsg, setPresentingMsg] = useState<Msg | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [salesSubmittingMap, setSalesSubmittingMap] = useState<Record<string, boolean>>({})
  
  const canSend = useMemo(() => (input.trim().length > 0 || files.length > 0) && !loading && !!chatId, [input, files.length, loading, chatId])

  // Slide logic for presentation mode
  const slides = useMemo(() => {
    if (!presentingMsg) return [];
    const text = presentingMsg.content;
    if (text.includes('---')) return text.split('---').map(s => s.trim()).filter(Boolean);
    if (text.match(/^#{1,2} /m)) return text.split(/(?=^#{1,2} )/m).map(s => s.trim()).filter(Boolean);
    if (text.length > 600) {
      const paragraphs = text.split('\n\n');
      const chunks = [];
      let currentChunk = '';
      for (const p of paragraphs) {
        if ((currentChunk + p).length > 500) {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = p;
        } else {
          currentChunk += (currentChunk ? '\n\n' : '') + p;
        }
      }
      if (currentChunk) chunks.push(currentChunk);
      return chunks;
    }
    return [text];
  }, [presentingMsg]);

  const nextSlide = () => setCurrentSlide(p => Math.min(p + 1, slides.length - 1));
  const prevSlide = () => setCurrentSlide(p => Math.max(p - 1, 0));

  useEffect(() => {
    if (!presentingMsg) {
      document.body.style.overflow = 'auto';
      return;
    }
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') setPresentingMsg(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'auto';
    }
  }, [presentingMsg, slides.length]);

  useEffect(() => { if (presentingMsg) setCurrentSlide(0); }, [presentingMsg]);

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
        try { localStorage.setItem('last_chat_id', String(finalId)) } catch {}
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
          content: String(m.content ?? m.text ?? m.message ?? ''),
          tag: m.tag,
          metadata: m.metadata || m,
          form_type: m.form_type,
          form_data: Array.isArray(m.form_data) ? m.form_data : undefined,
        }))
        setMessages(mapped)
        try { localStorage.setItem('last_chat_id', String(chatId)) } catch {}
      } catch (e: any) {
        setError(e?.response?.data?.error ?? e?.message ?? 'Failed to load messages')
      }
    })()
  }, [chatId])

  useEffect(() => { scrollToBottom() }, [messages.length, loading])

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 150);
  };

  const scrollToBottom = () => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }

  const handleEdit = (text: string) => { setInput(text); }

  const handleRegenerate = async () => {
    if (loading || !chatId) return
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user')
    if (!lastUserMsg) return
    setLoading(true)
    try {
      const { data } = await api.post('/chat/send', { chat_id: Number(chatId), message: lastUserMsg.content })
      const replyText = data?.reply ?? data?.answer ?? data?.message ?? data?.content
      const tag = data?.tag ?? undefined
      const metadata = data || {}
      if (replyText) setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', content: String(replyText), tag, metadata }])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const handleSalesDataSubmit = async (salesData: any[], sourceMsgId?: string) => {
    if (!chatId) return
    const norm = salesData.map(r => ({ period: r.period, total_revenue: r.total_revenue ?? r.revenue, bill_count: r.bill_count ?? r.billCount }))
    const message = `My last ${norm.length} months of sales`
    if (sourceMsgId) setSalesSubmittingMap(prev => ({ ...prev, [sourceMsgId]: true }))
    try {
      const { data } = await api.post('/chat/send', { chat_id: Number(chatId), message, sales_form: norm })
      const replyText = data?.reply ?? data?.answer ?? data?.message ?? data?.content
      const tag = data?.tag ?? undefined
      const metadata = data || {}
      if (replyText) setMessages((m) => [...m, { id: crypto.randomUUID(), role: 'assistant', content: String(replyText), tag, metadata }])
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to submit sales data')
    } finally {
      if (sourceMsgId) setSalesSubmittingMap(prev => ({ ...prev, [sourceMsgId]: false }))
    }
  }

  const send = async () => {
    if (!canSend || !chatId) return
    const content = input.trim().length > 0 ? input.trim() : files.map(f => f.name).join(', ')
    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content }
    setMessages((m) => [...m, userMsg])
    setInput(''); setLoading(true)
    const filesToSend = [...files]; setFiles([]);
    try {
      const { data } = await api.post('/chat/send', { chat_id: Number(chatId), message: content })
      const replyText = data?.reply ?? data?.answer ?? data?.message ?? data?.content
      const tag = data?.tag ?? undefined
      const metadata = data || {}
      if (replyText) setMessages((m) => [...m, { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: String(replyText),
        tag,
        metadata
      }])
      if (data?.ingestions && Array.isArray(data.ingestions)) {
        const ingestionInfo: string[] = []
        for (const ing of data.ingestions) ingestionInfo.push(`Processed: ${ing.file_name || 'File'}`);
        if (ingestionInfo.length > 0) setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: ingestionInfo.join('\n') }])
      }
    } catch (e: any) { 
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to send message') 
    } finally { 
      setLoading(false);
      try { if (fileInputRef.current) fileInputRef.current.value = '' } catch {}
    }
  }

  return (
    <div className="h-full max-h-full min-h-0 w-full flex flex-col">
      {/* Focus Mode Modal */}
      {focusedMsg && (
        <div className="fixed inset-0 z-[150] bg-white/95 dark:bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 pt-16 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-4xl max-h-[85vh] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
              <span className="font-semibold text-neutral-900 dark:text-white">Focused View</span>
              <button onClick={() => setFocusedMsg(null)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"><Minimize2 size={20} /></button>
            </div>
            <div className="overflow-y-auto p-8 text-lg leading-relaxed text-neutral-800 dark:text-neutral-200 prose-ol:list-decimal prose-ol:ml-5 prose-ul:list-disc prose-ul:ml-5">
              <Markdown>{focusedMsg.content}</Markdown>
            </div>
          </div>
        </div>
      )}

      {/* Presentation Slide Mode */}
      {presentingMsg && slides.length > 0 && (
        <div className="fixed inset-0 z-[999999] bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col animate-in fade-in duration-500">
          <button
            onClick={() => setPresentingMsg(null)}
            className="absolute top-20 right-10 z-[1000000] p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all shadow-sm group"
            title="Close Presentation"
          >
            <X size={20} className="group-hover:scale-110 transition-transform duration-300" />
          </button>
          <div className="flex-1 flex items-center justify-center overflow-hidden relative w-full h-full">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="absolute left-8 md:left-32 z-[1000000] p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-0 disabled:pointer-events-none transition-all backdrop-blur-sm text-neutral-900 dark:text-white"
            >
              <ChevronLeft size={40} />
            </button>
            <div key={currentSlide} className="max-w-4xl w-full px-8 h-[75vh] flex items-center justify-center animate-in slide-in-from-right-8 duration-500">
              <div className="prose dark:prose-invert prose-2xl max-w-none w-full text-center leading-relaxed max-h-full overflow-y-auto px-6 py-8 scrollbar-hide prose-ol:list-decimal prose-ol:text-left prose-ul:list-disc prose-ul:text-left prose-li:marker:text-brand1">
                <Markdown>{slides[currentSlide]}</Markdown>
              </div>
            </div>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="absolute right-8 md:right-32 z-[1000000] p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-0 disabled:pointer-events-none transition-all backdrop-blur-sm text-neutral-900 dark:text-white"
            >
              <ChevronRight size={40} />
            </button>
          </div>
          <div className="h-20 flex flex-col items-center justify-center gap-3 pb-6 bg-gradient-to-t from-white/80 dark:from-black/80 to-transparent">
            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-16 bg-brand1' : 'w-3 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400 dark:hover:bg-neutral-600 cursor-pointer'}`} onClick={() => setCurrentSlide(idx)} />
              ))}
            </div>
            <span className="text-xs text-neutral-500 uppercase tracking-widest font-semibold">Slide {currentSlide + 1} of {slides.length}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-3 py-2 border-b border-neutral-200/70 dark:border-neutral-800/60 bg-white/60 dark:bg-neutral-900/60 backdrop-blur shrink-0">
        <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">Chat</div>
      </header>

      {/* Message List */}
      <div className="relative flex-1 min-h-0" style={{ background: 'var(--bg)' }}>
        <div ref={listRef} onScroll={handleScroll} className="absolute inset-0 overflow-auto no-scrollbar pane-scroll p-3">
          <div className="max-w-[880px] mx-auto space-y-6 relative">
          {messages.map((m, idx) => {
            const next = messages[idx + 1]
            const initialSales = (m.role === 'assistant' && next && next.role === 'user' && (next as any).form_type === 'sales' && Array.isArray((next as any).form_data)) ? (next as any).form_data : undefined
            const disabledSalesSubmit = !!initialSales
            return (
              <Bubble
                key={m.id}
                msg={m}
                onEdit={handleEdit}
                onMaximize={() => setFocusedMsg(m)}
                onPresent={() => setPresentingMsg(m)}
                onRegenerate={(!loading && m.role === 'assistant' && idx === messages.length - 1) ? handleRegenerate : undefined}
                onSalesDataSubmit={handleSalesDataSubmit}
                salesSubmitting={salesSubmittingMap}
                {...(initialSales ? { initialSales, disabledSalesSubmit } : {})}
              />
            )
          })}
            {loading && <ThinkingAnimation />}
          </div>
          {error && (
            <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</div>
          )}
        </div>
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 p-2 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-brand1 transition-all animate-in fade-in slide-in-from-bottom-4"
          >
            <ChevronDown size={20} />
          </button>
        )}
      </div>
      {/* Footer */}
      <footer className="border-t border-neutral-200/70 dark:border-neutral-800/60 p-2 shrink-0">
        {/* Page navigation chips */}
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

        {/* Input composer */}
        <div className="composer ml-2 flex items-center gap-2 border border-neutral-300 dark:border-neutral-700 rounded-md bg-white dark:bg-neutral-900 px-2 py-1">
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
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <button
            onClick={send}
            disabled={!canSend}
            className={`h-9 px-3 text-sm font-semibold rounded-md ${canSend ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
          >
            <Send size={16} />
          </button>
        </div>
      </footer>
    </div>
  )
}
