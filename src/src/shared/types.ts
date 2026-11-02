export type Priority = 'low' | 'medium' | 'high'

export type Todo = {
  id: string
  title: string
  category: string // "Kuliah", "Pribadi", "Kerja", ...
  priority: Priority
  due?: string // format YYYY-MM-DD
  estimateMinutes?: number
  notes?: string // catatan tambahan bebas
  done: boolean
  createdAt: string
}

// Hasil dari LLM sebelum disimpan (belum punya id/done)
export type TodoDraft = Omit<Todo, 'id' | 'done' | 'createdAt'>

// Field yang bisa diedit dari tab Todo
export type TodoPatch = Partial<Pick<Todo, 'title' | 'due' | 'notes'>>
