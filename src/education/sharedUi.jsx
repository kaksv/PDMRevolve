export const CHANNEL_LABELS = {
  sms: 'SMS',
  ussd: 'USSD',
  web_audio: 'Web audio',
  web_video: 'Web video',
}

export const LANGUAGE_LABELS = {
  en: 'English',
  lg: 'Luganda',
  sw: 'Swahili',
  ach: 'Acholi',
  run: 'Runyankole',
}

export function channelIcon(type) {
  const t = (type || '').toLowerCase()
  if (t === 'sms') {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )
  }
  if (t === 'ussd') {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    )
  }
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

export function channelStyles(type) {
  const t = (type || '').toLowerCase()
  if (t === 'sms') return 'bg-sky-100 text-sky-800 ring-sky-200/60'
  if (t === 'ussd') return 'bg-violet-100 text-violet-800 ring-violet-200/60'
  return 'bg-amber-100 text-amber-900 ring-amber-200/60'
}
