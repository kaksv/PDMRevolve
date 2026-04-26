import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

function normalizeNullableString(value) {
  const v = (value || '').trim()
  return v.length === 0 ? null : v
}

function normalizeNullableInt(value) {
  const v = String(value || '').trim()
  if (!v) return null
  const n = Number(v)
  if (!Number.isInteger(n) || n <= 0) return null
  return n
}

export default function EducationAdminPage() {
  async function loadModule(code) {
    if (!code) return
    setStatus((s) => ({ ...s, error: '', success: '' }))
    try {
      const m = await api.getEducationModule(code)
      if (!m) {
        setStatus((s) => ({ ...s, error: 'Selected module was not found.' }))
        return
      }
      setForm({
        videoUrl: m.videoUrl || '',
        textContent: m.textContent || '',
        defaultFormat: m.defaultFormat || 'text',
        estimatedMinutesVideo: m.estimatedMinutesVideo != null ? String(m.estimatedMinutesVideo) : '',
        estimatedMinutesText: m.estimatedMinutesText != null ? String(m.estimatedMinutesText) : '',
      })
    } catch {
      setStatus((s) => ({ ...s, error: 'Could not load selected module.' }))
    }
  }

  const [modules, setModules] = useState([])
  const [selectedCode, setSelectedCode] = useState('')
  const [form, setForm] = useState({
    videoUrl: '',
    textContent: '',
    defaultFormat: 'text',
    estimatedMinutesVideo: '',
    estimatedMinutesText: '',
  })
  const [status, setStatus] = useState({ loading: true, saving: false, error: '', success: '' })

  useEffect(() => {
    api
      .getEducationModules()
      .then((rows) => {
        setModules(rows)
        const first = rows[0]?.code || ''
        setSelectedCode(first)
        setStatus({ loading: false, saving: false, error: '', success: '' })
      })
      .catch(() => setStatus({ loading: false, saving: false, error: 'Could not load modules.', success: '' }))
  }, [])

  useEffect(() => {
    if (!selectedCode) return
    loadModule(selectedCode)
  }, [selectedCode])

  const selected = useMemo(() => modules.find((m) => m.code === selectedCode), [modules, selectedCode])

  async function onSave(e) {
    e.preventDefault()
    if (!selectedCode) return
    const payload = {
      videoUrl: normalizeNullableString(form.videoUrl),
      textContent: normalizeNullableString(form.textContent),
      defaultFormat: form.defaultFormat === 'video' ? 'video' : 'text',
      estimatedMinutesVideo: normalizeNullableInt(form.estimatedMinutesVideo),
      estimatedMinutesText: normalizeNullableInt(form.estimatedMinutesText),
    }
    if (!payload.videoUrl && !payload.textContent) {
      setStatus((s) => ({ ...s, error: 'Add at least one format: video URL or text content.', success: '' }))
      return
    }

    setStatus((s) => ({ ...s, saving: true, error: '', success: '' }))
    try {
      const updated = await api.updateEducationModule(selectedCode, payload)
      setModules((prev) => prev.map((m) => (m.code === updated.code ? { ...m, ...updated } : m)))
      setStatus({ loading: false, saving: false, error: '', success: 'Module updated successfully.' })
    } catch (error) {
      setStatus({ loading: false, saving: false, error: error.message || 'Failed to update module.', success: '' })
    }
  }

  if (status.loading) {
    return <p className="text-slate-600">Loading admin editor...</p>
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Admin</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Education content editor</h2>
          <p className="mt-1 text-sm text-slate-600">Quickly manage watch/read formats for each module.</p>
        </div>
        <Link
          to="/education"
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to modules
        </Link>
      </header>

      <form onSubmit={onSave} className="grid gap-6 lg:grid-cols-12">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
          <label className="block text-sm font-medium text-slate-700" htmlFor="module-code">
            Select module
          </label>
          <select
            id="module-code"
            value={selectedCode}
            onChange={(e) => setSelectedCode(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            {modules.map((m) => (
              <option key={m.code} value={m.code}>
                {m.code} - {m.title}
              </option>
            ))}
          </select>
          {selected && (
            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-medium text-slate-700">{selected.title}</p>
              <p className="mt-1">{selected.summary}</p>
            </div>
          )}
          {status.error && <p className="text-sm text-red-700">{status.error}</p>}
          {status.success && <p className="text-sm text-emerald-700">{status.success}</p>}
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-8">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Default format</span>
              <select
                value={form.defaultFormat}
                onChange={(e) => setForm((f) => ({ ...f, defaultFormat: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              >
                <option value="video">Video</option>
                <option value="text">Text</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Video URL (optional)</span>
              <input
                type="url"
                value={form.videoUrl}
                onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="font-medium text-slate-700">Written content (optional)</span>
            <textarea
              rows={8}
              value={form.textContent}
              onChange={(e) => setForm((f) => ({ ...f, textContent: e.target.value }))}
              placeholder="Write practical lesson steps..."
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Estimated video minutes</span>
              <input
                type="number"
                min="1"
                max="180"
                value={form.estimatedMinutesVideo}
                onChange={(e) => setForm((f) => ({ ...f, estimatedMinutesVideo: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Estimated reading minutes</span>
              <input
                type="number"
                min="1"
                max="180"
                value={form.estimatedMinutesText}
                onChange={(e) => setForm((f) => ({ ...f, estimatedMinutesText: e.target.value }))}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => loadModule(selectedCode)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Reload
            </button>
            <button
              type="submit"
              disabled={status.saving}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60"
            >
              {status.saving ? 'Saving...' : 'Save module'}
            </button>
          </div>
        </section>
      </form>
    </div>
  )
}
