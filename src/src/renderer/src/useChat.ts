import { useState } from 'react'
import type { Todo, TodoDraft } from '../../shared/types'

export type Chat = {
  text: string
  setText: (text: string) => void
  loading: boolean
  drafts: TodoDraft[] | null
  selected: Set<number> // index draft yang akan disimpan
  error: string | null
  submit: () => Promise<void>
  save: () => Promise<void>
  toggleSelected: (i: number) => void
}

// State chat disimpan di App (bukan di ChatTab), supaya permintaan ke Gemini tetap
// berjalan dan hasilnya tidak hilang walaupun island ditutup atau pindah tab.
export function useChat(onSaved: (todos: Todo[]) => void): Chat {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [drafts, setDrafts] = useState<TodoDraft[] | null>(null)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const submit = async (): Promise<void> => {
    if (!text.trim() || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await window.todoland.plan(text)
      if (res.ok) {
        setDrafts(res.drafts)
        setSelected(new Set(res.drafts.map((_, i) => i))) // default: semua terpilih
      } else setError(res.error)
    } catch {
      setError('Terjadi kesalahan. Coba restart aplikasi.')
    } finally {
      setLoading(false) // selalu matikan loading, apa pun hasilnya
    }
  }

  const save = async (): Promise<void> => {
    if (!drafts) return
    const chosen = drafts.filter((_, i) => selected.has(i))
    if (!chosen.length) return
    const list = await window.todoland.addTodos(chosen)
    setDrafts(null)
    setText('')
    onSaved(list)
  }

  const toggleSelected = (i: number): void => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return { text, setText, loading, drafts, selected, error, submit, save, toggleSelected }
}
