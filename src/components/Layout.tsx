import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import SplitView from './SplitView'
import EmbeddedChat from './EmbeddedChat'
import { ToggleRight, ToggleLeft } from 'lucide-react'

export default function Layout({ children }: { children?: ReactNode }) {
  const [collapsed, setCollapsed] = useState(true)
  const toggle = () => setCollapsed(c => !c)
  const location = useLocation()
  const path = location.pathname || ''
  const shouldSplit = useMemo(() => {
    const p = path.replace(/\/$/, '')
    return [
      '/home',
      '/dashboard',
      '/team',
      '/finance',
      '/process',
      '/sales',
      '/founder',
    ].some(prefix => p === prefix || p.startsWith(prefix + '/'))
  }, [path])

  const rightTitle = useMemo(() => {
    const seg = path.split('/').filter(Boolean)[0] || 'View'
    const name = seg.charAt(0).toUpperCase() + seg.slice(1)
    return name === 'Home' ? 'Dashboard' : name
  }, [path])
  const [showChat, setShowChat] = useState(false)
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
            key={`split-${collapsed ? 'c' : 'o'}-${showChat ? 'open' : 'closed'}`}
            left={<EmbeddedChat />}
            titleLeft="Chat"
            titleRight={rightTitle}
            controls={false}
            mode={showChat ? 'split' : 'right'}
          >
            <div className="relative h-full min-h-0 overflow-auto">
              <button
                onClick={() => setShowChat(v => !v)}
                title={showChat ? 'Close Chat' : 'Open Chat'}
                className="absolute top-2 left-2 z-10 inline-flex items-center justify-center w-6 h-6 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900/70 backdrop-blur hover:bg-white dark:hover:bg-neutral-800"
              >
                {showChat ? (
                  <ToggleLeft className="w-2.5 h-2.5 text-neutral-700 dark:text-neutral-200" />
                ) : (
                  <ToggleRight className="w-2.5 h-2.5 text-neutral-700 dark:text-neutral-200" />
                )}
              </button>
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
