import type { Todo } from './types'

// Tanggal hari ini (YYYY-MM-DD) menurut zona waktu lokal, bukan UTC.
export function todayLocal(): string {
  const now = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

// Selisih hari dari hari ini ke `due`. Negatif = sudah lewat.
export function daysUntil(due: string): number {
  const [y, m, d] = due.split('-').map(Number)
  const [ty, tm, td] = todayLocal().split('-').map(Number)
  return Math.round(
    (new Date(y, m - 1, d).getTime() - new Date(ty, tm - 1, td).getTime()) / 86_400_000
  )
}

// YYYY-MM-DD → DD-MM-YYYY (hanya untuk tampilan; data tetap disimpan YYYY-MM-DD)
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

export type Urgency = 'red' | 'yellow'

// Warna titik berdasarkan sisa hari ke deadline:
// - sudah lewat s/d 3 hari lagi → merah
// - 4–7 hari lagi              → kuning
// - lebih jauh / tanpa tanggal / sudah selesai → tanpa titik
export function urgency(todo: Todo): Urgency | null {
  if (todo.done || !todo.due) return null
  const days = daysUntil(todo.due)
  if (days <= 3) return 'red'
  if (days <= 7) return 'yellow'
  return null
}

export function urgencyRank(todo: Todo): number {
  const u = urgency(todo)
  return u === 'red' ? 0 : u === 'yellow' ? 1 : 2
}
