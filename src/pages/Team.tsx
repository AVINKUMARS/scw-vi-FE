import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Users, Activity, Gauge, ClipboardList, AlertTriangle, CheckCircle } from 'lucide-react'

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
  const productivityScore = benchmark > 0 ? Math.min((productivity / benchmark) * 100, 100) : 0

  // 2. Span of Control Score
  const span = employees > 0 ? employees / coreProcesses : 0
  let spanScore = 0
  if (span < 3) spanScore = 40
  else if (span <= 7) spanScore = 90
  else spanScore = 60

  // 3. Role Clarity Score
  const roleClarityScore = 100 // placeholder: all roles defined if processes exist

  // 4. Hiring Adequacy Score
  const idealEmployeeCount = benchmark > 0 ? revenue / benchmark : 0
  const hiringAdequacyScore =
    employees > 0
      ? Math.min((idealEmployeeCount / employees) * 100, 100)
      : 0

  // === OVERALL TEAM HEALTH SCORE ===
  const overallScore = Number(
    (
      productivityScore * 0.4 +
      spanScore * 0.2 +
      roleClarityScore * 0.2 +
      hiringAdequacyScore * 0.2
    ).toFixed(1)
  )

  // Persist to localStorage for main dashboard
  useEffect(() => {
    try {
      const score = Number.isFinite(overallScore) ? overallScore : 0
      localStorage.setItem('score_team', JSON.stringify({ score, at: Date.now() }))
    } catch { }
  }, [overallScore])

  // BASIC INSIGHT FOR SMALL CARDS
  function getInsight(title: string, score: number) {
    if (score >= 80) return {
      msg: 'Strong performance — keep maintaining consistency.',
      severity: 'good' as const
    }
    if (score >= 60) return {
      msg: 'Good but room for improvement — tighten processes and KPIs.',
      severity: 'ok' as const
    }
    if (score >= 40) return {
      msg: 'Below healthy range — improve clarity, accountability, or capacity.',
      severity: 'warning' as const
    }
    return {
      msg: 'Critical issue — immediate corrective action required.',
      severity: 'bad' as const
    }
  }

  // 🧠 STAGE LABEL for overall score
  function getStage(score: number) {
    if (score >= 80) return { label: 'High', desc: 'Your team is performing strongly.', color: 'text-emerald-600', pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }
    if (score >= 60) return { label: 'Moderate', desc: 'Healthy but clearly improvable.', color: 'text-blue-600', pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' }
    if (score >= 40) return { label: 'Low', desc: 'Important gaps in structure and productivity.', color: 'text-yellow-600', pill: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' }
    return { label: 'Critical', desc: 'Team health is at risk — needs urgent attention.', color: 'text-red-600', pill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
  }

  // 🧩 IMPROVEMENT ENGINE – build actions from metric scores
  type RecSeverity = 'critical' | 'major' | 'minor'

  type Recommendation = {
    title: string
    description: string
    severity: RecSeverity
  }

  type RoadmapStep = {
    label: string
    detail: string
  }

  function buildTeamRecommendations(): {
    simpleList: string[]
    cards: Recommendation[]
    roadmap: RoadmapStep[]
  } {
    const simpleList: string[] = []
    const cards: Recommendation[] = []
    const roadmap: RoadmapStep[] = []

    // 1) Productivity low
    if (productivityScore < 60) {
      simpleList.push('Increase employee productivity by setting clear output targets per role.')
      cards.push({
        title: 'Boost Productivity per Employee',
        description: 'Introduce weekly output KPIs, review 1:1s, and remove obvious blockers in workflows.',
        severity: productivityScore < 40 ? 'critical' : 'major'
      })
      roadmap.push({
        label: 'Step 1 — Define productivity KPIs',
        detail: 'For each key role, define 1–3 measurable weekly outputs (e.g., calls made, tickets closed, deals progressed).'
      })
    }

    // 2) Span of control off
    if (spanScore < 60) {
      simpleList.push('Rebalance team structure so each manager oversees a healthy number of direct reports.')
      cards.push({
        title: 'Fix Span of Control',
        description: 'Reduce overloaded managers and ensure each leader has 3–7 direct reports, not 10+.',
        severity: spanScore < 40 ? 'critical' : 'major'
      })
      roadmap.push({
        label: 'Step 2 — Reassign reporting lines',
        detail: 'Identify managers with too many reports and delegate some people to emerging leaders or team leads.'
      })
    }

    // 3) Hiring adequacy low
    if (hiringAdequacyScore < 60) {
      simpleList.push('Add capacity in key functions where one person is doing the job of many.')
      cards.push({
        title: 'Right-size the Team',
        description: 'Backfill critical roles, and hire ahead in functions that directly drive revenue and delivery.',
        severity: hiringAdequacyScore < 40 ? 'critical' : 'major'
      })
      roadmap.push({
        label: 'Step 3 — Plan critical hires',
        detail: 'Create a 90-day hiring plan starting with revenue-driving and delivery roles, not only support roles.'
      })
    }

    // 4) Role clarity (even if 100 now, you may tune later)
    if (roleClarityScore < 80) {
      simpleList.push('Clarify responsibilities with simple one-page role scorecards.')
      cards.push({
        title: 'Clarify Roles & Ownership',
        description: 'Give every role a clear purpose, 3–5 responsibilities, and 3–5 success metrics.',
        severity: 'major'
      })
      roadmap.push({
        label: 'Step 4 — Introduce role scorecards',
        detail: 'Document each key role: purpose, responsibilities, KPIs. Share them in a central, visible place.'
      })
    }

    // If nothing is low, still show a “keep scaling” suggestion
    if (simpleList.length === 0) {
      simpleList.push('Maintain current systems and start building leadership bench strength for the next scale stage.')
      cards.push({
        title: 'Protect and Scale What Works',
        description: 'Systematize your current good practices: document rituals, reviews, and feedback loops.',
        severity: 'minor'
      })
      roadmap.push({
        label: 'Step 1 — Systematize your current success',
        detail: 'Convert the way you work today into simple playbooks so it still works when the team doubles in size.'
      })
    }

    // Add a generic final roadmap step
    roadmap.push({
      label: 'Final Step — Review every 90 days',
      detail: 'Recalculate team score quarterly and re-run this improvement plan so your org design scales with revenue.'
    })

    return { simpleList, cards, roadmap }
  }

  const stage = getStage(Number.isFinite(overallScore) ? overallScore : 0)
  const { simpleList, cards, roadmap } = buildTeamRecommendations()

  const metrics = [
    { title: 'Employee Productivity Score', value: productivityScore.toFixed(1), icon: <Activity className="w-6 h-6 text-blue-600" /> },
    { title: 'Span of Control Score', value: spanScore, icon: <Gauge className="w-6 h-6 text-purple-600" /> },
    { title: 'Role Clarity Score', value: roleClarityScore, icon: <ClipboardList className="w-6 h-6 text-green-600" /> },
    { title: 'Hiring Adequacy Score', value: hiringAdequacyScore.toFixed(1), icon: <Users className="w-6 h-6 text-orange-600" /> },
  ]

  if (err) {
    return <div className="h-full min-h-0 p-6 bg-gray-50 dark:bg-neutral-900 text-red-600">{err}</div>
  }

  if (!me && !err) {
    return <div className="h-full min-h-0 p-6 bg-gray-50 dark:bg-neutral-900">Loading…</div>
  }

  return (
    <div className="h-full min-h-0 p-6 bg-gray-50 dark:bg-neutral-900">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-neutral-100">
        Team Health Score
      </h1>

      {/* OVERALL TEAM SCORE + STAGE */}
      <div className="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border border-gray-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-1">
              Overall Team Health
            </h2>
            <div className="flex items-center gap-3">
              <div className="text-5xl font-extrabold text-blue-600">{overallScore}%</div>
              <span className={`text-xs px-3 py-1 rounded-full inline-flex items-center gap-1 ${stage.pill}`}>
                {stage.label === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                {stage.label === 'High' && <CheckCircle className="w-3 h-3" />}
                {stage.label}
              </span>
            </div>
            <p className="text-gray-600 dark:text-neutral-400 mt-2">
              {stage.desc}
            </p>
          </div>
        </div>
      </div>

      {/* 🔹 METRIC CARDS WITH BASIC INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((m, i) => {
          const scoreNum = parseFloat(String(m.value))
          const insight = getInsight(m.title, scoreNum)

          return (
            <div
              key={i}
              className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border border-gray-200 dark:border-neutral-700"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 dark:text-neutral-400">{m.title}</p>
                {m.icon}
              </div>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">
                {m.value}%
              </h3>

              {/* SMALL PER-METRIC INSIGHT */}
              <div className="mt-3">
                <span
                  className={`
                    text-xs px-2 py-1 rounded 
                    ${insight.severity === 'good' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'}
                    ${insight.severity === 'ok' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}
                    ${insight.severity === 'warning' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'}
                    ${insight.severity === 'bad' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}
                  `}
                >
                  {insight.msg}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* =============================== */}
      {/* 🧠 IMPROVEMENT ENGINE SECTION  */}
      {/* =============================== */}

      {/* A) SIMPLE RECOMMENDATION LIST */}
      <div className="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border border-gray-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-2">
          How to Improve Your Team Score
        </h2>
        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
          These actions are auto-generated from your underlying metrics (productivity, span, hiring, clarity).
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-neutral-300">
          {simpleList.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* B) COLOR-CODED RECOMMENDATION CARDS */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-3">
          Priority Actions (by Severity)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, idx) => {
            const severityClasses =
              c.severity === 'critical'
                ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                : c.severity === 'major'
                ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800'
                : 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800'

            const badgeLabel =
              c.severity === 'critical'
                ? 'Critical'
                : c.severity === 'major'
                ? 'High Priority'
                : 'Nice to Improve'

            return (
              <div
                key={idx}
                className={`p-4 rounded-xl shadow-sm border ${severityClasses}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-900 dark:text-neutral-100">
                    {c.title}
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 dark:bg-neutral-900/40 text-gray-700 dark:text-neutral-200">
                    {badgeLabel}
                  </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-neutral-300">
                  {c.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* C) STEP-BY-STEP ROADMAP */}
      <div className="mb-10 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border border-gray-200 dark:border-neutral-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-3">
          90-Day Team Health Roadmap
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-neutral-300">
          {roadmap.map((step, idx) => (
            <li key={idx}>
              <span className="font-medium text-gray-900 dark:text-neutral-100">
                {step.label}
              </span>
              <span className="ml-1 text-gray-700 dark:text-neutral-300">
                {step.detail}
              </span>
            </li>
          ))}
        </ol>
      </div>

    </div>
  )
}
