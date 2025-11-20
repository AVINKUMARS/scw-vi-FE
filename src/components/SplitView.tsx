import React, { useEffect, useMemo, useRef, useState } from 'react'

type Mode = 'split' | 'left' | 'right'

export default function SplitView({
  left,
  children,
  initialMode = 'split',
  initialLeftWidth = 360,
  minLeft = 280,
  maxLeft = 720,
  titleLeft = 'Chat',
  titleRight = 'View',
  controls = true,
  mode: controlledMode,
  onModeChange,
}: {
  left: React.ReactNode
  children: React.ReactNode
  initialMode?: Mode
  initialLeftWidth?: number
  minLeft?: number
  maxLeft?: number
  titleLeft?: string
  titleRight?: string
  controls?: boolean
  mode?: Mode
  onModeChange?: (m: Mode) => void
}) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [leftWidth, setLeftWidth] = useState(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : initialLeftWidth
    const dividerW = 6
    const minRight = 420
    const cap = Math.floor(w * 0.6)
    const maxByWin = Math.max(minLeft, Math.min(maxLeft, cap, w - minRight - dividerW))
    return Math.max(minLeft, Math.min(maxByWin, initialLeftWidth))
  })
  const containerRef = useRef<HTMLDivElement | null>(null)
  const dragging = useRef(false)
  const dividerW = 6
  const minRight = 420

  // Auto preference on small screens: default to right only
  useEffect(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1024
    if (!controlledMode && w < 900) setMode('right')
  }, [])

  // Clamp left width to container size to avoid overflow on narrow layouts
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const adjust = () => {
      const rect = el.getBoundingClientRect()
      const pctCap = Math.floor(rect.width * 0.6)
      const maxLeftByContainer = Math.max(minLeft, Math.min(maxLeft, pctCap, rect.width - minRight - dividerW))
      setLeftWidth(w => Math.max(minLeft, Math.min(maxLeftByContainer, w)))
    }
    adjust()
    const RO: any = (window as any).ResizeObserver
    const ro = RO ? new RO(() => adjust()) : null
    if (ro) { ro.observe(el) }
    const onWin = () => adjust()
    window.addEventListener('resize', onWin)
    return () => { if (ro && el) ro.unobserve(el); window.removeEventListener('resize', onWin) }
  }, [minLeft, maxLeft])

  const currentMode: Mode = controlledMode ?? mode

  const setModeUnified = (m: Mode) => {
    if (controlledMode && onModeChange) onModeChange(m)
    else setMode(m)
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (currentMode !== 'split') return
    dragging.current = true
    e.preventDefault()
  }

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current || currentMode !== 'split') return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = e.clientX - rect.left
    const rect2 = containerRef.current?.getBoundingClientRect()
    const cw = rect2 ? rect2.width : x + minRight
    const pctCap = Math.floor(cw * 0.6)
    const maxByContainer = Math.max(minLeft, Math.min(maxLeft, pctCap, cw - minRight - dividerW))
    const newWidth = Math.max(minLeft, Math.min(maxByContainer, x))
    setLeftWidth(newWidth)
  }

  const onMouseUp = () => {
    dragging.current = false
  }

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [currentMode])

  const gridStyle: React.CSSProperties = useMemo(() => {
    if (currentMode === 'left') return { gridTemplateColumns: '1fr', gridTemplateAreas: '"left"', }
    if (currentMode === 'right') return { gridTemplateColumns: '1fr', gridTemplateAreas: '"right"', }
    return {
      gridTemplateColumns: `${leftWidth}px 6px 1fr`,
      gridTemplateAreas: '"left divider right"',
    }
  }, [currentMode, leftWidth])

  return (
    <div className="relative h-full w-full overflow-hidden" ref={containerRef}>
      {/* Optional built-in controls (hidden in our pages) */}
      {controls && (
        <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white/80 dark:bg-neutral-900/70 backdrop-blur rounded-md border border-neutral-200/70 dark:border-neutral-700 p-1">
          <button
            onClick={() => setModeUnified('split')}
            className={`px-2 py-1 text-xs font-semibold rounded ${currentMode==='split'?'bg-blue-600 text-white':'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            title={`Split ${titleLeft} | ${titleRight}`}
          >Split</button>
          <button
            onClick={() => setModeUnified('left')}
            className={`px-2 py-1 text-xs font-semibold rounded ${currentMode==='left'?'bg-blue-600 text-white':'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            title={`${titleLeft} Only`}
          >{titleLeft}</button>
          <button
            onClick={() => setModeUnified('right')}
            className={`px-2 py-1 text-xs font-semibold rounded ${currentMode==='right'?'bg-blue-600 text-white':'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
            title={`${titleRight} Only`}
          >{titleRight}</button>
        </div>
      )}

      {/* Grid */}
      <div className="grid h-full min-h-0" style={gridStyle}>
        {currentMode !== 'right' && (
          <section className="relative min-h-0 h-full max-h-full" style={{ gridArea: 'left', minWidth: 0, overflow: 'hidden' }}>
            <div className="absolute inset-0 flex flex-col min-h-0">
              {left}
            </div>
          </section>
        )}
        {currentMode === 'split' && (
          <div
            style={{ gridArea: 'divider', cursor: 'col-resize' }}
            className="bg-neutral-200 dark:bg-neutral-800"
            onMouseDown={onMouseDown}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize"
          />
        )}
        {currentMode !== 'left' && (
          <section className="relative min-h-0 h-full max-h-full" style={{ gridArea: 'right', minWidth: 0 }}>
            <div className="absolute inset-0 overflow-auto pane-scroll no-scrollbar" style={{ background: 'var(--bg)' }}>
              <div className="min-h-full">
                {children}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
