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

type Props = { todos: Todo[]; onChange: (todos: Todo[]) => void }

export default function TodoTab({ todos, onChange }: Props): React.JSX.Element {
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

  return (
    <div className="flex-1 space-y-4 overflow-y-auto pr-1 text-sm">
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
              <span className={`flex-1 ${t.done ? 'text-white/30 line-through' : ''}`}>
                {t.title}
              </span>
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
  )
}
