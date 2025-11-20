import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  TrendingUp,
  DollarSign,
  Users,
  BarChart2,
  Gauge,
  AlertTriangle,
  CheckCircle,
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
  const growth = lastMonthRevenue > 0 ? (revenue - lastMonthRevenue) / lastMonthRevenue : 0;
  const revenueGrowthScore = Math.min(Math.max(growth * 100, 0), 100);

  // ========== 2. Profitability ==========
  const salaryCost = revenue * 0.4;
  const operatingCost = revenue * 0.2;

  const estimatedMargin =
    revenue > 0 ? (revenue - salaryCost - operatingCost) / revenue : 0;

  let expectedMargin = 0.08;
  if (industry === "Service") expectedMargin = 0.3;
  if (industry === "Manufacturing") expectedMargin = 0.15;
  if (industry === "Retail") expectedMargin = 0.08;

  const profitabilityScore = Math.max(
    Math.min((estimatedMargin / expectedMargin) * 100, 100),
    0
  );

  // ========== 3. Operational Efficiency ==========
  const revenuePerEmployee = revenue / employees;

  let efficiencyBenchmark = 3000;
  if (industry === "Service") efficiencyBenchmark = 12000;
  if (industry === "Manufacturing") efficiencyBenchmark = 8000;

  const efficiencyScore = Math.min(
    (revenuePerEmployee / efficiencyBenchmark) * 100,
    100
  );

  // ========== 4. ARPU ==========
  const arpu = revenue / customers;

  let arpuBenchmark = 3000;
  if (industry === "Service") arpuBenchmark = 20000;
  if (industry === "Manufacturing") arpuBenchmark = 80000;

  const arpuScore = Math.min((arpu / arpuBenchmark) * 100, 100);

  // ========== 5. Runway ==========
  const goalYears = Number(me?.goal_years ?? 0);
  const runwayMonths = goalYears > 0 ? goalYears * 12 : 6;
  const runwayScore = Math.min((runwayMonths / 12) * 100, 100);

  // ========== FINAL WEIGHTED SCORE ==========
  const financeScore = Number(
    (
      revenueGrowthScore * 0.25 +
      profitabilityScore * 0.25 +
      efficiencyScore * 0.25 +
      arpuScore * 0.15 +
      runwayScore * 0.1
    ).toFixed(1)
  );

  // Persist
  useEffect(() => {
    try {
      const score = Number.isFinite(financeScore) ? financeScore : 0;
      localStorage.setItem(
        "score_finance",
        JSON.stringify({ score, at: Date.now() })
      );
    } catch {}
  }, [financeScore]);

  // STAGE LABEL
  function getStage(score: number) {
    if (score >= 80)
      return {
        label: "High",
        desc: "Finance health is strong and scalable.",
        pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
      };
    if (score >= 60)
      return {
        label: "Moderate",
        desc: "Healthy but can be optimized for margin and efficiency.",
        pill: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      };
    if (score >= 40)
      return {
        label: "Low",
        desc: "Finance structure is fragile — margins or efficiency are weak.",
        pill: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      };
    return {
      label: "Critical",
      desc: "Financial health is at risk — needs urgent corrections.",
      pill: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    };
  }

  // INSIGHT ENGINE (for metric cards)
  function getFinanceInsight(title: string, score: number) {
    if (score >= 80)
      return {
        msg: "Strong performance — maintain consistency and track monthly trends.",
        severity: "good" as const,
      };

    if (score >= 60)
      return {
        msg: "Healthy but optimizable — refine pricing, efficiency or cost control.",
        severity: "ok" as const,
      };

    if (score >= 40)
      return {
        msg: "Below recommended levels — address cost structure or lead quality.",
        severity: "warning" as const,
      };

    return {
      msg: "Critical — immediate financial action required to stabilize the business.",
      severity: "bad" as const,
    };
  }

  // IMPROVEMENT ENGINE
  type RecSeverity = "critical" | "major" | "minor";

  type Recommendation = {
    title: string;
    description: string;
    severity: RecSeverity;
  };

  type RoadmapStep = {
    label: string;
    detail: string;
  };

  function buildFinanceRecommendations(): {
    simpleList: string[];
    cards: Recommendation[];
    roadmap: RoadmapStep[];
  } {
    const simpleList: string[] = [];
    const cards: Recommendation[] = [];
    const roadmap: RoadmapStep[] = [];

    if (revenueGrowthScore < 60) {
      simpleList.push("Strengthen top-of-funnel and deal velocity to increase revenue growth.");
      cards.push({
        title: "Boost Revenue Growth",
        description: "Improve lead generation, shorten sales cycles, and tighten follow-ups on warm opportunities.",
        severity: revenueGrowthScore < 40 ? "critical" : "major",
      });
      roadmap.push({
        label: "Step 1 — Audit your pipeline",
        detail: "Review lead sources, conversion rates, and time-to-close to identify where growth is leaking.",
      });
    }

    if (profitabilityScore < 60) {
      simpleList.push("Improve profitability by reducing fixed costs or increasing effective pricing.");
      cards.push({
        title: "Fix Profitability Leaks",
        description: "Review gross margin by product or service, and trim unproductive spend that doesn’t drive revenue.",
        severity: profitabilityScore < 40 ? "critical" : "major",
      });
      roadmap.push({
        label: "Step 2 — Map unit economics",
        detail: "Calculate margin per product/service and cut or reprice low-margin items first.",
      });
    }

    if (efficiencyScore < 60) {
      simpleList.push("Increase revenue per employee by focusing team time on high-value activities.");
      cards.push({
        title: "Increase Revenue per Employee",
        description: "Move people away from low-impact admin tasks and towards sales, delivery and retention work.",
        severity: "major",
      });
      roadmap.push({
        label: "Step 3 — Refocus team priorities",
        detail: "Reallocate 10–20% of time from internal admin to directly revenue-generating or retention activities.",
      });
    }

    if (arpuScore < 60) {
      simpleList.push("Increase ARPU by improving packaging, upsell, and pricing discipline.");
      cards.push({
        title: "Improve ARPU",
        description: "Introduce higher-value tiers, bundles, or add-ons that increase average revenue per customer.",
        severity: "major",
      });
      roadmap.push({
        label: "Step 4 — Adjust pricing and offers",
        detail: "Design at least one higher-priced offer for your best-fit customers and test uptake.",
      });
    }

    if (runwayScore < 60) {
      simpleList.push("Extend runway by improving cash flow and reducing non-essential expenses.");
      cards.push({
        title: "Extend Financial Runway",
        description: "Delay non-critical spending and introduce upfront or annual billing for key customers.",
        severity: "critical",
      });
      roadmap.push({
        label: "Step 5 — Strengthen cash position",
        detail: "Negotiate better payment terms with vendors and encourage upfront payments where possible.",
      });
    }

    if (simpleList.length === 0) {
      simpleList.push("Your finance health is strong — focus on forecasting and scenario planning.");
      cards.push({
        title: "Scale Finance Strategy",
        description: "Introduce rolling 12-month forecasts and regular KPI reviews to stay ahead of growth.",
        severity: "minor",
      });
      roadmap.push({
        label: "Step 1 — Build a simple forecast",
        detail: "Create monthly revenue/cost projections and track actuals vs. plan to steer decisions.",
      });
    }

    roadmap.push({
      label: "Final Step — Review finance score monthly",
      detail: "Recalculate your finance health each month and update this improvement plan accordingly.",
    });

    return { simpleList, cards, roadmap };
  }

  const stage = getStage(Number.isFinite(financeScore) ? financeScore : 0);
  const { simpleList, cards, roadmap } = buildFinanceRecommendations();

  const cardMetrics = [
    {
      title: "Revenue Growth",
      value: revenueGrowthScore.toFixed(1) + "%",
      raw: revenueGrowthScore,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Profitability Score",
      value: profitabilityScore.toFixed(1) + "%",
      raw: profitabilityScore,
      icon: DollarSign,
      color: "text-indigo-600",
    },
    {
      title: "Operational Efficiency",
      value: efficiencyScore.toFixed(1) + "%",
      raw: efficiencyScore,
      icon: Gauge,
      color: "text-purple-600",
    },
    {
      title: "ARPU Score",
      value: arpuScore.toFixed(1) + "%",
      raw: arpuScore,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Runway Score",
      value: runwayScore.toFixed(1) + "%",
      raw: runwayScore,
      icon: BarChart2,
      color: "text-orange-600",
    },
  ];

  if (err) return <p className="p-6 text-red-600">{err}</p>;
  if (!me || !sales) return <p className="p-6">Loading finance data…</p>;

  return (
    <div className="h-full min-h-0 p-6 bg-gray-50 dark:bg-neutral-900">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Finance Health Score
      </h1>

      {/* OVERALL SCORE + STAGE */}
      <div className="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Overall Finance Health
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-5xl font-extrabold text-blue-600">
                {financeScore}%
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full inline-flex items-center gap-1 ${stage.pill}`}
              >
                {stage.label === "Critical" && (
                  <AlertTriangle className="w-3 h-3" />
                )}
                {stage.label === "High" && <CheckCircle className="w-3 h-3" />}
                {stage.label}
              </span>
            </div>
            <p className="text-gray-600 dark:text-neutral-400 mt-1">
              {stage.desc}
            </p>
          </div>
        </div>
      </div>

      {/* METRIC CARDS WITH INSIGHTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {cardMetrics.map((c, i) => {
          const numeric = c.raw;
          const insight = getFinanceInsight(c.title, numeric);

          return (
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

              <div className="mt-3">
                <span
                  className={`
                    text-xs px-2 py-1 rounded block
                    ${
                      insight.severity === "good" &&
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                    }
                    ${
                      insight.severity === "ok" &&
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    }
                    ${
                      insight.severity === "warning" &&
                      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                    }
                    ${
                      insight.severity === "bad" &&
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }
                  `}
                >
                  {insight.msg}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* A) SIMPLE RECOMMENDATION LIST */}
      <div className="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          How to Improve Your Finance Score
        </h2>
        <p className="text-sm text-gray-600 dark:text-neutral-400 mb-3">
          These actions are based on growth, profitability, efficiency, ARPU and
          runway.
        </p>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-neutral-300">
          {simpleList.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* B) COLORED RECOMMENDATION CARDS */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Priority Financial Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((c, idx) => {
            const severityClasses =
              c.severity === "critical"
                ? "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800"
                : c.severity === "major"
                ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                : "border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800";

            const badgeLabel =
              c.severity === "critical"
                ? "Critical"
                : c.severity === "major"
                ? "High Priority"
                : "Nice to Improve";

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
            );
          })}
        </div>
      </div>

      {/* C) ROADMAP */}
      <div className="mb-10 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          90-Day Finance Roadmap
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 dark:text-neutral-300">
          {roadmap.map((step, idx) => (
            <li key={idx}>
              <span className="font-medium text-gray-900 dark:text-white">
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
  );
}
