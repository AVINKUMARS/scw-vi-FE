import React, { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

type PrefillEntry = { period: string; total_revenue?: number; bill_count?: number }

export default function SalesDataCard({ prompt, onSubmit }: {
  prompt?: { period?: string; months_required?: number; description?: string; prefill?: PrefillEntry[] }
  onSubmit: (rows: any[]) => void
}) {
  if (!prompt) {
    // Legacy UI: user can enter Period, Revenue, Bill Count; starts with last 3 months pre-filled periods
    const mkPeriod = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const now = new Date()
    // Use last 3 months (excluding current month)
    const base: PrefillEntry[] = [1, 2, 3].map(i => ({ period: mkPeriod(new Date(now.getFullYear(), now.getMonth() - i, 1)) }))
    const [rows, setRows] = useState<PrefillEntry[]>(base)
    const [submitting, setSubmitting] = useState(false)

    const setField = (idx: number, key: keyof PrefillEntry, val: string) => {
      setRows(prev => prev.map((r, i) => i === idx ? {
        ...r,
        [key]: key === 'period' ? val : (val === '' ? undefined : Number(val))
      } : r))
    }
    const canSubmit = rows.length > 0 && rows.every(r => r.period && typeof r.bill_count === 'number' && !Number.isNaN(r.bill_count))

    // Auto-fill last month's total_revenue from backend if available
    useEffect(() => {
      (async () => {
        try {
          const last = new Date()
          last.setMonth(last.getMonth() - 1)
          const computed = mkPeriod(last)
          const { data } = await api.get(`/sales/kpis?period=${computed}`)
          const kpis = Array.isArray(data?.kpis) ? data.kpis : []
          const tr = kpis.find((k: any) => String(k?.name || '').toLowerCase() === 'total_revenue')
          const val = tr && (tr.value != null) ? Number(tr.value) : undefined
          const period = typeof data?.period === 'string' && data.period ? data.period : computed
          setRows(prev => {
            const out = [...prev]
            if (out.length > 0) {
              out[0] = { ...out[0], period, total_revenue: val, bill_count: undefined }
            } else {
              out.push({ period, total_revenue: val, bill_count: undefined })
            }
            return out
          })
        } catch {
          // best-effort only
        }
      })()
    }, [])

    return (
      <div className="max-w-[720px] w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
        <div className="text-sm font-semibold mb-3">Provide recent sales</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-neutral-500">
                <th className="py-2 pr-2">Period (YYYY-MM)</th>
                <th className="py-2 pr-2">Total Revenue</th>
                <th className="py-2 pr-2">Bill Count</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx} className="border-t border-neutral-100 dark:border-neutral-800">
                  <td className="py-2 pr-2 w-40">
                    <input value={r.period || ''} onChange={e => setField(idx, 'period', e.target.value)} placeholder="2025-11" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1" />
                  </td>
                  <td className="py-2 pr-2 w-40">
                    <input type="number" inputMode="decimal" value={typeof r.total_revenue === 'number' ? r.total_revenue : ''} onChange={e => setField(idx, 'total_revenue', e.target.value)} placeholder="10000" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1" />
                  </td>
                  <td className="py-2 pr-2 w-40">
                    <input type="number" inputMode="numeric" value={typeof r.bill_count === 'number' ? r.bill_count : ''} onChange={e => setField(idx, 'bill_count', e.target.value)} placeholder="120" className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button onClick={() => setRows(prev => [...prev, { period: mkPeriod(now) }])} className="px-2 py-1 text-xs rounded-md border border-neutral-300 dark:border-neutral-700">Add Month</button>
          <button
            disabled={submitting || !canSubmit}
            onClick={async () => {
              if (!canSubmit) return
              try {
                setSubmitting(true)
                const out = rows.map(r => ({ period: r.period, revenue: r.total_revenue, billCount: Number(r.bill_count) }))
                onSubmit(out)
              } finally { setSubmitting(false) }
            }}
            className={`px-3 py-1.5 rounded-md text-sm font-semibold ${canSubmit ? 'bg-gradient-to-r from-brand1 via-brand2 to-brand3 text-white' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
          >
            {submitting ? 'Submitting…' : 'Submit'}
          </button>
        </div>
      </div>
    )
  }

  // Prompt-driven UI
  const monthsRequired = Math.max(1, Number(prompt?.months_required ?? (prompt?.prefill?.length || 1)))
  const baseRows = useMemo(() => {
    const pf = Array.isArray(prompt?.prefill) ? prompt.prefill : []
    return pf.slice(0, monthsRequired)
  }, [prompt?.prefill, monthsRequired])

  const [rows, setRows] = useState<PrefillEntry[]>(() => baseRows.map(r => ({ ...r })))
  const [submitting, setSubmitting] = useState(false)

  const updateBill = (idx: number, val: string) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, bill_count: val === '' ? undefined : Number(val) } : r))
  }

  const canSubmit = rows.length > 0 && rows.every(r => typeof r.bill_count === 'number' && !Number.isNaN(r.bill_count))

  return (
    <div className="max-w-[720px] mb-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Sales Data Needed</div>
          {prompt?.description && (
            <div className="text-xs text-neutral-500 mt-0.5">{prompt.description}</div>
          )}
        </div>
        <div className="text-xs text-neutral-500">Months: {monthsRequired}</div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500">
              <th className="py-2 pr-2">Period</th>
              <th className="py-2 pr-2">Total Revenue</th>
              <th className="py-2 pr-2">Bill Count</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="py-2 pr-2 whitespace-nowrap">{r.period}</td>
                <td className="py-2 pr-2 w-48">
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    value={typeof r.total_revenue === 'number' ? r.total_revenue : ''}
                    onChange={e => setRows(prev => prev.map((it, i) => i === idx ? { ...it, total_revenue: e.target.value === '' ? undefined : Number(e.target.value) } : it))}
                    placeholder="Enter revenue"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                  />
                </td>
                <td className="py-2 pr-2 w-40">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={typeof r.bill_count === 'number' ? r.bill_count : ''}
                    onChange={e => updateBill(idx, e.target.value)}
                    placeholder="Enter bills"
                    className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          disabled={submitting || !canSubmit}
          onClick={async () => {
            if (!canSubmit) return
            try {
              setSubmitting(true)
              const out = rows.map(r => ({ period: r.period!, total_revenue: r.total_revenue, bill_count: Number(r.bill_count) }))
              onSubmit(out)
            } finally { setSubmitting(false) }
          }}
          className={`px-3 py-1.5 rounded-md text-sm font-semibold ${canSubmit ? 'bg-gradient-to-r from-brand1 via-brand2 to-brand3 text-white' : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 cursor-not-allowed'}`}
        >
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </div>
  )
}
