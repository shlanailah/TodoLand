import type { Todo, TodoDraft } from '../shared/types'

declare global {
  interface Window {
    todoland: {
      setIgnoreMouse: (ignore: boolean) => void
      plan: (
        text: string
      ) => Promise<{ ok: true; drafts: TodoDraft[] } | { ok: false; error: string }>
      listTodos: () => Promise<Todo[]>
      addTodos: (drafts: TodoDraft[]) => Promise<Todo[]>
      toggleTodo: (id: string) => Promise<Todo[]>
      removeTodo: (id: string) => Promise<Todo[]>
      updateTodo: (id: string, title: string) => Promise<Todo[]>
      clearDone: () => Promise<Todo[]>
      onOpen: (callback: () => void) => () => void
      onToggle: (callback: () => void) => () => void
    }
  }
}
