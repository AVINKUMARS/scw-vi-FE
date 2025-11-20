import React from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import {
  ArrowRight,
  TrendingUp,
  Users,
  Workflow,
  DollarSign,
  Gauge,
  AlertTriangle,
  Sparkles,
  X,
  User,
} from 'lucide-react'

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

function scoreInsight(label: string, score: number | null): string {
  if (score == null) return `${label} score not set yet.`
  if (score < 40) return `${label} is critically weak — needs urgent action.`
  if (score < 60) return `${label} needs improvement — moderate issues detected.`
  if (score < 80) return `${label} is good but can be optimized.`
  return `${label} is excellent and performing strongly.`
}

function scoreColor(score: number | null) {
  if (score == null) return 'text-neutral-500'
  if (score < 40) return 'text-red-500'
  if (score < 60) return 'text-orange-500'
  if (score < 80) return 'text-yellow-500'
  return 'text-emerald-500'
}

function getOverallStage(score: number | null) {
  const val = typeof score === 'number' ? score : 0
  if (val >= 80) {
    return {
      label: 'High',
      desc: 'Your business is in a strong position — focus on scaling what works.',
      pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    }
  }
  if (val >= 60) {
    return {
      label: 'Moderate',
      desc: 'Healthy but clearly improvable across a few areas.',
      pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    }
  }
  if (val >= 40) {
    return {
      label: 'Low',
      desc: 'Important gaps exist — focus on fixing the weakest areas first.',
      pill: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    }
  }
  return {
    label: 'Critical',
    desc: 'Business health is at risk — start with the most broken area first.',
    pill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  }
}

type AreaKey = 'Team' | 'Process' | 'Sales' | 'Finance' | 'Founder'

export default function GrowthDashboard() {
  const nav = useNavigate()

  const [me, setMe] = React.useState<any>(null)
  const [loadingMe, setLoadingMe] = React.useState(true)
  const [errorMe, setErrorMe] = React.useState<string | null>(null)

  const [team, setTeam] = React.useState<number | null>(readScore('score_team'))
  const [processScore, setProcessScore] = React.useState<number | null>(
    readScore('score_process'),
  )
  const [sales, setSales] = React.useState<number | null>(readScore('score_sales'))
  const [finance, setFinance] = React.useState<number | null>(
    readScore('score_finance'),
  )
  const [founderScore, setFounderScore] = React.useState<number | null>(
    readScore('score_founder'),
  )

  const [simulationOpen, setSimulationOpen] = React.useState(false)
  const [activeArea, setActiveArea] = React.useState<AreaKey | null>(null)
  const [tempScore, setTempScore] = React.useState<number | null>(null)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data } = await api.get('/me')
        if (mounted) setMe(data)
      } catch {
        setErrorMe('Unable to load your profile.')
      } finally {
        setLoadingMe(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Overall Health — NOW includes Founder
  const realScores = [team, processScore, sales, finance, founderScore].filter(
    (v): v is number => typeof v === 'number',
  )
  const overall =
    realScores.length > 0
      ? Number(
          (realScores.reduce((a, b) => a + b, 0) / realScores.length).toFixed(1),
        )
      : null

  const stage = getOverallStage(overall)

  const getAreaScore = React.useCallback(
    (area: AreaKey): number | null => {
      if (area === 'Team') return team
      if (area === 'Process') return processScore
      if (area === 'Sales') return sales
      if (area === 'Finance') return finance
      return founderScore
    },
    [team, processScore, sales, finance, founderScore],
  )

  const updateAreaScore = React.useCallback((area: AreaKey, value: number) => {
    const safe = Math.max(0, Math.min(100, Math.round(value)))
    const payload = { score: safe, at: Date.now() }

    if (area === 'Team') {
      setTeam(safe)
      localStorage.setItem('score_team', JSON.stringify(payload))
    } else if (area === 'Process') {
      setProcessScore(safe)
      localStorage.setItem('score_process', JSON.stringify(payload))
    } else if (area === 'Sales') {
      setSales(safe)
      localStorage.setItem('score_sales', JSON.stringify(payload))
    } else if (area === 'Finance') {
      setFinance(safe)
      localStorage.setItem('score_finance', JSON.stringify(payload))
    } else if (area === 'Founder') {
      setFounderScore(safe)
      localStorage.setItem('score_founder', JSON.stringify(payload))
    }
  }, [])

  const openSimulation = (area: AreaKey) => {
    const current = getAreaScore(area) ?? 0
    setActiveArea(area)
    setTempScore(current)
    setSimulationOpen(true)
  }

  const closeSimulation = () => {
    setSimulationOpen(false)
    setActiveArea(null)
    setTempScore(null)
  }

  const Card = ({ title, value, icon, onClick, score }: any) => (
    <button
      onClick={onClick}
      className="group text-left bg-white/80 dark:bg-neutral-900/70 
      backdrop-blur-xl rounded-xl shadow-xl 
      border border-white/30 dark:border-neutral-800/40 
      p-6 hover:-translate-y-1 transition-all hover:shadow-2xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-blue-500" /> {scoreInsight(title, score)}
          </p>
        </div>
        <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">{icon}</div>
      </div>

      <div className="flex items-center justify-between">
        <div className={`text-3xl font-extrabold ${scoreColor(score)}`}>{value}</div>
        <ArrowRight className="w-5 h-5 text-neutral-400" />
      </div>
    </button>
  )

  const missingAreas: string[] = []
  if (team == null) missingAreas.push('Team')
  if (processScore == null) missingAreas.push('Process')
  if (sales == null) missingAreas.push('Sales')
  if (finance == null) missingAreas.push('Finance')
  if (founderScore == null) missingAreas.push('Founder')

  const founderBandLabel =
    founderScore == null
      ? 'Take the founder assessment to unlock this.'
      : founderScore < 40
      ? 'Critical founder gaps — behaviour is limiting the business.'
      : founderScore < 60
      ? 'Founder needs improvement — good instincts, weak operating system.'
      : founderScore < 80
      ? 'Strong founder base — tune leverage and leadership.'
      : 'High-leverage founder — focus on scaling systems and leaders.'

  // Simulation modal
  let simulationContent: JSX.Element | null = null
  if (simulationOpen && activeArea) {
    const currentScore = getAreaScore(activeArea) ?? 0
    const baselineOverall = typeof overall === 'number' ? overall : null
    const simulatedValue =
      typeof tempScore === 'number' ? tempScore : currentScore

    const simScores: (number | null)[] = [
      activeArea === 'Team' ? simulatedValue : team,
      activeArea === 'Process' ? simulatedValue : processScore,
      activeArea === 'Sales' ? simulatedValue : sales,
      activeArea === 'Finance' ? simulatedValue : finance,
      activeArea === 'Founder' ? simulatedValue : founderScore,
    ]
    const simList = simScores.filter((v): v is number => typeof v === 'number')
    const simulatedOverall =
      simList.length > 0
        ? Number((simList.reduce((a, b) => a + b, 0) / simList.length).toFixed(1))
        : null

    simulationContent = (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-2xl border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                Forecast Simulator
              </p>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {activeArea} score what-if
              </h3>
            </div>
            <button
              onClick={closeSimulation}
              className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </button>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-neutral-600 dark:text-neutral-300 mb-1">
                Current {activeArea} score:{' '}
                <span className="font-semibold">{currentScore}%</span>
              </p>
              <p className="text-neutral-600 dark:text-neutral-300">
                Drag the slider or use quick buttons to simulate improving this
                area. You’ll see how your{' '}
                <span className="font-semibold">Overall Health</span> changes.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  Simulated {activeArea} score
                </span>
                <span className="text-sm font-semibold">{simulatedValue}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={simulatedValue}
                onChange={e => setTempScore(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                {[2, 5, 10].map(delta => (
                  <button
                    key={delta}
                    type="button"
                    onClick={() =>
                      setTempScore(
                        Math.max(0, Math.min(100, simulatedValue + delta)),
                      )
                    }
                    className="text-xs px-2 py-1 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    +{delta}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-2 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                Overall Health impact
              </p>
              {baselineOverall != null && simulatedOverall != null ? (
                <p className="text-sm text-neutral-800 dark:text-neutral-200">
                  If you improve <span className="font-semibold">{activeArea}</span>{' '}
                  from <span className="font-semibold">{currentScore}%</span> to{' '}
                  <span className="font-semibold">{simulatedValue}%</span>, your
                  Overall Health would move from{' '}
                  <span className="font-semibold">{baselineOverall}%</span> to{' '}
                  <span className="font-semibold">{simulatedOverall}%</span>.
                </p>
              ) : (
                <p className="text-sm text-neutral-800 dark:text-neutral-200">
                  Set at least two area scores to see an Overall Health forecast.
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={closeSimulation}
                className="text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateAreaScore(activeArea, simulatedValue)
                  closeSimulation()
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Save these changes
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 p-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-neutral-950 dark:via-blue-950/40 dark:to-purple-950/40">
      <div className="max-w-7xl mx-auto">
        {/* 1️⃣ Goal Progress */}
        <div className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 dark:border-neutral-800/40 p-10 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/30 to-purple-300/30 opacity-40" />
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-extrabold flex items-center gap-2 text-gray-900 dark:text-white">
                Goal Progress
                <span className="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                  Live
                </span>
              </h2>
              <p className="text-gray-600 dark:text-neutral-400 mt-1">
                Your journey toward your revenue target.
              </p>

              {loadingMe && (
                <p className="text-gray-600 dark:text-neutral-400 mt-4">Loading…</p>
              )}

              {errorMe && (
                <p className="text-red-500 flex items-center gap-2 mt-4">
                  <AlertTriangle className="w-4 h-4" /> {errorMe}
                </p>
              )}

              {!loadingMe &&
                me &&
                (() => {
                  const mrr = Number(me?.monthly_revenue ?? 0)
                  const goalAmt = Number(me?.goal_amount ?? 0)
                  const years = Number(me?.goal_years ?? 0)
                  const pct = goalAmt ? Math.min(100, (mrr / goalAmt) * 100) : 0

                  return (
                    <>
                      <div className="relative mt-8">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div
                          className="absolute -top-4"
                          style={{ left: `calc(${pct}% - 20px)` }}
                        >
                          <div className="px-3 py-1 text-xs bg-blue-600 text-white rounded shadow-md">
                            {pct.toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-white/70 dark:bg-neutral-800/60 rounded-xl border border-white/20">
                          <p className="text-xs text-gray-500">Current MRR</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            ${mrr.toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-white/70 dark:bg-neutral-800/60 rounded-xl border border-white/20">
                          <p className="text-xs text-gray-500">Goal Amount</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {goalAmt ? `$${goalAmt.toLocaleString()}` : '—'}
                          </p>
                        </div>
                        <div className="p-4 bg-white/70 dark:bg-neutral-800/60 rounded-xl border border-white/20">
                          <p className="text-xs text-gray-500">Timeframe</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {years ? `${years} year${years > 1 ? 's' : ''}` : '—'}
                          </p>
                        </div>
                      </div>
                    </>
                  )
                })()}
            </div>

            {!loadingMe &&
              me &&
              (() => {
                const mrr = Number(me?.monthly_revenue ?? 0)
                const goalAmt = Number(me?.goal_amount ?? 0)
                const pct = goalAmt ? Math.min(100, (mrr / goalAmt) * 100) : 0

                const radius = 70
                const circ = 2 * Math.PI * radius
                const offset = circ - (pct / 100) * circ

                return (
                  <div className="relative w-44 h-44">
                    <svg className="w-full h-full rotate-[-90deg]">
                      <circle
                        cx="88"
                        cy="88"
                        r={radius}
                        stroke="rgba(150,150,150,0.2)"
                        strokeWidth="12"
                        fill="transparent"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r={radius}
                        stroke="url(#goalGrad)"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circ}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="goalGrad">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                          {pct.toFixed(0)}%
                        </p>
                        <p className="text-sm text-gray-500 dark:text-neutral-400">
                          Complete
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}
          </div>
        </div>

        {/* 2️⃣ Overall Health */}
        <div className="bg-white/80 dark:bg-neutral-900/70 rounded-2xl p-8 shadow-xl border border-white/30 dark:border-neutral-800/40 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-neutral-100">
                Overall Health
              </h1>
              <p className="text-gray-600 dark:text-neutral-400 mt-1">
                Combined signal across Team, Process, Sales, Finance and Founder.
              </p>
              {missingAreas.length > 0 && (
                <p className="mt-1 text-xs text-orange-500">
                  Missing scores: {missingAreas.join(', ')} — complete those pages to
                  firm up this score.
                </p>
              )}
              {founderScore != null && (
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                  Founder Strength: <span className="font-semibold">{founderScore}%</span>{' '}
                  — {founderBandLabel}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <TrendingUp className="w-10 h-10 text-blue-600" />
              <div className="flex flex-col items-end">
                <div className={`text-6xl font-extrabold ${scoreColor(overall)}`}>
                  {overall != null ? `${overall}%` : '—'}
                </div>
                <span
                  className={`mt-1 text-xs px-3 py-1 rounded-full ${stage.pill}`}
                >
                  {stage.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3️⃣ Core Cards + Founder Card (rich) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          <Card
            title="Team"
            value={team != null ? `${team}%` : '—'}
            score={team}
            icon={<Users className="w-6 h-6 text-blue-500" />}
            onClick={() => nav('/team')}
          />
          <Card
            title="Process"
            value={processScore != null ? `${processScore}%` : '—'}
            score={processScore}
            icon={<Workflow className="w-6 h-6 text-purple-500" />}
            onClick={() => nav('/process')}
          />
          <Card
            title="Sales"
            value={sales != null ? `${sales}%` : '—'}
            score={sales}
            icon={<Gauge className="w-6 h-6 text-orange-500" />}
            onClick={() => nav('/sales')}
          />
          <Card
            title="Finance"
            value={finance != null ? `${finance}%` : '—'}
            score={finance}
            icon={<DollarSign className="w-6 h-6 text-emerald-500" />}
            onClick={() => nav('/finance')}
          />

          {/* Rich Founder Card (A+B+C) */}
          <div className="bg-white/80 dark:bg-neutral-900/70 backdrop-blur-xl rounded-xl shadow-xl border border-white/30 dark:border-neutral-800/40 p-6 flex flex-col justify-between">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Founder Strength
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Mindset · Execution · Leadership · Financial awareness
                </p>
              </div>
              <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <User className="w-6 h-6 text-pink-500" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-3">
              <div className={`text-3xl font-extrabold ${scoreColor(founderScore)}`}>
                {founderScore != null ? `${founderScore}%` : '—'}
              </div>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                from founder assessment
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
              {founderBandLabel}
            </p>

            <button
              type="button"
              onClick={() => nav('/founder')}
              className="mt-auto inline-flex items-center justify-center text-xs px-3 py-1.5 rounded-full bg-pink-600 text-white hover:bg-pink-700"
            >
              View founder report
              <ArrowRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>

        {/* 4️⃣ Forecast Across Core Areas (Team, Process, Sales, Finance, Founder) */}
        <div className="bg-white/80 dark:bg-neutral-900/70 rounded-2xl p-8 shadow-xl border border-white/30 dark:border-neutral-800/40 mb-12">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-neutral-100">
            Forecast Across Core Areas
          </h2>
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-6">
            Choose any area — Team, Process, Sales, Finance or Founder — and simulate
            improving its score. See how your Overall Health changes before making
            real changes in your business.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
            {[
              { label: 'Team', value: team, icon: <Users className="w-5 h-5" /> },
              {
                label: 'Process',
                value: processScore,
                icon: <Workflow className="w-5 h-5" />,
              },
              { label: 'Sales', value: sales, icon: <Gauge className="w-5 h-5" /> },
              {
                label: 'Finance',
                value: finance,
                icon: <DollarSign className="w-5 h-5" />,
              },
              {
                label: 'Founder',
                value: founderScore,
                icon: <User className="w-5 h-5" />,
              },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => openSimulation(item.label as AreaKey)}
                className="text-left p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                      {item.icon}
                    </div>
                    <span className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-sm font-semibold ${scoreColor(item.value)}`}>
                    {typeof item.value === 'number' ? `${item.value}%` : '—'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mb-3">
                  Click to simulate improving {item.label} and see the new Overall
                  score.
                </p>
                <span className="text-xs inline-flex items-center gap-1 text-blue-600">
                  <ArrowRight className="w-3 h-3" />
                  Open forecast
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {simulationContent}
    </div>
  )
}
