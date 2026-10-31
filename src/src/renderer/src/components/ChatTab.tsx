import { useEffect, useState } from 'react'
import type { Todo, TodoDraft } from '../../../shared/types'

type Props = {
  onBusyChange: (busy: boolean) => void
  onSaved: (todos: Todo[]) => void
}

export default function ChatTab({ onBusyChange, onSaved }: Props): React.JSX.Element {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [drafts, setDrafts] = useState<TodoDraft[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => onBusyChange(focused || loading), [focused, loading, onBusyChange])

  const submit = async (): Promise<void> => {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await window.todoland.plan(text)
      if (res.ok) setDrafts(res.drafts)
      else setError(res.error)
    } catch {
      setError('Terjadi kesalahan. Coba restart aplikasi.')
    } finally {
      setLoading(false) // selalu matikan loading, apa pun hasilnya
    }
  }

  const save = async (): Promise<void> => {
    if (!drafts) return
    const list = await window.todoland.addTodos(drafts)
    setDrafts(null)
    setText('')
    onSaved(list)
  }

  const categories = drafts ? new Set(drafts.map((d) => d.category)).size : 0

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex-1 overflow-y-auto text-sm">
        {loading && <p className="animate-pulse text-white/60">✨ Gemini sedang berpikir…</p>}
        {error && <p className="text-red-400">{error}</p>}
        {drafts && (
          <div className="space-y-2">
            <p className="text-white/70">
              Ditemukan {drafts.length} todo di {categories} kategori:
            </p>
            {drafts.map((d, i) => (
              <div key={i} className="rounded-lg bg-white/10 px-3 py-2">
                <div>{d.title}</div>
                <div className="text-xs text-white/50">
                  {d.category} · {d.priority}
                  {d.due && ` · ${d.due}`}
                </div>
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <button onClick={save} className="rounded-full bg-white px-3 py-1 text-black">
                Simpan
              </button>
              <button onClick={submit} className="rounded-full bg-white/10 px-3 py-1">
                Ulangi
              </button>
            </div>
          </div>
        )}
        {!loading && !drafts && !error && (
          <p className="text-white/40">
            Ceritakan rencanamu, contoh: &quot;besok mau jogging, terus ngerjain laporan PBO
            deadline jumat&quot;
          </p>
        )}
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Tulis rencana kegiatan…"
        className="rounded-full bg-white/10 px-4 py-2 text-sm outline-none placeholder:text-white/40"
      />
    </div>
  )
}
