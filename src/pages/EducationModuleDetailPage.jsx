import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { CHANNEL_LABELS, LANGUAGE_LABELS } from '../education/sharedUi'

function isHttpUrl(value) {
  if (!value || typeof value !== 'string') return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export default function EducationModuleDetailPage() {
  const { code } = useParams()
  const [state, setState] = useState({ loading: true, module: null, error: '' })

  const load = useCallback(() => {
    if (!code) return
    setState((s) => ({ ...s, loading: true, error: '' }))
    api
      .getEducationModule(code)
      .then((module) =>
        setState({
          loading: false,
          module,
          error: module ? '' : 'This module could not be found.',
        }),
      )
      .catch(() => setState({ loading: false, module: null, error: 'Could not load this module.' }))
  }, [code])

  useEffect(() => {
    load()
  }, [load])

  if (state.loading) {
    return (
      <div className="space-y-6">
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        <div className="h-10 w-2/3 max-w-xl animate-pulse rounded-lg bg-slate-200" />
        <div className="h-24 max-w-2xl animate-pulse rounded-xl bg-slate-100" />
      </div>
    )
  }

  if (state.error || !state.module) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-8">
        <p className="font-medium text-amber-900">{state.error || 'Module not found.'}</p>
        <Link
          to="/education"
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          Back to education hub
        </Link>
      </div>
    )
  }

  const m = state.module
  const langLabel = LANGUAGE_LABELS[m.languageCode] || m.languageCode?.toUpperCase()
  const channelLabel = CHANNEL_LABELS[m.channelType] || m.channelType
  const hasMedia = isHttpUrl(m.contentUri)

  return (
    <div className="space-y-8">
      <nav className="text-sm text-slate-500">
        <Link to="/education" className="font-medium text-emerald-700 hover:text-emerald-800">
          Education hub
        </Link>
        <span className="mx-2 text-slate-300">/</span>
        <span className="text-slate-700">{m.code}</span>
      </nav>

      <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs font-medium text-slate-600">{m.code}</span>
            {m.createdAt && (
              <span className="text-xs text-slate-400">Published {new Date(m.createdAt).toLocaleDateString()}</span>
            )}
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{m.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {langLabel}
            </span>
            <span
              className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ${channelStyles(m.channelType)}`}
            >
              {channelLabel}
            </span>
            {m.estimatedMinutes != null && (
              <span className="inline-flex items-center rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-800">
                ~{m.estimatedMinutes} min
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="max-w-3xl space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Summary</h2>
        <p className="text-base leading-relaxed text-slate-700">{m.summary}</p>
      </section>

      <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Learning content</h2>
        {hasMedia ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-slate-600">Open the hosted lesson or media file in a new tab.</p>
            <a
              href={m.contentUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Open content
            </a>
            <p className="break-all font-mono text-xs text-slate-500">{m.contentUri}</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600">
            No web URL is linked for this module yet. Delivery may be via SMS or USSD prompts; your team can attach a
            content_uri in the database when media is ready.
          </p>
        )}
      </section>

      <div>
        <Link
          to="/education"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          ← All modules
        </Link>
      </div>
    </div>
  )
}
