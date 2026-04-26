function escapeCell(value) {
  const s = value == null ? '' : String(value)
  return `"${s.replace(/"/g, '""')}"`
}

export function buildDashboardCsv(data) {
  const meta = data.meta || {}
  const lines = [
    ['PDMRevolve', 'Dashboard export'],
    ['Snapshot generated (API)', meta.generatedAt || ''],
    ['Underlying data as of (DB)', meta.dataAsOf || ''],
    [],
    ['Metric', 'Value (%)'],
    ['On-time repayment', data.metrics.onTimeRepaymentRate],
    ['Full repayment completion', data.metrics.fullRepaymentRate],
    ['Education completion', data.metrics.educationCompletionRate],
    [],
    ['Rank', 'Parish', 'Active households', 'Repayment rate (%)'],
    ...data.topParishes.map((p, i) => [i + 1, p.parishName, p.households, p.repaymentRate]),
  ]
  return lines.map((row) => row.map(escapeCell).join(',')).join('\n')
}

export function downloadTextFile(filename, text, mime = 'text/csv;charset=utf-8') {
  const blob = new Blob([`\uFEFF${text}`], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
