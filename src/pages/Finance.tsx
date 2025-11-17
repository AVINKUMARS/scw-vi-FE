import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart2,
  Gauge,
} from "lucide-react";

export default function FinanceHealthDashboard() {
  const [me, setMe] = useState<any>(null);
  const [sales, setSales] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const profile = await api.get("/me");
        setMe(profile.data);

        const latestSales = await api.get("/data/sales/latest");
        setSales(latestSales.data);
      } catch (e: any) {
        setErr(e?.response?.data?.error ?? "Failed to load finance data");
      }
    })();
  }, []);

  // ========== DATA SOURCES ==========
  const revenue = (me?.monthly_revenue || sales?.total_sales || 0) as number;
  const employees = (me?.employees || 1) as number;
  const customers = (sales?.unique_bill_count || 1) as number;
  const industry = (me?.industry_type || "Retail") as string;

  // ========== 1. Revenue Growth ==========
  const lastMonthRevenue = revenue * 0.9;
  const growth = (revenue - lastMonthRevenue) / lastMonthRevenue;
  const revenueGrowthScore = Math.min(growth * 100, 100);

  // ========== 2. Profitability (Updated) ==========
  // Salary cost = 40% of revenue (more realistic for small business)
  const salaryCost = revenue * 0.4;
  const operatingCost = revenue * 0.2;

  const estimatedMargin =
    (revenue - salaryCost - operatingCost) / revenue; // should be between 0–1

  let expectedMargin = 0.08; // retail default
  if (industry === "Service") expectedMargin = 0.3;
  if (industry === "Manufacturing") expectedMargin = 0.15;
  if (industry === "Retail") expectedMargin = 0.08;

  const profitabilityScore = Math.max(
    Math.min((estimatedMargin / expectedMargin) * 100, 100),
    0
  );

  // ========== 3. Operational Efficiency ==========
  const revenuePerEmployee = revenue / employees;

  let efficiencyBenchmark = 3000; // retail default
  if (industry === "Service") efficiencyBenchmark = 12000;
  if (industry === "Manufacturing") efficiencyBenchmark = 8000;
  if (industry === "Retail") efficiencyBenchmark = 3000;

  const efficiencyScore = Math.min(
    (revenuePerEmployee / efficiencyBenchmark) * 100,
    100
  );

  // ========== 4. ARPU ==========
  const arpu = revenue / customers;

  let arpuBenchmark = 3000; // retail default
  if (industry === "Service") arpuBenchmark = 20000;
  if (industry === "Manufacturing") arpuBenchmark = 80000;
  if (industry === "Retail") arpuBenchmark = 3000;

  const arpuScore = Math.min((arpu / arpuBenchmark) * 100, 100);

  // ========== 5. Runway ==========
  const goalYears = Number(me?.goal_years ?? 0)
  const runwayMonths = goalYears > 0 ? goalYears * 12 : 6;
  const runwayScore = Math.min((runwayMonths / 12) * 100, 100);

  // ========== FINAL WEIGHTED SCORE ==========
  const financeScore = Number(
    (
      revenueGrowthScore * 0.25 +
      profitabilityScore * 0.25 +
      efficiencyScore * 0.25 +
      arpuScore * 0.15 +
      runwayScore * 0.10
    ).toFixed(1)
  );

  // Persist overall score in localStorage for dashboard usage (always call hook)
  useEffect(() => {
    try {
      const score = Number.isFinite(financeScore) ? financeScore : 0
      localStorage.setItem('score_finance', JSON.stringify({ score, at: Date.now() }))
    } catch {}
  }, [financeScore])

  // Cards
  const cards = [
    {
      title: "Revenue Growth",
      value: revenueGrowthScore.toFixed(1) + "%",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Profitability Score",
      value: profitabilityScore.toFixed(1) + "%",
      icon: DollarSign,
      color: "text-indigo-600",
    },
    {
      title: "Operational Efficiency",
      value: efficiencyScore.toFixed(1) + "%",
      icon: Gauge,
      color: "text-purple-600",
    },
    {
      title: "ARPU Score",
      value: arpuScore.toFixed(1) + "%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Runway Score",
      value: runwayScore.toFixed(1) + "%",
      icon: BarChart2,
      color: "text-orange-600",
    },
  ];

  if (err) return <p className="p-6 text-red-600">{err}</p>;
  if (!me || !sales) return <p className="p-6">Loading finance data…</p>;

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-neutral-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Finance Health Score
      </h1>

      {/* OVERALL SCORE */}
      <div className="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Overall Finance Health
        </h2>
        <div className="text-5xl font-extrabold text-blue-600 mt-2">
          {financeScore}%
        </div>
        <p className="text-gray-600 dark:text-neutral-400 mt-1">
          Based on growth, profitability, ARPU, efficiency & runway.
        </p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div
            key={i}
            className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                {c.title}
              </p>
              <c.icon className={`w-6 h-6 ${c.color}`} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
              {c.value}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}