import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { BarChart3, TrendingUp, DollarSign, Users, PieChart, Activity } from "lucide-react";
import DashboardLoader from "../components/DashboardLoader";

export default function SalesDashboardUI() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-950">
        <DashboardLoader />
      </div>
    );
  }
  const getColorClass = (value) => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ""));

    if (value.includes("%")) {
      if (num >= 70) return "text-emerald-600";
      if (num >= 40) return "text-yellow-500";
      return "text-red-500";
    }

    if (!isNaN(num)) {
      if (num >= 1000) return "text-emerald-600";
      if (num >= 300) return "text-yellow-500";
      return "text-red-500";
    }

    return "text-slate-900 dark:text-slate-200";
  };

  const metrics = [
    { title: "Average Bill Value", icon: BarChart3, value: "₹240" },
    { title: "Number of Bills", icon: Activity, value: "502" },
    { title: "Lead to Conversion Rate", icon: PieChart, value: "12%" },
    { title: "Customer Acquisition Cost (CAC)", icon: DollarSign, value: "₹45" },
    { title: "Lifetime Value (LTV)", icon: Users, value: "₹1,250" },
    { title: "Customer Retention Rate", icon: TrendingUp, value: "78%" },
    { title: "Customer Churn Rate", icon: Activity, value: "5%" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">Sales Metrics</h1>
            <p className="text-slate-500 dark:text-neutral-400">Premium SaaS view of your key KPIs</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/70 px-4 py-1 text-xs text-slate-500 dark:text-neutral-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Last 30 days · Dummy Data
          </div>
        </header>

        {/* Top KPIs row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Overall score */}
          <Card className="rounded-3xl border-none shadow-xl bg-white/80 dark:bg-neutral-900/70 backdrop-blur">
            <CardContent className="py-6 px-6 flex flex-col justify-between h-full">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Overall Score</div>
              <div className="mt-4 text-5xl font-extrabold text-indigo-600 leading-none">92%</div>
              <p className="mt-3 text-xs text-slate-400">Combined view of all sales metrics (dummy for UI demo).</p>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="rounded-3xl border-none shadow-md bg-white dark:bg-neutral-900/70">
            <CardContent className="py-5 px-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-neutral-400">Total Revenue</span>
                <span className="inline-flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  +8.5% MoM
                </span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-slate-900 dark:text-neutral-100">₹120,000</span>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Growth Rate */}
          <Card className="rounded-3xl border-none shadow-md bg-white dark:bg-neutral-900/70">
            <CardContent className="py-5 px-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500 dark:text-neutral-400">Revenue Growth Rate</span>
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-slate-900 dark:text-neutral-100">8.5%</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Metrics grid */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-neutral-300">All Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((m, index) => {
              const Icon = m.icon;
              return (
                <Card
                  key={index}
                  className="rounded-2xl border border-slate-100 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/70 shadow-sm hover:shadow-md transition"
                >
                  <CardHeader className="flex flex-row items-center gap-3 pb-1 px-4 pt-4">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30">
                      <Icon className="w-4 h-4 text-indigo-500" />
                    </div>
                    <CardTitle className="text-[13px] font-medium text-slate-700 dark:text-neutral-200 leading-snug">
                      {m.title}
                    </CardTitle>
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
        <section className="mt-10 bg-white dark:bg-neutral-800/50 rounded-3xl shadow-md p-6 border border-slate-100 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-neutral-200 mb-4">Roadmap</h3>

          <div className="space-y-6">

            {/* Step 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">1</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-200">Improve Revenue Growth</h4>
                <p className="text-slate-600 dark:text-neutral-400 text-sm mt-1">Focus on enhancing conversion funnels and increasing average bill value to boost your growth rate above 12%.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">2</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-200">Reduce Churn Rate</h4>
                <p className="text-slate-600 dark:text-neutral-400 text-sm mt-1">Analyze customer feedback and improve retention strategies to bring churn from 5% down to 3%.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">3</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-200">Enhance Retention Performance</h4>
                <p className="text-slate-600 dark:text-neutral-400 text-sm mt-1">Strengthen customer loyalty programs and improve user engagement to push retention above 85%.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold">4</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-200">Optimize CAC</h4>
                <p className="text-slate-600 dark:text-neutral-400 text-sm mt-1">Maintain or reduce CAC by optimizing marketing spend and focusing on high-converting customer segments.</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}