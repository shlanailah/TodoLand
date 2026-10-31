import Store from 'electron-store'
import { randomUUID } from 'crypto'
import type { Todo, TodoDraft } from '../shared/types'

const store = new Store<{ todos: Todo[] }>({ defaults: { todos: [] } })

export function listTodos(): Todo[] {
  return store.get('todos')
}

export function addTodos(drafts: TodoDraft[]): Todo[] {
  const now = new Date().toISOString()
  const created = drafts.map((d) => ({ ...d, id: randomUUID(), done: false, createdAt: now }))
  store.set('todos', [...listTodos(), ...created])
  return listTodos()
}

export function toggleTodo(id: string): Todo[] {
  store.set(
    'todos',
    listTodos().map((t) => (t.id === id ? { ...t, done: !t.done } : t))
  )
  return listTodos()
}

export function removeTodo(id: string): Todo[] {
  store.set(
    'todos',
    listTodos().filter((t) => t.id !== id)
  )
  return listTodos()
}
