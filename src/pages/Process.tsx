// FULL TSX-SAFE PROCESS HEALTH DASHBOARD WITH SALES-STYLE OVERALL SCORE CARD
import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { CheckCircle, AlertTriangle, ClipboardList, Gauge, Activity, TrendingUp } from 'lucide-react'

export default function ProcessHealthDashboard() {
  const [me, setMe] = useState<any>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/me')
        setMe(data)
      } catch (e: any) {
        setErr(e?.response?.data?.error ?? 'Failed to load profile')
      }
    })()
  }, [])

  const employees = me?.employees || 0
  const coreProcesses = me?.core_processes?.length || 0

  // === PROCESS HEALTH LOGIC ===

  const requiredProcesses = 5
  const filledProcesses = coreProcesses

  const completenessScore = Math.min((filledProcesses / requiredProcesses) * 100, 100)
  const overloadedRoles = employees > 0 ? Math.max(coreProcesses - employees * 3, 0) : 0
  const overloadRatio = coreProcesses > 0 ? overloadedRoles / coreProcesses : 0
  const overloadScore = 100 - overloadRatio * 100

  const unassignedProcesses = requiredProcesses - filledProcesses
  const bottleneckScore = Math.max(100 - unassignedProcesses * 20, 0)

  const automationOpportunityScore = Math.min((filledProcesses / (employees || 1)) * 100, 100)
  const executionClarityScore = completenessScore * 0.6 + bottleneckScore * 0.4

  const overallScore = Number(
    (
      completenessScore * 0.25 +
      overloadScore * 0.2 +
      bottleneckScore * 0.2 +
      automationOpportunityScore * 0.15 +
      executionClarityScore * 0.2
    ).toFixed(1)
  )

  // Persist overall score in localStorage for dashboard usage (always call hook)
  useEffect(() => {
    try {
      const score = Number.isFinite(overallScore) ? overallScore : 0
      localStorage.setItem('score_process', JSON.stringify({ score, at: Date.now() }))
    } catch {}
  }, [overallScore])

  const metrics = [
    {
      title: 'Process Completeness',
      value: completenessScore.toFixed(1) + '%',
      icon: <ClipboardList className="w-6 h-6 text-blue-600" />,
    },
    {
      title: 'Overload Score',
      value: overloadScore.toFixed(1) + '%',
      icon: <Gauge className="w-6 h-6 text-purple-600" />,
    },
    {
      title: 'Bottleneck Risk',
      value: bottleneckScore.toFixed(1) + '%',
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
    },
    {
      title: 'Automation Opportunity',
      value: automationOpportunityScore.toFixed(1) + '%',
      icon: <Activity className="w-6 h-6 text-green-600" />,
    },
    {
      title: 'Execution Clarity',
      value: executionClarityScore.toFixed(1) + '%',
      icon: <CheckCircle className="w-6 h-6 text-indigo-600" />,
    }
  ]

  return (
    <div className="min-h-screen p-6 bg-slate-50 dark:bg-neutral-900">
      {err && <p className="mb-4 text-red-600">{err}</p>}
      {!me && !err && <p className="p-2">Loading…</p>}
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-neutral-100">Process Health Score</h1>

      {/* SALES-STYLE OVERALL SCORE CARD */}
      <div className="mb-8 p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border border-gray-200 dark:border-neutral-700 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600 dark:text-neutral-400 mb-1">Overall Process Health</p>
          <h2 className="text-4xl font-extrabold text-blue-600">{overallScore}%</h2>
          <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Aggregated from 5 process quality markers</p>
        </div>
        <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          <TrendingUp className="w-10 h-10 text-blue-600" />
        </div>
      </div>

      {/* INDIVIDUAL METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="p-6 bg-white dark:bg-neutral-800 rounded-xl shadow border border-gray-200 dark:border-neutral-700"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-gray-600 dark:text-neutral-400">{m.title}</p>
              {m.icon}
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-neutral-100">{m.value}</h3>
          </div>
        ))}
      </div>
    </div>
  )
}