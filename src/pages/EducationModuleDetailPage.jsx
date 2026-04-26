import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../lib/api'
import { CHANNEL_LABELS, LANGUAGE_LABELS, channelStyles } from '../education/sharedUi'

function isHttpUrl(value) {
  if (!value || typeof value !== 'string') return false
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

function getYouTubeEmbedUrl(url) {
  if (!isHttpUrl(url)) return null
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtube.com')) {
      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

export default function EducationModuleDetailPage() {
  const { code } = useParams()
  const [state, setState] = useState({ loading: true, module: null, error: '' })
  const [tab, setTab] = useState('video')

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

  useEffect(() => {
    if (!state.module) return

    const m = state.module
    const videoUrl = m.videoUrl || m.contentUri || null
    const hasVideo = isHttpUrl(videoUrl)
    const hasText = Boolean(m.textContent && m.textContent.trim())

    const saved = window.localStorage.getItem('education-format-preference')
    if (saved === 'video' || saved === 'text') {
      setTab(saved)
      return
    }
    if (m.defaultFormat === 'text' && hasText) {
      setTab('text')
      return
    }
    if (hasVideo) {
      setTab('video')
      return
    }
    setTab('text')
  }, [state.module])

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
  const videoUrl = m.videoUrl || m.contentUri || null
  const hasVideo = isHttpUrl(videoUrl)
  const hasText = Boolean(m.textContent && m.textContent.trim())

  function setTabAndRemember(nextTab) {
    setTab(nextTab)
    window.localStorage.setItem('education-format-preference', nextTab)
  }

  const activeTab = tab === 'video' && !hasVideo ? 'text' : tab === 'text' && !hasText ? 'video' : tab
  const youtubeEmbed = getYouTubeEmbedUrl(videoUrl)

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

      <section className="grid gap-6 lg:grid-cols-12">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
          <div className="border-b border-slate-200 bg-slate-50 p-3">
            <div className="inline-flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-slate-200">
              <button
                type="button"
                disabled={!hasVideo}
                onClick={() => setTabAndRemember('video')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  activeTab === 'video' ? 'bg-slate-900 text-white' : 'text-slate-600'
                } ${!hasVideo ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                Watch
              </button>
              <button
                type="button"
                disabled={!hasText}
                onClick={() => setTabAndRemember('text')}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  activeTab === 'text' ? 'bg-slate-900 text-white' : 'text-slate-600'
                } ${!hasText ? 'cursor-not-allowed opacity-40' : ''}`}
              >
                Read
              </button>
            </div>
          </div>

          {activeTab === 'video' ? (
            <div className="space-y-4 p-4">
              {youtubeEmbed ? (
                <div className="aspect-video overflow-hidden rounded-xl bg-black">
                  <iframe
                    title={`${m.title} video`}
                    src={youtubeEmbed}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  External video source
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">
                  {m.estimatedMinutesVideo != null ? `Approx. ${m.estimatedMinutesVideo} min video` : 'Video lesson'}
                </p>
                {hasVideo && (
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Open source
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 p-5">
              <p className="text-sm text-slate-500">
                {m.estimatedMinutesText != null ? `Approx. ${m.estimatedMinutesText} min read` : 'Text lesson'}
              </p>
              <article className="prose prose-slate max-w-none rounded-xl border border-slate-200 bg-slate-50 p-4">
                {(m.textContent || 'No text lesson available yet.').split('\n').map((line, i) => (
                  <p key={`${line}-${i}`}>{line}</p>
                ))}
              </article>
            </div>
          )}
        </article>

        <aside className="space-y-4 lg:col-span-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Delivery options</h2>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex items-start justify-between gap-3">
                <span>Video format</span>
                <span className={hasVideo ? 'text-emerald-700 font-medium' : 'text-slate-400'}>{hasVideo ? 'Available' : 'Not available'}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span>Written format</span>
                <span className={hasText ? 'text-emerald-700 font-medium' : 'text-slate-400'}>{hasText ? 'Available' : 'Not available'}</span>
              </li>
              <li className="flex items-start justify-between gap-3">
                <span>Recommended channel</span>
                <span className="font-medium text-slate-700">{channelLabel}</span>
              </li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Facilitator note</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              For low-data users, send the text version by SMS/USSD prompt. For smartphone users, share the video link
              and keep the written summary as backup.
            </p>
          </div>
        </aside>
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
