import { useEffect, useRef, useState } from 'react'
import type { Todo } from '../../../shared/types'

const EMOJI: Record<string, string> = {
  Kuliah: '📚',
  Pribadi: '🙂',
  Kerja: '💼',
  Rumah: '🏠',
  Kesehatan: '🏃'
}
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }
const PRIORITY_COLOR = { high: 'bg-red-500', medium: 'bg-yellow-500', low: 'bg-green-500' }

type Props = {
  todos: Todo[]
  onChange: (todos: Todo[]) => void
  onBusyChange?: (busy: boolean) => void
}

export default function TodoTab({ todos, onChange, onBusyChange }: Props): React.JSX.Element {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const skipBlurSave = useRef(false)
  const editInput = useRef<HTMLInputElement>(null)

  // Jangan tutup island selama judul todo sedang diedit.
  useEffect(() => {
    onBusyChange?.(editingId !== null)
  }, [editingId, onBusyChange])

  useEffect(() => () => onBusyChange?.(false), [onBusyChange])

  useEffect(() => {
    if (editingId) editInput.current?.focus()
  }, [editingId])

  const startEdit = (todo: Todo): void => {
    skipBlurSave.current = false
    setDraftTitle(todo.title)
    setEditingId(todo.id)
  }

  const cancelEdit = (): void => {
    skipBlurSave.current = true
    setEditingId(null)
  }

  const commitEdit = (todo: Todo): void => {
    // Blur yang dipicu Enter/Escape tidak perlu menyimpan dua kali.
    if (skipBlurSave.current) {
      skipBlurSave.current = false
      return
    }
    skipBlurSave.current = true

    const title = draftTitle.trim()
    setEditingId(null)
    if (!title || title === todo.title) return

    void window.todoland.updateTodo(todo.id, title).then(onChange)
  }

  if (!todos.length) {
    return <p className="text-sm text-white/40">Belum ada todo. Buka tab Chat untuk membuat.</p>
  }

  const sorted = [...todos].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      (a.due ?? '9999').localeCompare(b.due ?? '9999')
  )

  const groups = sorted.reduce<Record<string, Todo[]>>((acc, t) => {
    ;(acc[t.category] ??= []).push(t)
    return acc
  }, {})

  const doneCount = todos.filter((t) => t.done).length

  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden text-sm">
      <div className="flex items-center justify-between text-xs text-white/50">
        <span>
          {doneCount}/{todos.length} selesai
        </span>
        {doneCount > 0 && (
          <button
            onClick={async () => onChange(await window.todoland.clearDone())}
            className="rounded-full bg-white/10 px-2 py-0.5 hover:bg-white/20"
          >
            Bersihkan ✓
          </button>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {Object.entries(groups).map(([category, items]) => (
          <div key={category}>
            <h3 className="mb-1 font-semibold">
              {EMOJI[category] ?? '📌'} {category}
            </h3>
            {items.map((t) => (
              <div
                key={t.id}
                className="group flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={async () => onChange(await window.todoland.toggleTodo(t.id))}
                />
                {editingId === t.id ? (
                  <input
                    ref={editInput}
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onBlur={() => commitEdit(t)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(t)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                    className="min-w-0 flex-1 rounded bg-white/10 px-1 text-sm outline-none"
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(t)}
                    title="Double-click untuk mengedit"
                    className={`flex-1 ${t.done ? 'text-white/30 line-through' : ''}`}
                  >
                    {t.title}
                  </span>
                )}
                {t.due && <span className="text-xs text-white/50">{t.due}</span>}
                <span className={`h-2 w-2 rounded-full ${PRIORITY_COLOR[t.priority]}`} />
                <button
                  onClick={async () => onChange(await window.todoland.removeTodo(t.id))}
                  className="opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
