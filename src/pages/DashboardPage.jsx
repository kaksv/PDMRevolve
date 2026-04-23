import { useEffect, useState } from 'react'
import { api } from '../lib/api'

function StatCard({ label, value, detail }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </article>
  )
}

export default function DashboardPage() {
  const [state, setState] = useState({ loading: true, data: null, error: '' })

  useEffect(() => {
    api
      .getDashboard()
      .then((data) => setState({ loading: false, data, error: '' }))
      .catch(() => setState({ loading: false, data: null, error: 'Could not load dashboard data.' }))
  }, [])

  if (state.loading) return <p className="text-slate-600">Loading dashboard...</p>
  if (state.error) return <p className="text-red-600">{state.error}</p>

  const { metrics, topParishes } = state.data

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Pilot performance snapshot</h2>
        <p className="text-slate-600">Anonymized view for district/parish and SACCO teams.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="On-time repayment"
          value={`${metrics.onTimeRepaymentRate}%`}
          detail="Share of beneficiaries repaying on or before due date."
        />
        <StatCard
          label="Full repayment completion"
          value={`${metrics.fullRepaymentRate}%`}
          detail="Loan cycles closed at 100% repayment."
        />
        <StatCard
          label="Education completion"
          value={`${metrics.educationCompletionRate}%`}
          detail="Assigned modules completed this cycle."
        />
      </div>

      <article className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="font-semibold">Top repaying parishes</h3>
        <ul className="mt-4 divide-y divide-slate-100">
          {topParishes.map((parish) => (
            <li key={parish.parishName} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{parish.parishName}</p>
                <p className="text-sm text-slate-500">{parish.households} households active</p>
              </div>
              <p className="font-semibold text-emerald-700">{parish.repaymentRate}%</p>
            </li>
          ))}
        </ul>
      </article>
    </section>
  )
}
