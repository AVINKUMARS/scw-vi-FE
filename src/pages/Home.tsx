import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calculator,
  Divide,
  Gauge,
  PieChart,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

export default function DiagnoseDashboardUI() {
  const getColorClass = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ""));

    if (value.includes("%")) {
      if (num >= 75) return "text-emerald-600";
      if (num >= 50) return "text-yellow-500";
      return "text-red-500";
    }

    if (!isNaN(num)) {
      if (num >= 2) return "text-emerald-600";
      if (num >= 1) return "text-yellow-500";
      return "text-red-500";
    }

    return "text-slate-900 dark:text-slate-200";
  };

  type Metric = {
    id: number;
    title: string;
    tag: string;
    icon: any;
    value: string;
  };

  const metrics: Metric[] = [
    { id: 1, title: "BEP (Break Even Point)", tag: "S", icon: Gauge, value: "₹3.2L" },
    { id: 2, title: "Cashflow vs Net Profit", tag: "G", icon: Wallet, value: "1.3x" },
    { id: 3, title: "Emp / Sales", tag: "S", icon: Divide, value: "₹2.1L / emp" },
    { id: 4, title: "Team / BEP", tag: "T · P", icon: Activity, value: "1.4x" },
    { id: 5, title: "Inventory Turnover vs Stock vs Dead Stock", tag: "P", icon: BarChart3, value: "7.2" },
    { id: 6, title: "LTV vs CAC", tag: "S", icon: PieChart, value: "3.8x" },
    { id: 7, title: "Production vs Conversion Speed", tag: "S", icon: TrendingUp, value: "1.2x" },
    { id: 8, title: "Asset / Debt Ratio", tag: "F", icon: Calculator, value: "1.7" },
    { id: 9, title: "Profit vs BEP", tag: "S", icon: TrendingUp, value: "1.4x" },
    { id: 10, title: "Runway", tag: "F", icon: Gauge, value: "14 months" },
    { id: 11, title: "Revenue / Sales Executive", tag: "T", icon: BarChart3, value: "₹3.5L" },
    { id: 12, title: "CAC Payback Period", tag: "S", icon: TrendingDown, value: "9 months" },
    { id: 13, title: "ACID Test", tag: "F · Liquidity", icon: AlertTriangle, value: "1.1" },
    { id: 14, title: "Operating Cashflow Margin", tag: "F", icon: Wallet, value: "22%" },
    { id: 15, title: "Budget vs Variance Ratio", tag: "F", icon: BarChart3, value: "91%" },
    { id: 16, title: "BEP vs 2x (Magical Sales Number)", tag: "E · S", icon: Gauge, value: "2.1x" },
  ];

  const topKpiIds = [1, 6, 10, 14];
  const topKpis = metrics.filter((m) => topKpiIds.includes(m.id));
  const gridMetrics = metrics.filter((m) => !topKpiIds.includes(m.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">Dashboard Page</h1>
            
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/70 px-4 py-1 text-xs text-slate-500 dark:text-neutral-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Last 30 days · Dummy Data
          </div>
        </header>

        {/* Goal Progress - New Combined UI */}
        <section className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-neutral-800 dark:to-neutral-900 p-8 rounded-3xl shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-neutral-100 flex items-center gap-2">
                Goal Progress
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-semibold dark:bg-indigo-900/50 dark:text-indigo-400">Live</span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-neutral-300 mt-1">Your journey toward your revenue target.</p>
            </div>

            {/* Circular Progress */}
            <div className="relative w-32 h-32 mt-6 md:mt-0">
              <svg className="w-full h-full rotate-90">
                <circle cx="64" cy="64" r="50" className="stroke-slate-200 dark:stroke-neutral-700" strokeWidth="10" fill="none" />
                <circle cx="64" cy="64" r="50" className="stroke-indigo-500" strokeWidth="10" fill="none" strokeDasharray="314" strokeDashoffset="282" strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold text-slate-900 dark:text-neutral-100">10%</span>
                  <span className="text-xs text-slate-500 dark:text-neutral-300 mt-1">Complete</span>
                </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-slate-200 dark:bg-neutral-700 rounded-full relative mb-10">
            <div className="h-full bg-indigo-500 rounded-full" style={{ width: "10%" }}></div>
            <div className="absolute -top-6 left-[10%] transform -translate-x-1/2 text-xs font-semibold bg-indigo-600 text-white dark:bg-indigo-500 px-2 py-0.5 rounded-md">
              10%
            </div>
          </div>

          {/* Data Blocks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">Current MRR</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹10,000</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">Goal Amount</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">₹1,00,000</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm">
              <p className="text-xs text-slate-500 dark:text-slate-400">Timeframe</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">3 years</p>
            </div>
          </div>
        </section>

        {/* Top KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {topKpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.id} className="rounded-3xl border-none shadow-xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur">
                <CardContent className="py-6 px-6 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{kpi.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-neutral-700 dark:text-neutral-300 uppercase">
                      {kpi.tag}
                    </span>
                  </div>
                  <div className={`text-3xl font-bold ${getColorClass(kpi.value)}`}>{kpi.value}</div>
                  <Icon className="w-4 h-4 text-slate-300 dark:text-neutral-600 mt-1" />
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* All Diagnose Metrics */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-slate-400">All Diagnose Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gridMetrics.map((m) => {
              const Icon = m.icon;
              return (
                <Card
                  key={m.id}
                  className="rounded-2xl border border-slate-100 dark:border-neutral-700 bg-white/90 dark:bg-neutral-800/90 shadow-sm hover:shadow-md transition"
                >
                  <CardHeader className="flex flex-row items-center gap-3 pb-1 px-4 pt-4">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/50">
                      <Icon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <div className="flex flex-col">
                      <CardTitle className="text-[13px] font-medium text-slate-700 dark:text-slate-300 leading-snug">
                        {m.title}
                      </CardTitle>
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase mt-1">
                        Tag: {m.tag}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className={`mt-2 text-2xl font-semibold ${getColorClass(m.value)}`}>{m.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Diagnose Roadmap */}
        <section className="mt-10 bg-white dark:bg-neutral-800 rounded-3xl shadow-md p-6 border border-slate-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Diagnose Roadmap</h3>
          <div className="space-y-6">

            {/* Step 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold">1</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Improve Break Even Efficiency</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Increase sales or reduce costs to lower BEP and reach profitability earlier.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold">2</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Strengthen Finance Stability</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Improve runway, increase operating cashflow, and maintain a healthy liquidity ratio.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold">3</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Optimize Sales Efficiency</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Increase revenue per employee, improve CAC payback, and strengthen LTV/CAC ratio.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400 font-bold">4</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200">Improve Operational Alignment</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Reduce dead stock, increase production speed, and align teams with financial and sales targets.</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
