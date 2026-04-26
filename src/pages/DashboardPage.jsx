import { useCallback, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { buildDashboardCsv, downloadTextFile } from '../lib/dashboardCsv'

function formatDateTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

function ProgressRing({ value, size = 56, stroke = 5, label }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90" role="img" aria-label={label || `Progress ${value}%`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-slate-100"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-emerald-500 transition-[stroke-dashoffset] duration-500"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

function StatCard({ label, value, detail, icon, accentClass }) {
  const num = parseFloat(String(value).replace('%', '')) || 0
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${accentClass}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">{value}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{detail}</p>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="rounded-xl bg-slate-50 p-2 text-slate-700">{icon}</div>
          <ProgressRing value={Math.min(100, Math.max(0, num))} size={52} stroke={4} label={`${label}: ${value}`} />
        </div>
      </div>
    </article>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="mt-3 h-9 w-20 rounded bg-slate-200" />
      <div className="mt-3 h-12 w-full rounded bg-slate-100" />
    </div>
  )
}

export default function DashboardPage() {
  const [state, setState] = useState({ loading: true, data: null, error: '' })

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }))
    api
      .getDashboard()
      .then((data) => setState({ loading: false, data, error: '' }))
      .catch(() => setState({ loading: false, data: null, error: 'Could not load dashboard data.' }))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (state.loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-8 w-64 max-w-full rounded-lg bg-slate-200" />
          <div className="h-4 w-96 max-w-full rounded bg-slate-100" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-8 text-center">
        <p className="font-medium text-red-800">{state.error}</p>
        <p className="mt-2 text-sm text-red-700/90">Check your connection and API URL, then try again.</p>
        <button
          type="button"
          onClick={load}
          className="mt-6 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const { metrics, topParishes } = state.data
  const meta = state.data.meta || { generatedAt: null, dataAsOf: null }
  const maxRate = Math.max(...topParishes.map((p) => p.repaymentRate), 1)

  function handleExportCsv() {
    const csv = buildDashboardCsv(state.data)
    const stamp = (meta.generatedAt || new Date().toISOString()).slice(0, 10)
    downloadTextFile(`pdmrevolve-dashboard-${stamp}.csv`, csv)
  }

  const icons = {
    clock: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    check: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    book: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-slate-50 px-6 py-8 shadow-sm sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-slate-200/30 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Transparency dashboard</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Pilot performance snapshot</h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600">
              Anonymized indicators for district, parish, and SACCO teams—aligned with PDM pillars on financial inclusion,
              mindset change, and governance.
            </p>
            <dl className="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-2 sm:gap-x-6">
              <div>
                <dt className="font-medium text-slate-500">Snapshot from API</dt>
                <dd className="mt-0.5 tabular-nums text-slate-700">{formatDateTime(meta.generatedAt)}</dd>
              </div>
              <div>
                <dt className="font-medium text-slate-500">Underlying data last changed</dt>
                <dd className="mt-0.5 tabular-nums text-slate-700">
                  {meta.dataAsOf ? formatDateTime(meta.dataAsOf) : 'Not tracked (mock or legacy API)'}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-slate-500">
              Reload the page to refresh figures. Auto-refresh can be wired when your ops team wants live boards.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </section>

      <section aria-labelledby="kpi-heading">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 id="kpi-heading" className="text-lg font-semibold text-slate-900">
              Key indicators
            </h3>
            <p className="text-sm text-slate-500">Repayment discipline and learning uptake this reporting window.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="On-time repayment"
            value={`${metrics.onTimeRepaymentRate}%`}
            detail="Share of beneficiaries paying on or before the due date—keeps the revolving fund liquid."
            icon={icons.clock}
            accentClass="ring-1 ring-emerald-500/5"
          />
          <StatCard
            label="Full repayment completion"
            value={`${metrics.fullRepaymentRate}%`}
            detail="Loan cycles closed at 100%—unlocks next-cycle eligibility and stronger group trust."
            icon={icons.check}
            accentClass="ring-1 ring-teal-500/5"
          />
          <StatCard
            label="Education completion"
            value={`${metrics.educationCompletionRate}%`}
            detail="Assigned learning modules completed—supports mindset change and better money habits."
            icon={icons.book}
            accentClass="ring-1 ring-cyan-500/5"
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Top repaying parishes</h3>
              <p className="text-sm text-slate-500">Relative performance (anonymized where required by policy).</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">Leaderboard</span>
          </div>
          <ul className="mt-6 space-y-4">
            {topParishes.map((parish, index) => {
              const width = (parish.repaymentRate / maxRate) * 100
              return (
                <li
                  key={parish.parishName}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-emerald-200/80 hover:bg-white"
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white shadow-sm"
                      aria-hidden
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-semibold text-slate-900">{parish.parishName}</p>
                        <p className="text-lg font-bold tabular-nums text-emerald-700">{parish.repaymentRate}%</p>
                      </div>
                      <p className="text-sm text-slate-500">{parish.households.toLocaleString()} active households</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200/80">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </article>

        <aside className="space-y-4 rounded-2xl border border-slate-200 bg-slate-900 p-6 text-slate-100 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-emerald-400">Why this matters</h3>
          <ul className="space-y-4 text-sm leading-relaxed text-slate-300">
            <li className="flex gap-3">
              <span className="mt-0.5 font-mono text-emerald-400">3</span>
              <span>
                <strong className="text-white">Financial inclusion</strong> — higher repayment rates mean more households
                can access the next round of capital.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-mono text-emerald-400">5</span>
              <span>
                <strong className="text-white">Mindset change</strong> — education completion reinforces repayment culture
                beyond enforcement alone.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-mono text-emerald-400">7</span>
              <span>
                <strong className="text-white">Governance</strong> — transparent parish-level views build accountability
                between SACCOs, parishes, and communities.
              </span>
            </li>
          </ul>
        </aside>
      </section>
    </div>
  )
}
