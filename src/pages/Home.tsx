import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { ArrowRight, TrendingUp, Users, Workflow, DollarSign, Gauge } from 'lucide-react'

type Score = { score: number; at?: number }

function readScore(key: string): number | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Score
    if (typeof parsed?.score === 'number') return parsed.score
  } catch {}
  return null
}

export default function GrowthDashboard() {
  const nav = useNavigate()
  // Profile for goal progress
  const [me, setMe] = React.useState<any>(null)
  const [team, setTeam] = React.useState<number | null>(readScore('score_team'))
  const [process, setProcess] = React.useState<number | null>(readScore('score_process'))
  const [sales, setSales] = React.useState<number | null>(readScore('score_sales'))
  const [finance, setFinance] = React.useState<number | null>(readScore('score_finance'))

  React.useEffect(() => {
    const sync = () => {
      setTeam(readScore('score_team'))
      setProcess(readScore('score_process'))
      setSales(readScore('score_sales'))
      setFinance(readScore('score_finance'))
    }
    sync()
    const id = setInterval(sync, 3000)
    return () => clearInterval(id)
  }, [])

  // Fetch /me once for goal progress bar
  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await api.get('/me')
        if (mounted) setMe(data)
      } catch {}
    })()
    return () => { mounted = false }
  }, [])

  const scores = [team, process, sales, finance].filter((v): v is number => typeof v === 'number')
  const overall = scores.length ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : null

  const Card = ({ title, value, icon, onClick }: { title: string; value: string; icon: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick} className="text-left bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-neutral-800 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Tap to view details</p>
        </div>
        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">{icon}</div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">{value}</div>
        <ArrowRight className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
      </div>
    </button>
  )

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-neutral-950 dark:to-blue-950/50">
      <div className="max-w-7xl mx-auto">
        {/* Goal progress (from /me) */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-neutral-100">Goal Progress</h2>
              <p className="text-sm text-gray-600 dark:text-neutral-400">From current monthly revenue toward your goal over time</p>
            </div>
          </div>
          {(() => {
            const mrr = Number(me?.monthly_revenue ?? 0)
            const goalAmt = Number(me?.goal_amount ?? 0)
            const years = Number(me?.goal_years ?? 0)
            const pct = goalAmt > 0 ? Math.max(0, Math.min(100, (mrr / goalAmt) * 100)) : 0
            return (
              <>
                <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 text-sm text-gray-700 dark:text-neutral-300 flex gap-4 flex-wrap">
                  <span><b>Start (Current MRR):</b> ${mrr.toLocaleString()}</span>
                  <span><b>Goal Amount:</b> {goalAmt > 0 ? `$${goalAmt.toLocaleString()}` : '—'}</span>
                  <span><b>Timeframe:</b> {years > 0 ? `${years} year${years>1?'s':''}` : '—'}</span>
                  <span><b>Progress:</b> {pct.toFixed(1)}%</span>
                </div>
              </>
            )
          })()}
        </div>
        {/* Overall header */}
        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-neutral-100 mb-1">Overall Health</h1>
              <p className="text-gray-600 dark:text-neutral-400">Average of Team, Process, Sales and Finance scores.</p>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div className="text-5xl font-extrabold text-blue-600">{overall != null ? `${overall}%` : '—'}</div>
            </div>
          </div>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card
            title="Team"
            value={team != null ? `${team}%` : '—'}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            onClick={() => nav('/team')}
          />
          <Card
            title="Process"
            value={process != null ? `${process}%` : '—'}
            icon={<Workflow className="w-6 h-6 text-purple-600" />}
            onClick={() => nav('/process')}
          />
          <Card
            title="Sales"
            value={sales != null ? `${sales}%` : '—'}
            icon={<Gauge className="w-6 h-6 text-orange-600" />}
            onClick={() => nav('/sales')}
          />
          <Card
            title="Finance"
            value={finance != null ? `${finance}%` : '—'}
            icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
            onClick={() => nav('/finance')}
          />
        </div>
      </div>
    </div>
  )
}