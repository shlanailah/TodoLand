import { useEffect, useRef, useState } from 'react'
import type { Todo } from '../../../shared/types'
import { formatDate, urgency, urgencyRank } from '../../../shared/date'

const EMOJI: Record<string, string> = {
  Kuliah: '🐚',
  Pribadi: '🌺',
  Kerja: '🌊',
  Rumah: '🪸',
  Kesehatan: '🏄🏼‍♀️'
}
const URGENCY_STYLE = {
  red: { color: 'bg-red-500', label: 'Deadline 3 hari lagi atau kurang' },
  yellow: { color: 'bg-yellow-500', label: 'Deadline dalam 7 hari' }
}

type Props = {
  todos: Todo[]
  onChange: (todos: Todo[]) => void
  onBusyChange?: (busy: boolean) => void
}

export default function TodoTab({ todos, onChange, onBusyChange }: Props): React.JSX.Element {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [notesEditingId, setNotesEditingId] = useState<string | null>(null)
  const [draftNotes, setDraftNotes] = useState('')
  const [dateEditingId, setDateEditingId] = useState<string | null>(null)
  const skipBlurSave = useRef(false)
  const skipNotesBlurSave = useRef(false)
  const editInput = useRef<HTMLInputElement>(null)
  const notesInput = useRef<HTMLTextAreaElement>(null)
  const dateInput = useRef<HTMLInputElement>(null)

  // Jangan tutup island selama judul/catatan/tanggal todo sedang diedit.
  useEffect(() => {
    onBusyChange?.(editingId !== null || notesEditingId !== null || dateEditingId !== null)
  }, [editingId, notesEditingId, dateEditingId, onBusyChange])

  useEffect(() => () => onBusyChange?.(false), [onBusyChange])

  useEffect(() => {
    if (editingId) editInput.current?.focus()
  }, [editingId])

  useEffect(() => {
    if (notesEditingId) notesInput.current?.focus()
  }, [notesEditingId])

  // Langsung buka kalender saat tanggal diklik.
  useEffect(() => {
    if (!dateEditingId) return
    dateInput.current?.focus()
    try {
      dateInput.current?.showPicker()
    } catch {
      // showPicker tidak tersedia / ditolak: input tetap bisa diketik manual
    }
  }, [dateEditingId])

  const saveDate = (todo: Todo, due: string): void => {
    setDateEditingId(null)
    if (due === (todo.due ?? '')) return
    void window.todoland.updateTodo(todo.id, { due }).then(onChange)
  }

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

    void window.todoland.updateTodo(todo.id, { title }).then(onChange)
  }

  const startNotesEdit = (todo: Todo): void => {
    skipNotesBlurSave.current = false
    setDraftNotes(todo.notes ?? '')
    setNotesEditingId(todo.id)
  }

  const cancelNotesEdit = (): void => {
    skipNotesBlurSave.current = true
    setNotesEditingId(null)
  }

  const commitNotesEdit = (todo: Todo): void => {
    // Blur yang dipicu Escape/Ctrl+Enter tidak perlu menyimpan dua kali.
    if (skipNotesBlurSave.current) {
      skipNotesBlurSave.current = false
      return
    }
    skipNotesBlurSave.current = true

    const notes = draftNotes.trim()
    setNotesEditingId(null)
    if (notes === (todo.notes ?? '')) return

    void window.todoland.updateTodo(todo.id, { notes }).then(onChange)
  }

  if (!todos.length) {
    return <p className="text-sm text-white/40">Belum ada todo. Buka tab Chat untuk membuat.</p>
  }

  const sorted = [...todos].sort(
    (a, b) =>
      Number(a.done) - Number(b.done) ||
      urgencyRank(a) - urgencyRank(b) ||
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
        {Object.entries(groups).map(([category, items], index) => (
          <div key={category} className={index === 0 ? '' : 'border-t border-white/25 pt-3'}>
            <h3 className="mb-1 font-semibold">
              {EMOJI[category] ?? '📌'} {category}
            </h3>
            {items.map((t) => (
              <div
                key={t.id}
                className="group flex items-start gap-2 rounded-lg px-2 py-1 hover:bg-white/10"
              >
                <input
                  type="checkbox"
                  checked={t.done}
                  onChange={async () => onChange(await window.todoland.toggleTodo(t.id))}
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0 flex-1">
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
                      className="w-full rounded bg-white/10 px-1 text-sm outline-none"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => startEdit(t)}
                      title="Double-click untuk mengedit"
                      className={`block ${t.done ? 'text-white/30 line-through' : ''}`}
                    >
                      {t.title}
                    </span>
                  )}
                  {notesEditingId === t.id ? (
                    <textarea
                      ref={notesInput}
                      value={draftNotes}
                      onChange={(e) => setDraftNotes(e.target.value)}
                      onBlur={() => commitNotesEdit(t)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') cancelNotesEdit()
                        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) commitNotesEdit(t)
                      }}
                      rows={2}
                      placeholder="Catatan tambahan…"
                      title="Ctrl+Enter untuk simpan, Esc untuk batal"
                      className="mt-1 w-full resize-none rounded bg-white/10 px-1.5 py-1 text-xs outline-none placeholder:text-white/40"
                    />
                  ) : t.notes ? (
                    <button
                      onClick={() => startNotesEdit(t)}
                      title="Klik untuk mengedit catatan"
                      className={`mt-0.5 line-clamp-2 w-full whitespace-pre-wrap text-left text-xs leading-snug text-white/50 hover:text-white/80 ${
                        t.done ? 'line-through' : ''
                      }`}
                    >
                      {t.notes}
                    </button>
                  ) : (
                    <button
                      onClick={() => startNotesEdit(t)}
                      title="Tambah catatan"
                      className="mt-0.5 text-xs text-white/30 opacity-0 hover:text-white/70 group-hover:opacity-100"
                    >
                      + catatan
                    </button>
                  )}
                </div>
                <div className="mt-0.5 flex shrink-0 items-center gap-1">
                  {dateEditingId === t.id ? (
                    <input
                      ref={dateInput}
                      type="date"
                      defaultValue={t.due ?? ''}
                      onChange={(e) => saveDate(t, e.target.value)}
                      onBlur={() => setDateEditingId(null)}
                      onKeyDown={(e) => e.key === 'Escape' && setDateEditingId(null)}
                      className="rounded bg-white/10 px-1 text-xs outline-none [color-scheme:dark]"
                    />
                  ) : (
                    <button
                      onClick={() => setDateEditingId(t.id)}
                      title="Klik untuk mengubah tanggal"
                      className={`rounded px-1 text-xs hover:bg-white/10 ${
                        t.due ? 'text-white/50' : 'text-white/30 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {t.due ? formatDate(t.due) : '+ tanggal'}
                    </button>
                  )}
                  {(() => {
                    const u = urgency(t)
                    // Slot tetap 8px supaya tombol ✕ tidak bergeser walau tanpa titik
                    return u ? (
                      <span
                        title={URGENCY_STYLE[u].label}
                        className={`h-2 w-2 shrink-0 rounded-full ${URGENCY_STYLE[u].color}`}
                      />
                    ) : (
                      <span className="w-2 shrink-0" />
                    )
                  })()}
                  <button
                    onClick={async () => onChange(await window.todoland.removeTodo(t.id))}
                    title="Hapus todo"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
