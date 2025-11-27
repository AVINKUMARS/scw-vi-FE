import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Percent, Package, RefreshCcw, Factory, AlertTriangle, Timer } from "lucide-react";
import DashboardLoader from "../components/DashboardLoader";

export default function OperationsDashboardUI() {
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
  const getColorClass = (value: string) => {
    const num = parseFloat(value.replace(/[^0-9.-]/g, ""));

    // Percentage-based metrics
    if (value.includes("%")) {
      if (num >= 80) return "text-emerald-600"; // very good
      if (num >= 60) return "text-yellow-500"; // okay
      return "text-red-500"; // needs improvement
    }

    // Generic numeric metrics (you can customize thresholds later)
    if (!isNaN(num)) {
      if (num <= 3) return "text-emerald-600"; // e.g. lower cycle time / defects is good
      if (num <= 7) return "text-yellow-500";
      return "text-red-500";
    }

    return "text-slate-900";
  };

  const metrics = [
    // Removed duplicates shown in top KPIs
    { title: "Stock", icon: Package, value: "1,200 units" },
    { title: "Defects", icon: AlertTriangle, value: "2.1%" },
    { title: "Cycle Time", icon: Timer, value: "3.4 days" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">Process Dashboard</h1>
            <p className="text-slate-500 dark:text-neutral-400">Premium SaaS view of your process KPIs</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/70 px-4 py-1 text-xs text-slate-500 dark:text-neutral-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Last 30 days · Dummy Data
          </div>
        </header>

        {/* Top KPIs (Overall + key ops metrics) */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Overall Ops Score */}
          <Card className="rounded-3xl border-none shadow-xl bg-white/80 dark:bg-neutral-900/70 backdrop-blur">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Overall Ops Score</div>
              <div className="text-4xl font-bold text-indigo-600">87%</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Health of purchase, inventory & production</p>
            </CardContent>
          </Card>

          {/* Purchase Saving % */}
          <Card className="rounded-3xl border-none shadow-md bg-white dark:bg-neutral-900/70">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Purchase Saving %</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-neutral-100">11%</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Calculated under Purchase</p>
            </CardContent>
          </Card>

          {/* Inventory Turnover */}
          <Card className="rounded-3xl border-none shadow-md bg-white dark:bg-neutral-900/70">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Inventory Turnover</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-neutral-100">7.5</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Under Inventory</p>
            </CardContent>
          </Card>

          {/* Production Capacity */}
          <Card className="rounded-3xl border-none shadow-md bg-white dark:bg-neutral-900/70">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Production Capacity</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-neutral-100">85%</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Under Production</p>
            </CardContent>
          </Card>
        </section>

        {/* All Operations Metrics Grid */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-neutral-300">All Operations Metrics</h2>
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
                    <div className="flex flex-col">
                      
                      <CardTitle className="text-[13px] font-medium text-slate-700 dark:text-neutral-200 leading-snug">
                        {m.title}
                      </CardTitle>
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

        {/* Roadmap Section */}
        <section className="mt-10 bg-white dark:bg-neutral-900/70 rounded-3xl shadow-md p-6 border border-slate-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-neutral-100 mb-4">Process Roadmap</h3>
          <div className="space-y-6">

            {/* Step 1 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 font-bold">1</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-100">Improve Purchase Savings</h4>
                <p className="text-slate-600 dark:text-neutral-300 text-sm mt-1">Negotiate better vendor contracts and optimize bulk purchasing to increase savings above 15%.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 font-bold">2</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-100">Reduce Defects</h4>
                <p className="text-slate-600 dark:text-neutral-300 text-sm mt-1">Implement stricter quality checks and root-cause analysis to push defects below 1.5%.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 font-bold">3</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-100">Enhance Production Efficiency</h4>
                <p className="text-slate-600 dark:text-neutral-300 text-sm mt-1">Optimize machine scheduling and reduce downtime to maintain above 90% production capacity.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 font-bold">4</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-100">Improve Cycle Time</h4>
                <p className="text-slate-600 dark:text-neutral-300 text-sm mt-1">Streamline workflows and remove bottlenecks to reduce cycle time under 2.5 days.</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}