import type { ReactNode } from 'react'
// useEffect/useMemo/useState already imported above; avoid duplicate import
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import SplitView from './SplitView'
import EmbeddedChat from './EmbeddedChat'
import { ToggleRight, ToggleLeft, ArrowUpRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

export default function Layout({ children }: { children?: ReactNode }) {
  const nav = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const toggle = () => setCollapsed(c => !c)
  const location = useLocation()
  const path = location.pathname || ''
  // Open sidebar on chat pages; closed on others. Users can still toggle.
  const isChatRoute = useMemo(() => {
    const p = path.replace(/\/$/, '')
    return p.startsWith('/chat/') || p === '/new-chat'
  }, [path])
  useEffect(() => {
    setCollapsed(!isChatRoute)
  }, [isChatRoute])
  // Show Embedded Chat on all pages that use this Layout, except the full chat pages themselves
  const shouldSplit = useMemo(() => {
    const p = path.replace(/\/$/, '')
    // Hide split only on dedicated chat routes
    if (p === '/new-chat' || p.startsWith('/chat/')) return false
    // Do not show embedded chat on Profile page
    if (p === '/profile' || p.startsWith('/profile')) return false
    return true
  }, [path])

  const rightTitle = useMemo(() => {
    const seg = path.split('/').filter(Boolean)[0] || 'View'
    const name = seg.charAt(0).toUpperCase() + seg.slice(1)
    return name === 'Home' ? 'Dashboard' : name
  }, [path])
  const [showChat, setShowChat] = useState(false)
  const [forcedLeft, setForcedLeft] = useState<number | undefined>(undefined)

  // When user focuses or types in any textarea (embedded chat composer), auto open split view
  useEffect(() => {
    if (!shouldSplit) return
    const onFocusIn = (e: Event) => {
      const t = e.target as HTMLElement | null
      if (t && t.tagName === 'TEXTAREA') {
        setShowChat(true)
        try {
          const w = window.innerWidth || 1200
          const desired = Math.floor(w * 0.5)
          setForcedLeft(desired)
        } catch {}
      }
    }
    const onKeyDown = () => {
      const el = (document.activeElement as HTMLElement | null)
      if (el && el.tagName === 'TEXTAREA') {
        setShowChat(true)
        try {
          const w = window.innerWidth || 1200
          const desired = Math.floor(w * 0.5)
          setForcedLeft(desired)
        } catch {}
      }
    }
    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [shouldSplit])

  // Listen for embedded chat activation only (avoid triggering from other textareas)
  useEffect(() => {
    if (!shouldSplit) return
    const onActivate = () => {
      setShowChat(true)
      try {
        const w = window.innerWidth || 1200
        const desired = Math.floor(w * 0.5)
        setForcedLeft(desired)
      } catch {}
    }
    window.addEventListener("embedded-chat-activate" as any, onActivate as any)
    return () => {
      window.removeEventListener("embedded-chat-activate" as any, onActivate as any)
    }
  }, [shouldSplit])

  // On route change, keep embedded chat visible at a normal (narrow) size; typing will expand it
  useEffect(() => {
    if (shouldSplit) {
      setShowChat(true)
      try {
        setForcedLeft(360)
      } catch {}
    }
  }, [path, shouldSplit])

  // Preserve embedded chat state across navigation
  return (
    <div style={{
      height: '100vh',
      display: 'grid',
      gridTemplateRows: '56px 1fr',
      gridTemplateColumns: `${collapsed ? '56px' : '240px'} 1fr`,
      gridTemplateAreas: `"top top" "side main"`,
      overflow: 'hidden'
    }}>
      <div style={{ gridArea: 'top' }}>
        <TopBar />
      </div>
      <div style={{ gridArea: 'side', minHeight: 0 }}>
        <Sidebar collapsed={collapsed} onToggle={toggle} />
      </div>
      <main style={{ gridArea: 'main', padding: 0, minHeight: 0, height: '100%', overflow: shouldSplit ? 'hidden' : 'auto', position: 'relative', zIndex: 0, background: 'var(--bg)' }}>
        {shouldSplit ? (
          <SplitView
            key={`split-${collapsed ? 'c' : 'o'}-${path}-${showChat ? 'open' : 'closed'}`}
            left={<EmbeddedChat />}
            titleLeft="Chat"
            titleRight={rightTitle}
            controls={false}
            mode={showChat ? 'split' : 'right'}
            initialLeftWidth={360}
            minLeft={360}
            forceLeftWidth={forcedLeft}
          >
            <div className="relative h-full min-h-0 overflow-auto">
              <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                <button
                  onClick={() => setShowChat(v => !v)}
                  title={showChat ? 'Close Chat' : 'Open Chat'}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/70 backdrop-blur hover:bg-white dark:hover:bg-neutral-800"
                >
                  {showChat ? (
                    <ToggleLeft className="w-2.5 h-2.5 text-neutral-700 dark:text-neutral-200" />
                  ) : (
                    <ToggleRight className="w-2.5 h-2.5 text-neutral-700 dark:text-neutral-200" />
                  )}
                </button>
                <button
                  onClick={async () => {
                    // Go to latest existing chat (do not auto-create)
                    try {
                      const { data } = await api.get('/chat')
                      const list = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
                      const latest = list && list.length > 0 ? list[0] : null
                      if (latest?.id != null) {
                        nav(`/chat/${latest.id}`)
                        return
                      }
                      // If none exist, take user to New Chat to start
                      nav('/new-chat')
                    } catch {
                      nav('/new-chat')
                    }
                  }}
                  title="Open full chat"
                  className="inline-flex items-center justify-center w-6 h-6 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/70 backdrop-blur hover:bg-white dark:hover:bg-neutral-800"
                >
                  <ArrowUpRight className="w-2.5 h-2.5 text-neutral-700 dark:text-neutral-200" />
                </button>
              </div>
              {children ?? <Outlet />}
            </div>
          </SplitView>
        ) : (
          children ?? <Outlet />
        )}
      </main>
    </div>
  )
}
