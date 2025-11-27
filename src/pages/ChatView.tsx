import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import {
  X,
  Plus,
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Share2,
  Pencil,
  RotateCcw,
  Volume2,
  Square,
  Mic,
  MicOff,
  Download,
  ChevronDown,
  Trash2,
  FileText,
  Zap,
  HelpCircle,
  Maximize2,
  Minimize2,
  MonitorPlay,
  ChevronLeft,
  ChevronRight,
  MoreVertical
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

// --- Constants & Helpers ---
const STARTER_QUESTIONS = [
  { icon: <Zap size={16} />, label: "Analyze Sales", prompt: "Analyze the sales trend for the last quarter." },
  { icon: <FileText size={16} />, label: "Summarize", prompt: "Summarize the key financial metrics from the file." },
  { icon: <Share2 size={16} />, label: "LinkedIn Post", prompt: "Draft a LinkedIn post about our Q3 results." },
  { icon: <HelpCircle size={16} />, label: "Explain KPI", prompt: "Explain 'CAC' and how to calculate it." }
]

// Helper to clean Markdown symbols (**bold**, # Header, etc) for plain text export
const cleanMarkdown = (text: string) => {
  return text
    .replace(/\*\*/g, '')           // Remove bold
    .replace(/__/g, '')             // Remove underline/bold
    .replace(/^#+\s*/gm, '')        // Remove Headers (#)
    .replace(/`/g, '')              // Remove code ticks
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links, keep text
    .trim();
};

const getLanguageFromText = (text: string): string => {
  const regionalRegex = /[\u0B80-\u0BFF\u0C00-\u0C7F\u0900-\u097F\u0D00-\u0D7F\u0C80-\u0CFF\u0980-\u09FF\u0A80-\u0AFF]/;
  return regionalRegex.test(text) ? 'regional' : 'en-US';
};

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

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

      {/* Sales Data Card - show only when server provides forms.sales */}
      {!isUser && onSalesDataSubmit && (salesFormPrompt || (initialSales && initialSales.length)) && (
        <div className="mt-3 w-full flex justify-start">
          <div>
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

import ChatInput from '../components/ChatInput';



export default function ChatView() {

  const { id } = useParams()
  const location = useLocation()

  const chatId = id ? String(id) : null

  const [messages, setMessages] = useState<Msg[]>([])

  const [input, setInput] = useState('')

  const [loading, setLoading] = useState(false)

  const [files, setFiles] = useState<File[]>([])
  const [pendingThinking, setPendingThinking] = useState(false)

  const [_error, setError] = useState<string | null>(null)

  const [isRecording, setIsRecording] = useState(false)

  const [showSlashMenu, setShowSlashMenu] = useState(false)

  const [showScrollButton, setShowScrollButton] = useState(false)
  const [salesSubmittingMap, setSalesSubmittingMap] = useState<Record<string, boolean>>({})



  const [focusedMsg, setFocusedMsg] = useState<Msg | null>(null)

  const [presentingMsg, setPresentingMsg] = useState<Msg | null>(null)

  const [currentSlide, setCurrentSlide] = useState(0)



  const listRef = useRef<HTMLDivElement | null>(null)
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null)
  const [scrollBtnBottom, setScrollBtnBottom] = useState<number>(128)



  const recognition = useMemo(() => {

    if (typeof SpeechRecognition !== 'undefined') {

      const rec = new SpeechRecognition();

      rec.continuous = false; rec.interimResults = false; rec.lang = 'en-US';

      return rec;

    }

    return null;

  }, []);



  // --- Improved Slide Logic ---

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



  const canSend = useMemo(() => (input.trim().length > 0 || files.length > 0) && !loading && !!chatId, [input, files.length, loading, chatId])



  useEffect(() => {

    const loadVoices = () => { window.speechSynthesis.getVoices() };

    loadVoices();

    if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = loadVoices;

  }, []);



  useEffect(() => {

    if (!chatId) return

      ; (async () => {

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

        } catch (e: any) { setError(e?.response?.data?.error ?? e?.message ?? 'Failed to load messages') }

      })()

  }, [chatId])



  useEffect(() => { scrollToBottom() }, [messages.length, loading])

  // If login triggered an auto-send, show a Thinking animation and poll briefly for the assistant reply
  useEffect(() => {
    if (!chatId) return
    let alive = true
    try {
      const pending = localStorage.getItem('pending_thinking_chat')
      const shouldThink = pending && pending === String(chatId)
      setPendingThinking(!!shouldThink)
      if (shouldThink) setLoading(true)
      if (!shouldThink) return
    } catch {}
    const iv = window.setInterval(async () => {
      if (!alive) return
      try {
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
        const hasAssistant = mapped.some(m => m.role === 'assistant')
        if (hasAssistant) {
          try { localStorage.removeItem('pending_thinking_chat') } catch {}
          setPendingThinking(false)
          setLoading(false)
          window.clearInterval(iv)
        }
      } catch {
        // ignore fetch errors during polling
      }
    }, 1500)
    return () => { alive = false; window.clearInterval(iv) }
  }, [chatId])



  const handleScroll = () => {

    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;

    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 150);

  };



  // Keep the scroll-to-bottom button above the input area, even as it grows
  useEffect(() => {
    const el = document.querySelector('footer[data-chat-input]') as HTMLElement | null
    if (!el) return
    const update = () => {
      try {
        const h = el.getBoundingClientRect().height || 0
        setScrollBtnBottom(Math.max(72, Math.ceil(h + 12)))
      } catch {}
    }
    update()
    const RO: any = (window as any).ResizeObserver
    const ro = RO ? new RO(() => update()) : null
    if (ro) ro.observe(el)
    window.addEventListener('resize', update)
    return () => { if (ro) ro.disconnect(); window.removeEventListener('resize', update) }
  }, [input])



  const scrollToBottom = () => {
    const el = listRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    try { chatInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) } catch {}
    chatInputRef.current?.focus()
  }

  const toggleRecording = () => {

    if (!recognition) { alert("Voice input not supported."); return; }

    if (isRecording) { recognition.stop(); setIsRecording(false); }

    else {

      setIsRecording(true); recognition.start();

      recognition.onresult = (event: any) => {

        const transcript = event.results[0][0].transcript;

        setInput(prev => (prev ? prev + ' ' + transcript : transcript));

        setIsRecording(false);

      };

      recognition.onerror = () => setIsRecording(false); recognition.onend = () => setIsRecording(false);

    }

  }



  // UPDATED: Export with "ScalingWolf AI" label

  const handleDownload = () => {

    if (messages.length === 0) return;

    const lines = messages.map(m => {

      const cleanContent = cleanMarkdown(m.content);

      // Here is the change for the label

      return `[${m.role === 'user' ? 'User' : 'Scalingwolf AI'}] ${cleanContent}\n${'-'.repeat(20)}\n`;

    });

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url; a.download = `Transcript_${chatId}.txt`;

    document.body.appendChild(a); a.click(); document.body.removeChild(a);

  }



  const executeSlashCommand = (cmd: string) => {

    setShowSlashMenu(false);

    if (cmd === 'clear') { setMessages([]); setInput(''); }

    else if (cmd === 'export') { handleDownload(); setInput(''); }

    else if (cmd === 'help') { setMessages(m => [...m, { id: crypto.randomUUID(), role: 'assistant', content: 'Available Commands:\n/clear - Clear chat\n/export - Download transcript\n/help - Show commands' }]); setInput(''); }

  }




  const handleStarterClick = (prompt: string) => { setInput(prompt); chatInputRef.current?.focus(); }
  const handleEdit = (text: string) => { setInput(text); chatInputRef.current?.focus(); }



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

      if (replyText) setMessages((m) => [...m, { 
        id: crypto.randomUUID(), 
        role: 'assistant', 
        content: String(replyText),
        tag,
        metadata
      }])

    } catch (e) { console.error(e) } finally { setLoading(false) }

  }



  const send = async () => {

    if (!canSend || !chatId) return

    const content = input.trim().length > 0 ? input.trim() : files.map(f => f.name).join(', ')

    const userMsg: Msg = { id: crypto.randomUUID(), role: 'user', content }

    setMessages((m) => [...m, userMsg])

    setInput(''); setLoading(true)

    const filesToSend = [...files]; setFiles([]);

    try {
      // JSON body per backend expectations
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

    } catch (e: any) { setError(e?.response?.data?.error ?? e?.message ?? 'Failed to send message') }

    finally { setLoading(false) }

  }



  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }

  const handleSalesDataSubmit = async (salesData: Array<any>, sourceMsgId?: string) => {
    if (!chatId) return
    // normalize possible key variants from legacy UI
    const norm = salesData.map(r => ({
      period: r.period,
      total_revenue: r.total_revenue ?? r.revenue,
      bill_count: r.bill_count ?? r.billCount,
    }))
    // Indicate local thinking state under the card; do not append a user message
    if (sourceMsgId) setSalesSubmittingMap(prev => ({ ...prev, [sourceMsgId]: true }))

    try {
      const { data } = await api.post('/chat/send', {
        chat_id: Number(chatId),
        message: `My last ${norm.length} months of sales`,
        sales_form: norm.map(r => ({ period: r.period, total_revenue: r.total_revenue, bill_count: r.bill_count }))
      })
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
    } catch (e: any) {
      setError(e?.response?.data?.error ?? e?.message ?? 'Failed to submit sales data')
    } finally {
      if (sourceMsgId) setSalesSubmittingMap(prev => ({ ...prev, [sourceMsgId]: false }))
    }
  }

  return (

    <div style={{ height: '100%', display: 'grid', gridTemplateRows: '1fr auto', position: 'relative' }}>



      {/* 1. Focus Mode Modal */}

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



      {/* 2. Presentation Slide Mode - THEME AWARE & FIXED POSITION */}

      {presentingMsg && slides.length > 0 && (

        <div className="fixed inset-0 z-[999999] bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white flex flex-col animate-in fade-in duration-500">



          {/* Close Button - Lowered to top-20 (approx 80px) to strictly avoid top headers */}

          <button

            onClick={() => setPresentingMsg(null)}

            className="absolute top-20 right-10 z-[1000000] p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-all shadow-sm group"

            title="Close Presentation"

          >

            <X size={20} className="group-hover:scale-110 transition-transform duration-300" />

          </button>



          {/* Main Slide Area */}

          <div className="flex-1 flex items-center justify-center overflow-hidden relative w-full h-full">



            {/* Nav Left - Safe from Sidebar */}

            <button

              onClick={prevSlide}

              disabled={currentSlide === 0}

              className="absolute left-8 md:left-32 z-[1000000] p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-0 disabled:pointer-events-none transition-all backdrop-blur-sm text-neutral-900 dark:text-white"

            >

              <ChevronLeft size={40} />

            </button>



            {/* Slide Content */}

            <div key={currentSlide} className="max-w-4xl w-full px-8 h-[75vh] flex items-center justify-center animate-in slide-in-from-right-8 duration-500">

              <div className="prose dark:prose-invert prose-2xl max-w-none w-full text-center leading-relaxed max-h-full overflow-y-auto px-6 py-8 scrollbar-hide prose-ol:list-decimal prose-ol:text-left prose-ul:list-disc prose-ul:text-left prose-li:marker:text-brand1">

                <Markdown>{slides[currentSlide]}</Markdown>

              </div>

            </div>



            {/* Nav Right - Safe from Edge */}

            <button

              onClick={nextSlide}

              disabled={currentSlide === slides.length - 1}

              className="absolute right-8 md:right-32 z-[1000000] p-3 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 disabled:opacity-0 disabled:pointer-events-none transition-all backdrop-blur-sm text-neutral-900 dark:text-white"

            >

              <ChevronRight size={40} />

            </button>

          </div>



          {/* Footer Progress - Adaptive */}

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



      {/* Message List */}

      <div ref={listRef} onScroll={handleScroll} style={{ overflowY: 'auto', padding: '20px 16px' }}>

        {messages.length === 0 ? (

          <div className="flex flex-col items-center justify-center min-h-[50vh] opacity-0 animate-in fade-in zoom-in duration-500 fill-mode-forwards">

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand1 to-brand3 mb-6 shadow-xl shadow-brand1/20" />

            <h2 className="text-2xl font-semibold tracking-tight mb-2 text-neutral-800 dark:text-white">New Insight Session</h2>

            <p className="text-neutral-500 mb-8">Select a starter or type a message.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">

              {STARTER_QUESTIONS.map((item, i) => (

                <button key={i} onClick={() => handleStarterClick(item.prompt)} className="text-left p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-brand1/50 hover:shadow-md transition-all group">

                  <div className="flex items-center gap-3 mb-2">

                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 group-hover:text-brand1 group-hover:bg-brand1/10 transition-colors">{item.icon}</div>

                    <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">{item.label}</span>

                  </div>

                  <p className="text-xs text-neutral-500 line-clamp-2 pl-1">{item.prompt}</p>

                </button>

              ))}

            </div>

          </div>

        ) : (

          <div className="max-w-[880px] mx-auto pb-6 space-y-6 relative">

            {messages.map((m, idx) => {
              const next = messages[idx + 1]
              const initialSales = (m.role === 'assistant' && next && next.role === 'user' && next.form_type === 'sales' && Array.isArray(next.form_data)) ? next.form_data : undefined
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
                  initialSales={initialSales as any}
                  disabledSalesSubmit={disabledSalesSubmit}
                />
              )
            })}

            {loading && <ThinkingAnimation />}

          </div>

        )}

      </div>



      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="absolute left-1/2 -translate-x-1/2 z-20 p-2 rounded-full bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-brand1 transition-all animate-in fade-in slide-in-from-bottom-4"
          style={{ bottom: scrollBtnBottom }}
        >
          <ChevronDown size={20} />
        </button>
      )}



      {/* Input Area */}

      <ChatInput

        ref={chatInputRef}

        input={input}

        setInput={setInput}

        send={send}

        isRecording={isRecording}

        toggleRecording={toggleRecording}

        canSend={canSend}

        files={files}

        setFiles={setFiles}

        onKeyDown={onKeyDown}

        showSlashMenu={showSlashMenu}

        executeSlashCommand={executeSlashCommand}

      />

    </div>

  )

}
