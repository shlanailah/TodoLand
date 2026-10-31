import { contextBridge, ipcRenderer } from 'electron'
import type { TodoDraft, TodoPatch } from '../shared/types'

const api = {
  setIgnoreMouse: (ignore: boolean) => ipcRenderer.send('island:set-ignore-mouse', ignore),
  quit: () => ipcRenderer.send('app:quit'),
  plan: (text: string) => ipcRenderer.invoke('llm:plan', text),
  listTodos: () => ipcRenderer.invoke('todos:list'),
  addTodos: (drafts: TodoDraft[]) => ipcRenderer.invoke('todos:add', drafts),
  toggleTodo: (id: string) => ipcRenderer.invoke('todos:toggle', id),
  removeTodo: (id: string) => ipcRenderer.invoke('todos:remove', id),
  updateTodo: (id: string, patch: TodoPatch) => ipcRenderer.invoke('todos:update', id, patch),
  clearDone: () => ipcRenderer.invoke('todos:clear-done'),
  onOpen: (callback: () => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('island:open', listener)
    return () => ipcRenderer.removeListener('island:open', listener)
  },
  onToggle: (callback: () => void) => {
    const listener = (): void => callback()
    ipcRenderer.on('island:toggle', listener)
    return () => ipcRenderer.removeListener('island:toggle', listener)
  }
}

contextBridge.exposeInMainWorld('todoland', api)

export type TodolandApi = typeof api
