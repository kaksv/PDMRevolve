import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function RepaymentsPage() {
  const [state, setState] = useState({ loading: true, rows: [], error: '' })

  useEffect(() => {
    api
      .getRepayments()
      .then((rows) => setState({ loading: false, rows, error: '' }))
      .catch(() =>
        setState({ loading: false, rows: [], error: 'Could not load repayments feed.' }),
      )
  }, [])

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Recent verified repayments</h2>
      {state.loading && <p className="text-slate-600">Loading repayments...</p>}
      {state.error && <p className="text-red-600">{state.error}</p>}

      {!state.loading && !state.error && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Beneficiary</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row) => (
                <tr key={row.providerTransactionId} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{row.providerTransactionId}</td>
                  <td className="px-4 py-3">{row.beneficiaryPhone}</td>
                  <td className="px-4 py-3">UGX {Number(row.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(row.transactionTime).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
