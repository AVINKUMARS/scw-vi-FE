import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Users, UserCheck, Activity, Briefcase, BarChart3, AlarmClock, IndianRupee } from "lucide-react";
import DashboardLoader from "../components/DashboardLoader";

export default function TeamDashboardUI() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    if (value.includes("%")) {
      if (num >= 90) return "text-emerald-600";
      if (num >= 70) return "text-yellow-500";
      return "text-red-500";
    }

    if (!isNaN(num)) {
      if (num >= 80) return "text-emerald-600";
      if (num >= 50) return "text-yellow-500";
      return "text-red-500";
    }

    return "text-slate-900";
  };

  const metrics = [
    { title: "Req Emps vs Act Emps", icon: Users, value: "94%" },
    { title: "Revenue vs No of Emps", icon: IndianRupee, value: "₹2.4L / emp" },
    { title: "Burn Out", icon: Activity, value: "18%" },
    { title: "TL vs No of Emps", icon: UserCheck, value: "1:12" },
    { title: "Manager Team", icon: Briefcase, value: "5 Managers" },
    { title: "Role vs Process", icon: BarChart3, value: "82% mapped" },
    { title: "Revenue vs Profit", icon: IndianRupee, value: "18% margin" },
    { title: "Revenue vs Salary", icon: IndianRupee, value: "3.2x" },
    { title: "Salary Date vs Actual Date", icon: AlarmClock, value: "96% on-time" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-neutral-900 dark:to-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-neutral-100 tracking-tight">Team Dashboard</h1>
            <p className="text-slate-500 dark:text-neutral-400">Premium SaaS view of your team KPIs</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/70 px-4 py-1 text-xs text-slate-500 dark:text-neutral-300 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Last 30 days · Dummy Data
          </div>
        </header>

        {/* Top KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Overall Team Score */}
          <Card className="rounded-3xl border-none shadow-xl bg-white/80 dark:bg-neutral-900/70 backdrop-blur">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Overall Team Score</div>
              <div className="text-4xl font-bold text-indigo-600">84%</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Health of team capacity, performance & stability</p>
            </CardContent>
          </Card>

          {/* Req vs Actual Employees */}
          <Card className="rounded-3xl border-none shadow-md bg-white dark:bg-neutral-900/70">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Req Emps vs Act Emps</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-neutral-100">94%</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Required vs actual employees</p>
            </CardContent>
          </Card>

          {/* Burn Out */}
          <Card className="rounded-3xl border-none shadow-md bg-white dark:bg-neutral-900/70">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Burn Out Risk</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-neutral-100">18%</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Share of team at risk</p>
            </CardContent>
          </Card>

          {/* Salary On-time % */}
          <Card className="rounded-3xl border-none shadow-md bg-white dark:bg-neutral-900/70">
            <CardContent className="py-6 px-6 flex flex-col gap-2">
              <div className="text-sm font-medium text-slate-500 dark:text-neutral-400">Salary On-time</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-neutral-100">96%</div>
              <p className="text-xs text-slate-400 dark:text-neutral-500">Salary date vs actual date</p>
            </CardContent>
          </Card>
        </section>

        {/* All Team Metrics */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-600 dark:text-neutral-300">All Team Metrics</h2>
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

        {/* Team Roadmap */}
        <section className="mt-10 bg-white dark:bg-neutral-900/70 rounded-3xl shadow-md p-6 border border-slate-200 dark:border-neutral-800">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-neutral-100 mb-4">Team Roadmap</h3>
          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 font-bold">1</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-100">Balance Capacity</h4>
                <p className="text-slate-600 dark:text-neutral-300 text-sm mt-1">Fill critical open roles while avoiding overstaffing to keep Req vs Actual near 100%.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 font-bold">2</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-100">Reduce Burn Out</h4>
                <p className="text-slate-600 dark:text-neutral-300 text-sm mt-1">Monitor workload, encourage time-off, and improve planning to bring burn out below 10%.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 font-bold">3</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-100">Align Roles with Processes</h4>
                <p className="text-slate-600 dark:text-neutral-300 text-sm mt-1">Clarify responsibilities and map every process to an owner to raise role vs process alignment.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 font-bold">4</div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-neutral-100">Strengthen Financial Efficiency</h4>
                <p className="text-slate-600 dark:text-neutral-300 text-sm mt-1">Improve revenue vs salary and revenue vs profit ratios through better performance management.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}