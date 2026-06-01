/** Display assignment timestamps as YYYY/mm/dd HH:mm */
export function formatAssignmentDateTime(value: string): string {
  if (!value || value === '—') return '—'
  const m = value.match(/^(\d{4})[-/](\d{2})[-/](\d{2})\s+(\d{2}:\d{2})/)
  if (m) return `${m[1]}/${m[2]}/${m[3]} ${m[4]}`
  return value
}

export function assignmentDateTimeToSortKey(value: string): string {
  if (!value || value === '—') return ''
  return value.replace(/\//g, '-').replace(' ', 'T')
}
