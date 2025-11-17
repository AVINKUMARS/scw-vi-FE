import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearToken } from '../lib/auth'
import { api } from '../lib/api'
import { Sun, Moon, LogOut, Coins, BadgeDollarSign } from 'lucide-react'
import logo from '../assets/slogod.png'
import logod from '../assets/slogo.png'

function getInitialTheme() {
  const stored = localStorage.getItem('theme')
  if (stored === 'dark' || stored === 'light') return stored
  return 'light'
}

export default function TopBar() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme())
  const [tokenUsage, setTokenUsage] = useState<string>('')
  const nav = useNavigate()

  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    let cancelled = false
    const fetchUsage = async () => {
      try {
        const { data } = await api.get('/tokens/usage')
        if (cancelled) return
        const used =
          typeof data?.token_used === 'number'
            ? data.token_used
            : typeof data?.used === 'number'
            ? data.used
            : undefined
        const quota =
          typeof data?.token_quota === 'number'
            ? data.token_quota
            : typeof data?.quota === 'number'
            ? data.quota
            : undefined
        if (typeof used === 'number' && typeof quota === 'number') {
          setTokenUsage(`${used}/${quota}`)
          return
        }
        if (typeof data === 'number') { setTokenUsage(String(data)); return }
        if (typeof data?.tokens === 'number') { setTokenUsage(String(data.tokens)); return }
        if (typeof data?.usage === 'number') { setTokenUsage(String(data.usage)); return }
        if (typeof data?.total === 'number') { setTokenUsage(String(data.total)); return }
        setTokenUsage('')
      } catch {
        if (!cancelled) setTokenUsage('')
      }
    }
    fetchUsage()
    const id = setInterval(fetchUsage, 60000)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const logout = () => {
    clearToken()
    nav('/login')
  }

  return (
    <header className="bg-neutral-100/80 dark:bg-neutral-900/80 sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center gap-2">
          <img src={theme === 'dark' ? logod : logo} alt="Logo" className="h-10 w-10 rounded-md object-contain" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight text-sm sm:text-base">
            Scalingwolf AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div
            title="Token usage"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-neutral-200/70 dark:border-neutral-700/70 bg-neutral-50/50 dark:bg-neutral-800/50 text-xs text-neutral-700 dark:text-neutral-300 backdrop-blur-sm"
          >
            <Coins className="w-5 h-5 text-yellow-500" />
            <span>{tokenUsage || '...'}</span>
          </div>

          <button
            onClick={() => nav('/pricing')}
            title="Pricing"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200/70 dark:border-neutral-700/70 transition-all duration-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 text-sm"
          >
            <BadgeDollarSign className="w-5 h-5 text-emerald-600" />
            <span className="hidden sm:inline">Pricing</span>
          </button>

          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            title="Toggle theme"
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200/70 dark:border-neutral-700/70 transition-all duration-200 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/60 text-sm"
          >
            {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="hidden sm:inline">{theme === 'light' ? 'Light' : 'Dark'}</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-neutral-200/70 dark:border-neutral-700/70 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-900/30 text-sm text-red-600 dark:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}
