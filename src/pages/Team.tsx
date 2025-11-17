import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Users, Activity, Gauge, ClipboardList } from 'lucide-react'

export default function TeamHealthDashboard() {
  const [me, setMe] = useState<any>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/me')
        setMe(data)
      } catch (e: any) {
        setErr(e?.response?.data?.error ?? 'Failed to load profile')
      }
    })()
  }, [])

  const employees = me?.employees || 0
  const revenue = me?.monthly_revenue || 0
  const coreProcesses = (me?.core_processes?.length ?? 0) || 1

  // === TEAM HEALTH LOGIC ===

  // 1. Productivity Score
  let benchmark = 0
  if (me?.industry_type === 'Service') benchmark = 1200000
  if (me?.industry_type === 'Manufacturing') benchmark = 600000
  if (me?.industry_type === 'Retail') benchmark = 300000

  const productivity = employees > 0 ? revenue / employees : 0
  const productivityScore = Math.min((productivity / benchmark) * 100, 100)

  // 2. Span of Control Score
  const span = employees / coreProcesses
  let spanScore = 0
  if (span < 3) spanScore = 40
  else if (span <= 7) spanScore = 90
  else spanScore = 60

  // 3. Role Clarity Score
  const roleClarityScore = (coreProcesses / coreProcesses) * 100

  // 4. Hiring Adequacy Score
  const idealEmployeeCount = benchmark > 0 ? revenue / benchmark : 0
  const hiringAdequacyScore = Math.min((idealEmployeeCount / employees) * 100, 100)

  // === OVERALL TEAM HEALTH SCORE ===
  const overallScore = Number(
    (
      productivityScore * 0.4 +
      spanScore * 0.2 +
      roleClarityScore * 0.2 +
      hiringAdequacyScore * 0.2
    ).toFixed(1)
  )

  // Persist overall score in localStorage for dashboard usage (always call hook)
  useEffect(() => {
    try {
      const score = Number.isFinite(overallScore) ? overallScore : 0
      localStorage.setItem('score_team', JSON.stringify({ score, at: Date.now() }))
    } catch { }
  }, [overallScore])

  const metrics = [
    {
      title: 'Employee Productivity Score',
      value: productivityScore.toFixed(1) + '%',
      icon: <Activity className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Span of Control Score',
      value: spanScore + '%',
      icon: <Gauge className="w-6 h-6 text-purple-600" />,
    },
    {
      title: 'Role Clarity Score',
      value: roleClarityScore + '%',
      icon: <ClipboardList className="w-6 h-6 text-green-600" />,
    },
    {
      title: 'Hiring Adequacy Score',
      value: hiringAdequacyScore.toFixed(1) + '%',
      icon: <Users className="w-6 h-6 text-orange-600" />,
    },
  ]

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-neutral-900">
      {err && <p className="mb-4 text-red-600">{err}</p>}
      {!me && !err && <p className="p-2">Loading…</p>}
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-neutral-100">
        Team Health Score
      </h1>

      {/* OVERALL TEAM SCORE */}
      <div className="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border border-gray-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-2">
          Overall Team Health
        </h2>
        <div className="text-5xl font-extrabold text-blue-600">{overallScore}%</div>
        <p className="text-gray-600 dark:text-neutral-400 mt-1">
          Combined score based on productivity, span, clarity, and hiring adequacy.
        </p>
      </div>

      {/* INDIVIDUAL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border border-gray-200 dark:border-neutral-700"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600 dark:text-neutral-400">{m.title}</p>
              {m.icon}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">{m.value}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}