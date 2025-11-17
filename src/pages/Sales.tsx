import { useEffect, useState } from 'react'
import { DollarSign, ShoppingCart, Users, FileText, Activity } from 'lucide-react'
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
    fetchData();
  }, []);

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
  const growthRate = (customersCurrent - customersLastMonth) / customersLastMonth
  const customerGrowthScore = Math.min(Math.max(growthRate * 100, 0), 100)

  // 2. ARPC Score
  const arpc = totalSales / customers

  // Make industry dynamic for demo (could be from props, state, or user input)
  const [industry, setIndustry] = useState<'Retail' | 'Service' | 'Manufacturing'>('Retail')

  let benchmarkMedian = 3000
  if (industry === 'Service') benchmarkMedian = 30000
  else if (industry === 'Manufacturing') benchmarkMedian = 100000
  // else if (industry === 'Retail') benchmarkMedian = 3000 (already set above)

  const arpcScore = Math.min((arpc / benchmarkMedian) * 100, 100)

  // 3. Revenue Consistency Score
  const revVarPercent = Math.abs(
    (monthlyRevenueHistory[monthlyRevenueHistory.length - 1] -
      monthlyRevenueHistory[monthlyRevenueHistory.length - 2]) /
    monthlyRevenueHistory[monthlyRevenueHistory.length - 2]
  ) * 100

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

  // Persist overall score in localStorage for dashboard usage (always call hook)
  useEffect(() => {
    try {
      const score = Number.isFinite(salesHealthScore) ? salesHealthScore : 0
      localStorage.setItem('score_sales', JSON.stringify({ score, at: Date.now() }))
    } catch { }
  }, [salesHealthScore])

  if (loading) return <div className="p-8 text-center">Loading sales data…</div>
  if (error) return <div className="p-8 text-red-600">{error}</div>

  const COLORS = ['#8b5cf6', '#f97316']

  const billUniquenessData = [
    { name: 'Unique Bills', value: uniqueBills },
    { name: 'Duplicate Rows', value: billCount - uniqueBills },
  ]

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 shadow border border-gray-200 dark:border-neutral-800">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-neutral-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-neutral-100">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto">

        {/* ===========================
            🔵 SALES HEALTH SCORE — TOP
        ============================ */}
        <div className="mb-10 p-6 bg-white dark:bg-neutral-900 rounded-xl shadow border border-gray-200 dark:border-neutral-800">
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-neutral-100">
            Sales Health Score
          </h2>
          <div className="text-5xl font-extrabold text-blue-600">{salesHealthScore}%</div>
          <p className="text-gray-600 dark:text-neutral-400 mt-1">
            Based on customer growth, ARPC, and revenue consistency.
          </p>
        </div>

        {/* =====================
            MAIN SALES METRICS
        ====================== */}
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
      </div>
    </div>
  );
}