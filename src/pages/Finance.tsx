import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { DollarSign, ClipboardList, TrendingDown, Briefcase, Wallet, PieChart, Activity } from "lucide-react";

export default function FinanceDashboardUI() {
  const getColorClass = (value) => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
    if (value.includes("%")) {
      if (num >= 70) return "text-emerald-600";
      if (num >= 40) return "text-yellow-500";
      return "text-red-500";
    }
    if (!isNaN(num)) {
      if (num >= 1000000) return "text-emerald-600";
      if (num >= 300000) return "text-yellow-500";
      return "text-red-500";
    }
    return "text-slate-900";
  };

  const metrics = [
    { title: "Gross Profit (GP)", icon: DollarSign, value: "₹4,50,000" },
    { title: "Net Profit (NP)", icon: Wallet, value: "₹2,20,000" },
    { title: "Total Expenses", icon: ClipboardList, value: "₹1,80,000" },
    { title: "Cashflow", icon: Activity, value: "₹95,000" },
    { title: "COGS (Cost of Goods Sold)", icon: TrendingDown, value: "₹1,20,000" },
    { title: "Debt", icon: Briefcase, value: "₹3,00,000" },
    { title: "Assets", icon: PieChart, value: "₹12,50,000" },
    { title: "Budget", icon: DollarSign, value: "₹5,00,000" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">Finance Dashboard</h1>
            <p className="text-slate-500 dark:text-neutral-400">Premium SaaS view of your financial KPIs</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/70 px-4 py-1 text-xs text-slate-500 dark:text-neutral-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Last 30 days · Dummy Data
          </div>
        </header>

        

        {/* Top KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Overall Score */}
          <Card className="rounded-3xl border-none shadow-xl bg-white/80 dark:bg-neutral-900/70 backdrop-blur">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Overall Score</div>
              <div className="text-4xl font-bold text-indigo-600">89%</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Finance health indicator</p>
            </CardContent>
          </Card>
          {/* Gross Profit */}
          <Card className="rounded-3xl border-none shadow-xl bg-white/80 dark:bg-neutral-900/70 backdrop-blur">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Gross Profit</div>
              <div className="text-4xl font-bold text-indigo-600">₹4,50,000</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Calculated financial metric</p>
            </CardContent>
          </Card>

          {/* Net Profit */}
          <Card className="rounded-3xl border-none shadow-xl bg-white/80 dark:bg-neutral-900/70 backdrop-blur">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Net Profit</div>
              <div className="text-4xl font-bold text-indigo-600">₹2,20,000</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">After deducting all expenses</p>
            </CardContent>
          </Card>

          {/* Cashflow */}
          <Card className="rounded-3xl border-none shadow-xl bg-white/80 dark:bg-neutral-900/70 backdrop-blur">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Cashflow</div>
              <div className="text-4xl font-bold text-indigo-600">₹95,000</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Cash movement health</p>
            </CardContent>
          </Card>
        </section>

        {/* Metrics grid */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-neutral-300">All Financial Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((m, index) => {
              const Icon = m.icon;
              return (
                <Card key={index} className="rounded-2xl border border-slate-100 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/70 shadow-sm hover:shadow-md transition">
                  <CardHeader className="flex flex-row items-center gap-3 pb-1 px-4 pt-4">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                      <Icon className="w-4 h-4 text-indigo-500" />
                    </div>
                    <CardTitle className="text-[13px] font-medium text-slate-700 dark:text-neutral-200 leading-snug">{m.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className={`mt-2 text-2xl font-semibold ${getColorClass(m.value)}`}>{m.value}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="mt-10 bg-white dark:bg-neutral-900/70 rounded-3xl shadow-md p-6 border border-slate-100 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-neutral-100 mb-4">Finance Roadmap</h3>
          <div className="space-y-6">

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">1</div>
              <div>
                <h4 className="font-semibold text-slate-800">Reduce Expenses</h4>
                <p className="text-slate-600 text-sm mt-1">Analyze unnecessary operational costs and negotiate vendor pricing.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">2</div>
              <div>
                <h4 className="font-semibold text-slate-800">Improve Cashflow</h4>
                <p className="text-slate-600 text-sm mt-1">Collect pending invoices faster and optimize payment cycles.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">3</div>
              <div>
                <h4 className="font-semibold text-slate-800">Optimize COGS</h4>
                <p className="text-slate-600 text-sm mt-1">Identify high-cost suppliers and explore cheaper material alternatives.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">4</div>
              <div>
                <h4 className="font-semibold text-s slate-800">Strengthen Asset Management</h4>
                <p className="text-slate-600 text-sm mt-1">Track asset depreciation and ensure efficient utilization.</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
