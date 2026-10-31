import { contextBridge, ipcRenderer } from 'electron'
import type { TodoDraft } from '../shared/types'

const api = {
  setIgnoreMouse: (ignore: boolean) => ipcRenderer.send('island:set-ignore-mouse', ignore),
  plan: (text: string) => ipcRenderer.invoke('llm:plan', text),
  listTodos: () => ipcRenderer.invoke('todos:list'),
  addTodos: (drafts: TodoDraft[]) => ipcRenderer.invoke('todos:add', drafts),
  toggleTodo: (id: string) => ipcRenderer.invoke('todos:toggle', id),
  removeTodo: (id: string) => ipcRenderer.invoke('todos:remove', id)
}

contextBridge.exposeInMainWorld('todoland', api)

export type TodolandApi = typeof api
