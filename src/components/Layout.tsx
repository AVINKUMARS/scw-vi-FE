import type { ReactNode } from 'react'
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children?: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const toggle = () => setCollapsed(c => !c)
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
      <main style={{ gridArea: 'main', padding: 0, minHeight: 0, overflowY: 'auto', overflowX: 'hidden' }}>{children ?? <Outlet />}</main>
    </div>
  )
}
