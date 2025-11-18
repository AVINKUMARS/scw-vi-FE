import React, { useEffect, useState } from 'react'
import { DollarSign, ShoppingCart, Users, FileText, Activity, AlertTriangle, CheckCircle } from 'lucide-react'
import { api } from '../lib/api'

type SalesMetric = {
  id: number
  source_type: string
  payload: { file_name?: string }
  total_sales: number | null
  bill_row_count: number | null
  unique_bill_count: number | null
  created_at: string
}

export default function SalesDashboard() {
  const [latestMetrics, setLatestMetrics] = useState<SalesMetric | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // TEMP values until backend supports these
  const customersLastMonth = 40
  const customersCurrent = 50

  const monthlyRevenueHistory = [15000, 16000, 18000, 17819]

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data } = await api.get('/data/sales/latest')
      setLatestMetrics(data)
    } catch (e: any) {
      setError(e?.response?.data?.error ?? 'Failed to load sales data.')
    } finally {
      setLoading(false)
    }
  }

  const totalSales = latestMetrics?.total_sales ?? 0
  const billCount = latestMetrics?.bill_row_count ?? 0
  const uniqueBills = latestMetrics?.unique_bill_count ?? 0

  const avgOrderValue = billCount > 0 ? totalSales / billCount : 0
  const customers = uniqueBills || 1

  // ===============================
  // 🔵 SALES HEALTH SCORE LOGIC
  // ===============================

  // 1. Customer Growth Score
  const growthRate =
    customersLastMonth > 0
      ? (customersCurrent - customersLastMonth) / customersLastMonth
      : 0
  const customerGrowthScore = Math.min(Math.max(growthRate * 100, 0), 100)

  // 2. ARPC Score
  const arpc = totalSales / customers

  const [industry] = useState<'Retail' | 'Service' | 'Manufacturing'>('Retail')

  let benchmarkMedian = 3000
  if (industry === 'Service') benchmarkMedian = 30000
  else if (industry === 'Manufacturing') benchmarkMedian = 100000

  const arpcScore = Math.min((arpc / benchmarkMedian) * 100, 100)

  // 3. Revenue Consistency Score
  const last = monthlyRevenueHistory.at(-1) ?? 0
  const prev = monthlyRevenueHistory.at(-2) ?? last
  const revVarPercent =
    prev > 0 ? Math.abs((last - prev) / prev) * 100 : 0

  let revenueConsistencyScore = 0
  if (revVarPercent < 10) revenueConsistencyScore = 95
  else if (revVarPercent < 30) revenueConsistencyScore = 80
  else revenueConsistencyScore = 55

  // === Combined Sales Health Score ===
  const salesHealthScore = Number(
    (
      customerGrowthScore * 0.4 +
      arpcScore * 0.3 +
      revenueConsistencyScore * 0.3
    ).toFixed(1)
  )

  useEffect(() => {
    try {
      const score = Number.isFinite(salesHealthScore) ? salesHealthScore : 0
      localStorage.setItem('score_sales', JSON.stringify({ score, at: Date.now() }))
    } catch {}
  }, [salesHealthScore])

  // STAGE
  function getStage(score: number) {
    if (score >= 80) {
      return {
        label: 'High',
        desc: 'Sales engine is performing well.',
        pill: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      }
    }
    if (score >= 60) {
      return {
        label: 'Moderate',
        desc: 'Sales are healthy but can be more consistent and higher value.',
        pill: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      }
    }
    if (score >= 40) {
      return {
        label: 'Low',
        desc: 'Sales are fragile — pipeline or pricing is weak.',
        pill: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      }
    }
    return {
      label: 'Critical',
      desc: 'Sales system is at risk — needs urgent improvement.',
      pill: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    }
  }

  // SALES INSIGHT ENGINE (for sub metrics)
  function getSalesInsight(title: string, score: number) {
    if (score >= 80)
      return {
        msg: "Strong performance — maintain consistency and scale proven strategies.",
        severity: "good" as const,
      }

    if (score >= 60)
      return {
        msg: "Healthy but room to optimize — refine pricing, retention & sales cycle.",
        severity: "ok" as const,
      }

    if (score >= 40)
      return {
        msg: "Below target — improve lead quality, customer value or conversion flow.",
        severity: "warning" as const,
      }

    return {
      msg: "Critical weakness — urgent fixes needed in sales process or product value.",
      severity: "bad" as const,
    }
  }

  // IMPROVEMENT ENGINE
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

  function buildSalesRecommendations(): {
    simpleList: string[]
    cards: Recommendation[]
    roadmap: RoadmapStep[]
  } {
    const simpleList: string[] = []
    const cards: Recommendation[] = []
    const roadmap: RoadmapStep[] = []

    if (customerGrowthScore < 60) {
      simpleList.push('Increase qualified lead flow and improve retention to grow customers month-over-month.')
      cards.push({
        title: 'Boost Customer Growth',
        description: 'Tighten your lead sources, improve follow-up speed, and add simple win-back campaigns for churned customers.',
        severity: customerGrowthScore < 40 ? 'critical' : 'major',
      })
      roadmap.push({
        label: 'Step 1 — Improve lead & follow-up',
        detail: 'Define SLAs for lead response times and ensure every warm lead gets at least 3–5 structured follow-ups.',
      })
    }

    if (arpcScore < 60) {
      simpleList.push('Increase ARPC by improving packaging, upsell, and adding higher-value offers.')
      cards.push({
        title: 'Increase Revenue per Customer',
        description: 'Introduce bundles, tiers, or add-ons that encourage customers to upgrade or buy more frequently.',
        severity: 'major',
      })
      roadmap.push({
        label: 'Step 2 — Design a better offer ladder',
        detail: 'Create “Good / Better / Best” offers so your best-fit customers have a clear reason to pay more.',
      })
    }

    if (revenueConsistencyScore < 80) {
      simpleList.push('Make sales more predictable by smoothing seasonality and stabilizing pipeline volume.')
      cards.push({
        title: 'Stabilize Revenue Consistency',
        description: 'Create recurring campaigns, retainers or contracts that lock in more predictable monthly revenue.',
        severity: revenueConsistencyScore < 60 ? 'major' : 'minor',
      })
      roadmap.push({
        label: 'Step 3 — Add recurring revenue',
        detail: 'Identify at least one part of your offer that can be sold as a subscription, retainer, or ongoing service.',
      })
    }

    if (simpleList.length === 0) {
      simpleList.push('Your sales health is strong — focus on scaling channel mix and sales team capacity.')
      cards.push({
        title: 'Scale Your Sales System',
        description: 'Document your current winning playbook and train new reps to replicate top-performer behavior.',
        severity: 'minor',
      })
      roadmap.push({
        label: 'Step 1 — Codify your sales playbook',
        detail: 'Write down scripts, objection handling, and follow-up sequences that already work in your best deals.',
      })
    }

    roadmap.push({
      label: 'Final Step — Review sales health monthly',
      detail: 'Recalculate your sales health score and refine campaigns and offers every 30 days.',
    })

    return { simpleList, cards, roadmap }
  }

  const stage = getStage(Number.isFinite(salesHealthScore) ? salesHealthScore : 0)
  const { simpleList, cards, roadmap } = buildSalesRecommendations()

  const insights = [
    {
      title: "Customer Growth",
      raw: customerGrowthScore,
    },
    {
      title: "ARPC",
      raw: arpcScore,
    },
    {
      title: "Revenue Consistency",
      raw: revenueConsistencyScore,
    },
  ]

  const StatCard = ({ title, value, icon: Icon, color, insight }: any) => (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow border border-gray-200 dark:border-neutral-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-neutral-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-neutral-100">{value}</p>

          {/* INSIGHT */}
          {insight && (
            <span
              className={`
                text-xs mt-3 px-2 py-1 rounded block
                ${insight.severity === "good" &&
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"}
                ${insight.severity === "ok" &&
                  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"}
                ${insight.severity === "warning" &&
                  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"}
                ${insight.severity === "bad" &&
                  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"}
              `}
            >
              {insight.msg}
            </span>
          )}
        </div>

        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )

  if (loading) return <div className="p-8 text-center">Loading sales data…</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto">

        {/* SALES HEALTH SCORE + STAGE */}
        <div className="mb-10 p-6 bg-white dark:bg-neutral-900 rounded-xl shadow border border-gray-200 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-neutral-100">
                Sales Health Score
              </h2>
              <div className="flex items-center gap-3">
                <div className="text-5xl font-extrabold text-blue-600">{salesHealthScore}%</div>
                <span
                  className={`text-xs px-3 py-1 rounded-full inline-flex items-center gap-1 ${stage.pill}`}
                >
                  {stage.label === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                  {stage.label === 'High' && <CheckCircle className="w-3 h-3" />}
                  {stage.label}
                </span>
              </div>
              <p className="text-gray-600 dark:text-neutral-400 mt-1">
                {stage.desc}
              </p>
            </div>
          </div>
        </div>

        {/* MAIN SALES METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`$${totalSales.toLocaleString()}`}
            icon={DollarSign}
            color="bg-green-50 dark:bg-green-900/20"
          />
          <StatCard
            title="Avg Order Value"
            value={`$${avgOrderValue.toFixed(2)}`}
            icon={ShoppingCart}
            color="bg-blue-50 dark:bg-blue-900/20"
          />
          <StatCard
            title="Total Bills"
            value={billCount}
            icon={FileText}
            color="bg-orange-50 dark:bg-orange-900/20"
          />
          <StatCard
            title="Unique Customers"
            value={uniqueBills}
            icon={Users}
            color="bg-purple-50 dark:bg-purple-900/20"
          />
        </div>

        {/* SALES SCORE SUB-METRICS */}
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-neutral-100">
          Sales Quality Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {insights.map((i, idx) => {
            const insight = getSalesInsight(i.title, i.raw)

            return (
              <StatCard
                key={idx}
                title={i.title}
                value={i.raw.toFixed(1) + "%"}
                icon={Activity}
                color="bg-gray-50 dark:bg-gray-800"
                insight={insight}
              />
            )
          })}
        </div>

        {/* A) SIMPLE RECOMMENDATION LIST */}
        <div className="mb-8 p-6 bg-white dark:bg-neutral-900 rounded-xl shadow border border-gray-200 dark:border-neutral-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 mb-2">
            How to Improve Your Sales Score
          </h2>
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
            These actions are based on customer growth, ARPC and revenue consistency.
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
            Priority Sales Actions
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

        {/* C) 90-DAY SALES ROADMAP */}
        <div className="mb-10 p-6 bg-white dark:bg-neutral-900 rounded-xl shadow border border-gray-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-3">
            90-Day Sales Roadmap
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
    </div>
  )
}
