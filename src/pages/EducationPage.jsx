import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function EducationPage() {
  const [state, setState] = useState({ loading: true, modules: [], error: '' })

  useEffect(() => {
    api
      .getEducationModules()
      .then((modules) => setState({ loading: false, modules, error: '' }))
      .catch(() =>
        setState({ loading: false, modules: [], error: 'Could not load education modules.' }),
      )
  }, [])

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Education modules</h2>
      {state.loading && <p className="text-slate-600">Loading modules...</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {state.modules.map((module) => (
          <article key={module.code} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{module.title}</h3>
                <p className="text-sm text-slate-500">Language: {module.languageCode.toUpperCase()}</p>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                {module.channelType}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{module.summary}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
