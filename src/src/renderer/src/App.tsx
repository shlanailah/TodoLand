import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Todo } from '../../shared/types'
import ChatTab from './components/ChatTab'
import TodoTab from './components/TodoTab'

function todayLocal(): string {
  const now = new Date()
  const pad = (n: number): string => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export default function App(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'chat' | 'todo'>('todo')
  const [todos, setTodos] = useState<Todo[]>([])
  const [busy, setBusy] = useState(false) // input fokus / loading
  const [focusSignal, setFocusSignal] = useState(0) // penanda fokus input dari shortcut
  const closeTimer = useRef<number | undefined>(undefined)
  const openRef = useRef(false) // cermin state open untuk listener global

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    window.todoland.listTodos().then(setTodos)
  }, [])

  // Shortcut global & instance kedua: buka island tanpa hover.
  useEffect(() => {
    const show = (): void => {
      window.clearTimeout(closeTimer.current)
      window.todoland.setIgnoreMouse(false)
      setTab('chat')
      setOpen(true)
      setFocusSignal((n) => n + 1)
    }

    const toggle = (): void => {
      if (openRef.current) {
        window.clearTimeout(closeTimer.current)
        setOpen(false)
        window.todoland.setIgnoreMouse(true)
      } else {
        show()
      }
    }

    const offOpen = window.todoland.onOpen(show)
    const offToggle = window.todoland.onToggle(toggle)

    return () => {
      offOpen()
      offToggle()
    }
  }, [])

  const handleEnter = (): void => {
    window.clearTimeout(closeTimer.current)
    window.todoland.setIgnoreMouse(false)
    setOpen(true)
  }

  const handleLeave = (): void => {
    window.todoland.setIgnoreMouse(true)
    if (busy) return
    closeTimer.current = window.setTimeout(() => setOpen(false), 300)
  }

  const doneCount = todos.filter((t) => t.done).length
  const nextTodo = todos.find((t) => !t.done)
  const dueToday = todos.some((t) => !t.done && t.due === todayLocal())

  return (
    <div className="flex w-screen justify-center">
      <motion.div
        layout
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        style={{ borderRadius: open ? 24 : 999 }}
        className={`overflow-hidden bg-black text-white shadow-2xl ${
          open ? 'w-[420px] h-[520px]' : 'w-[240px] h-[40px]'
        }`}
      >
        <AnimatePresence mode="wait">
          {!open ? (
            <motion.div
              key="pill"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-between px-4 text-sm"
            >
              <span>🏝 TodoLand</span>
              <span className="flex min-w-0 items-center gap-2 text-white/70">
                {dueToday && (
                  <span
                    title="Ada todo yang deadline-nya hari ini"
                    className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.7)]"
                  />
                )}
                <span className="truncate">
                  {todos.length ? `${doneCount}/${todos.length} ✓` : 'Hover untuk mulai'}
                </span>
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full flex-col p-4"
            >
              <div className="mb-3 flex gap-2">
                {(['chat', 'todo'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-full px-3 py-1 text-sm ${
                      tab === t ? 'bg-white text-black' : 'bg-white/10'
                    }`}
                  >
                    {t === 'chat' ? '💬 Chat' : '📋 Todo'}
                  </button>
                ))}
                {nextTodo && (
                  <span className="ml-auto truncate self-center text-xs text-white/50">
                    Berikutnya: {nextTodo.title}
                  </span>
                )}
              </div>

              {tab === 'chat' ? (
                <ChatTab
                  focusSignal={focusSignal}
                  onBusyChange={setBusy}
                  onSaved={(list) => {
                    setTodos(list)
                    setTab('todo')
                  }}
                />
              ) : (
                <TodoTab todos={todos} onChange={setTodos} onBusyChange={setBusy} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
