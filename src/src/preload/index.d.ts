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
    }
  }
}
