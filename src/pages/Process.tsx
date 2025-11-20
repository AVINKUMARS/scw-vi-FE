// FULL TSX-SAFE PROCESS HEALTH DASHBOARD WITH IMPROVEMENT ENGINE
import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { CheckCircle, AlertTriangle, ClipboardList, Gauge, Activity, TrendingUp } from 'lucide-react'

export default function ProcessHealthDashboard() {
  const [me, setMe] = useState<any>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/me')
        setMe(data)
      } catch (e: any) {
        setErr(e?.response?.data?.error ?? 'Failed to load profile')
      }
    })()
  }, [])

  const employees = me?.employees || 0
  const coreProcesses = me?.core_processes?.length || 0

  // === PROCESS HEALTH LOGIC ===

  const requiredProcesses = 5
  const filledProcesses = coreProcesses

  const completenessScore = Math.min((filledProcesses / requiredProcesses) * 100, 100)
  const overloadedRoles = employees > 0 ? Math.max(coreProcesses - employees * 3, 0) : 0
  const overloadRatio = coreProcesses > 0 ? overloadedRoles / coreProcesses : 0
  const overloadScore = Math.max(100 - overloadRatio * 100, 0)

  const unassignedProcesses = requiredProcesses - filledProcesses
  const bottleneckScore = Math.max(100 - unassignedProcesses * 20, 0)

  const automationOpportunityScore = Math.min((filledProcesses / (employees || 1)) * 100, 100)
  const executionClarityScore = completenessScore * 0.6 + bottleneckScore * 0.4

  const overallScore = Number(
    (
      completenessScore * 0.25 +
      overloadScore * 0.2 +
      bottleneckScore * 0.2 +
      automationOpportunityScore * 0.15 +
      executionClarityScore * 0.2
    ).toFixed(1)
  )

  // Persist overall score
  useEffect(() => {
    try {
      const score = Number.isFinite(overallScore) ? overallScore : 0
      localStorage.setItem('score_process', JSON.stringify({ score, at: Date.now() }))
    } catch {}
  }, [overallScore])

  // === BASIC INSIGHT ENGINE (for metric cards) ===
  function getInsight(title: string, score: number) {
    if (score >= 80)
      return {
        msg: "Strong performance — maintain consistency and update SOPs regularly.",
        severity: "good" as const,
      }

    if (score >= 60)
      return {
        msg: "Good foundation — improve documentation and reduce friction points.",
        severity: "ok" as const,
      }

    if (score >= 40)
      return {
        msg: "Below healthy range — refine ownership, SOP clarity, or remove bottlenecks.",
        severity: "warning" as const,
      }

    return {
      msg: "Critical issue — immediate action required to stabilize processes.",
      severity: "bad" as const,
    }
  }

  // === STAGE LABEL ===
  function getStage(score: number) {
    if (score >= 80) {
      return {
        label: 'High',
        desc: 'Your processes are working well at this stage.',
        pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      }
    }
    if (score >= 60) {
      return {
        label: 'Moderate',
        desc: 'Processes are okay but can be tightened for scale.',
        pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      }
    }
    if (score >= 40) {
      return {
        label: 'Low',
        desc: 'You have real process gaps and bottlenecks.',
        pill: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      }
    }
    return {
      label: 'Critical',
      desc: 'Processes are fragile — risk of breakdown at scale.',
      pill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    }
  }

  // === IMPROVEMENT ENGINE ===
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

  function buildProcessRecommendations(): {
    simpleList: string[]
    cards: Recommendation[]
    roadmap: RoadmapStep[]
  } {
    const simpleList: string[] = []
    const cards: Recommendation[] = []
    const roadmap: RoadmapStep[] = []

    // Completeness low → missing SOPs/processes
    if (completenessScore < 70) {
      simpleList.push('Document missing core processes with clear SOPs.')
      cards.push({
        title: 'Fill Process Gaps',
        description: 'List your 5–7 core processes (Lead → Sale → Delivery → Retention) and document the ones missing or ad-hoc.',
        severity: completenessScore < 50 ? 'critical' : 'major',
      })
      roadmap.push({
        label: 'Step 1 — Map your core processes',
        detail: 'Write down each core process in one line: trigger → key steps → owner → output.',
      })
    }

    // Overload low → too many processes per role
    if (overloadScore < 70) {
      simpleList.push('Rebalance workloads so no single role is overloaded with too many processes.')
      cards.push({
        title: 'Reduce Role Overload',
        description: 'Identify roles that own too many processes and split responsibilities across clearer owners.',
        severity: overloadScore < 50 ? 'critical' : 'major',
      })
      roadmap.push({
        label: 'Step 2 — Reassign overloaded responsibilities',
        detail: 'For any role owning more than 3–4 processes, create sub-owners or team leads to share the load.',
      })
    }

    // Bottlenecks → unassigned or missing processes
    if (bottleneckScore < 70) {
      simpleList.push('Remove bottlenecks by assigning owners to unowned or slow steps.')
      cards.push({
        title: 'Eliminate Process Bottlenecks',
        description: 'Find stages where work piles up (handoffs, approvals) and give an owner authority to unblock quickly.',
        severity: bottleneckScore < 50 ? 'critical' : 'major',
      })
      roadmap.push({
        label: 'Step 3 — Fix bottleneck stages',
        detail: 'Look at where tasks wait the longest and assign an accountable owner with authority to move things forward.',
      })
    }

    // Automation opportunity
    if (automationOpportunityScore < 60) {
      simpleList.push('Introduce basic automation for repetitive steps (notifications, status updates, data entry).')
      cards.push({
        title: 'Automate Repetitive Work',
        description: 'Start with low-risk tasks (reminders, templates, status changes) before automating critical decisions.',
        severity: 'major',
      })
      roadmap.push({
        label: 'Step 4 — Pick 1–2 tasks to automate',
        detail: 'Choose the simplest repetitive tasks (e.g., follow-up emails, internal reminders) and automate them first.',
      })
    }

    // Execution clarity
    if (executionClarityScore < 70) {
      simpleList.push('Tighten SOP clarity — each process should have 3–5 steps and a visible owner.')
      cards.push({
        title: 'Tighten Execution Clarity',
        description: 'Simplify complex process docs into short, actionable checklists with a named owner on each.',
        severity: 'major',
      })
      roadmap.push({
        label: 'Step 5 — Turn SOPs into checklists',
        detail: 'Convert each process into a one-page checklist your team can actually use during work, not just read once.',
      })
    }

    // If everything is solid
    if (simpleList.length === 0) {
      simpleList.push('Your process health is strong — focus on continuous improvement and scalability.')
      cards.push({
        title: 'Scale What Works',
        description: 'Start adding metrics, dashboards, and regular reviews so your processes stay strong as volume grows.',
        severity: 'minor',
      })
      roadmap.push({
        label: 'Step 1 — Add process KPIs',
        detail: 'Give each core process 1–2 metrics (e.g., lead response time, delivery cycle time, NPS) and review monthly.',
      })
    }

    roadmap.push({
      label: 'Final Step — Review every quarter',
      detail: 'Recalculate process scores every 90 days and refresh this roadmap so your systems stay ahead of growth.',
    })

    return { simpleList, cards, roadmap }
  }

  const stage = getStage(Number.isFinite(overallScore) ? overallScore : 0)
  const { simpleList, cards, roadmap } = buildProcessRecommendations()

  const metrics = [
    {
      title: 'Process Completeness',
      raw: completenessScore,
      value: completenessScore.toFixed(1) + '%',
      icon: <ClipboardList className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Overload Score',
      raw: overloadScore,
      value: overloadScore.toFixed(1) + '%',
      icon: <Gauge className="w-6 h-6 text-purple-600" />,
    },
    {
      title: 'Bottleneck Risk',
      raw: bottleneckScore,
      value: bottleneckScore.toFixed(1) + '%',
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
    },
    {
      title: 'Automation Opportunity',
      raw: automationOpportunityScore,
      value: automationOpportunityScore.toFixed(1) + '%',
      icon: <Activity className="w-6 h-6 text-green-600" />,
    },
    {
      title: 'Execution Clarity',
      raw: executionClarityScore,
      value: executionClarityScore.toFixed(1) + '%',
      icon: <CheckCircle className="w-6 h-6 text-indigo-600" />,
    },
  ]

  if (err) {
    return <div className="h-full min-h-0 p-6 bg-slate-50 dark:bg-neutral-900 text-red-600">{err}</div>
  }

  if (!me && !err) {
    return <div className="h-full min-h-0 p-6 bg-slate-50 dark:bg-neutral-900">Loading…</div>
  }

  return (
    <div className="h-full min-h-0 p-6 bg-slate-50 dark:bg-neutral-900">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-neutral-100">
        Process Health Score
      </h1>

      {/* OVERALL SCORE + STAGE */}
      <div className="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow 
        border border-gray-200 dark:border-neutral-700 flex justify-between items-center">
        
        <div>
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">
            Overall Process Health
          </p>
          <div className="flex items-center gap-3">
            <h2 className="text-4xl font-extrabold text-blue-600">{overallScore}%</h2>
            <span className={`text-xs px-3 py-1 rounded-full inline-flex items-center gap-1 ${stage.pill}`}>
              {stage.label === 'Critical' && <AlertTriangle className="w-3 h-3" />}
              {stage.label === 'High' && <CheckCircle className="w-3 h-3" />}
              {stage.label}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
            {stage.desc}
          </p>
        </div>

        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <TrendingUp className="w-10 h-10 text-blue-600" />
        </div>
      </div>

      {/* METRICS WITH INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {metrics.map((m, i) => {
          const insight = getInsight(m.title, m.raw)

          return (
            <div
              key={i}
              className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow 
                border border-gray-200 dark:border-neutral-700"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-600 dark:text-neutral-400">{m.title}</p>
                {m.icon}
              </div>

              <h3 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">
                {m.value}
              </h3>

              {/* INSIGHT TEXT */}
              <div className="mt-3">
                <span
                  className={`
                    text-xs px-2 py-1 rounded block
                    ${insight.severity === "good" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"}
                    ${insight.severity === "ok" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}
                    ${insight.severity === "warning" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"}
                    ${insight.severity === "bad" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}
                  `}
                >
                  {insight.msg}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* A) SIMPLE RECOMMENDATION LIST */}
      <div className="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border border-gray-200 dark:border-neutral-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-2">
          How to Improve Your Process Score
        </h2>
        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
          These suggestions are based on completeness, overload, bottlenecks, automation, and clarity.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-neutral-300">
          {simpleList.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* B) COLORED RECOMMENDATION CARDS */}
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
          90-Day Process Improvement Roadmap
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
