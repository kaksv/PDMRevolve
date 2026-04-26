import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'
import { CHANNEL_LABELS, LANGUAGE_LABELS, channelIcon, channelStyles } from '../education/sharedUi'

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600 ring-offset-2 ring-offset-slate-50'
          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}

export default function EducationPage() {
  const [state, setState] = useState({ loading: true, modules: [], error: '' })
  const [langFilter, setLangFilter] = useState('all')
  const [channelFilter, setChannelFilter] = useState('all')

  const load = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }))
    api
      .getEducationModules()
      .then((modules) => setState({ loading: false, modules, error: '' }))
      .catch(() =>
        setState({ loading: false, modules: [], error: 'Could not load education modules.' }),
      )
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const languages = useMemo(() => {
    const set = new Set(state.modules.map((m) => m.languageCode).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [state.modules])

  const channels = useMemo(() => {
    const set = new Set(state.modules.map((m) => m.channelType).filter(Boolean))
    return ['all', ...Array.from(set).sort()]
  }, [state.modules])

  const filtered = useMemo(() => {
    return state.modules.filter((m) => {
      if (langFilter !== 'all' && m.languageCode !== langFilter) return false
      if (channelFilter !== 'all' && m.channelType !== channelFilter) return false
      return true
    })
  }, [state.modules, langFilter, channelFilter])

  if (state.loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-3">
          <div className="h-10 w-72 max-w-full rounded-lg bg-slate-200" />
          <div className="h-4 max-w-2xl rounded bg-slate-100" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50/80 p-8 text-center">
        <p className="font-medium text-red-800">{state.error}</p>
        <button
          type="button"
          onClick={load}
          className="mt-6 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50 via-white to-emerald-50/40 px-6 py-8 shadow-sm sm:px-8">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 translate-x-1/4 -translate-y-1/4 rounded-full bg-indigo-200/30 blur-2xl" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">Education hub</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Learn while you repay</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            Short modules tied to real PDM enterprise groups—repayment culture, record-keeping, pricing, and scaling.
            Content can be delivered over SMS, USSD, or richer web experiences as your rollout expands.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h3 className="text-sm font-semibold text-slate-900">Filter modules</h3>
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Language</p>
            <div className="flex flex-wrap gap-2">
              {languages.map((code) => (
                <FilterChip key={code} active={langFilter === code} onClick={() => setLangFilter(code)}>
                  {code === 'all' ? 'All languages' : LANGUAGE_LABELS[code] || code.toUpperCase()}
                </FilterChip>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Channel</p>
            <div className="flex flex-wrap gap-2">
              {channels.map((ch) => (
                <FilterChip key={ch} active={channelFilter === ch} onClick={() => setChannelFilter(ch)}>
                  {ch === 'all' ? 'All channels' : CHANNEL_LABELS[ch] || ch}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 py-16 text-center">
          <p className="font-medium text-slate-700">No modules match these filters.</p>
          <p className="mt-2 text-sm text-slate-500">Try clearing filters or check back after your team publishes new content.</p>
          <button
            type="button"
            onClick={() => {
              setLangFilter('all')
              setChannelFilter('all')
            }}
            className="mt-6 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((module) => {
            const langLabel = LANGUAGE_LABELS[module.languageCode] || module.languageCode?.toUpperCase()
            const channelLabel = CHANNEL_LABELS[module.channelType] || module.channelType
            return (
              <li key={module.code}>
                <Link
                  to={`/education/${encodeURIComponent(module.code)}`}
                  className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ring-1 ${channelStyles(module.channelType)}`}
                    >
                      {channelIcon(module.channelType)}
                    </div>
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">
                      {module.code}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold leading-snug text-slate-900 group-hover:text-indigo-950">
                    {module.title}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      {langLabel}
                    </span>
                    <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      {channelLabel}
                    </span>
                    {module.estimatedMinutes != null && (
                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-800">
                        ~{module.estimatedMinutes} min
                      </span>
                    )}
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{module.summary}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-400">View module details</span>
                    <span className="text-xs font-semibold text-indigo-600 group-hover:text-indigo-700">Open →</span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
