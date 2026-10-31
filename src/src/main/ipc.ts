import { ipcMain } from 'electron'
import { planToTodos } from './llm'
import { listTodos, addTodos, toggleTodo, removeTodo, updateTodo, clearDone } from './store'
import type { TodoDraft, TodoPatch } from '../shared/types'

export function registerIpc(): void {
  ipcMain.handle('llm:plan', async (_e, text: string) => {
    try {
      return { ok: true, drafts: await planToTodos(text) }
    } catch (err) {
      const msg = String(err)
      console.error('[llm:plan]', msg) // error lengkap muncul di terminal npm run dev
      if (msg.includes('429'))
        return { ok: false, error: 'Limit gratis tercapai, coba lagi sebentar.' }
      if (msg.includes('API key')) return { ok: false, error: 'API key tidak valid.' }
      if (msg.includes('404'))
        return { ok: false, error: 'Model Gemini tidak tersedia. Ganti MODEL di llm.ts.' }
      if (/abort|timeout/i.test(msg))
        return { ok: false, error: 'Gemini terlalu lama membalas. Coba lagi.' }
      return { ok: false, error: 'Gagal menghubungi Gemini. Cek koneksi internet.' }
    }
  })

  ipcMain.handle('todos:list', () => listTodos())
  ipcMain.handle('todos:add', (_e, drafts: TodoDraft[]) => addTodos(drafts))
  ipcMain.handle('todos:toggle', (_e, id: string) => toggleTodo(id))
  ipcMain.handle('todos:remove', (_e, id: string) => removeTodo(id))
  ipcMain.handle('todos:update', (_e, id: string, patch: TodoPatch) => updateTodo(id, patch))
  ipcMain.handle('todos:clear-done', () => clearDone())
}
