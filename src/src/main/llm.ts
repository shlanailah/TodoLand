import { GoogleGenAI, Type } from '@google/genai'
import { z } from 'zod'
import type { TodoDraft } from '../shared/types'

const ai = new GoogleGenAI({ apiKey: import.meta.env.MAIN_VITE_GEMINI_API_KEY })

// Cek nama model terbaru yang masuk free tier di AI Studio
const MODEL = 'gemini-3.8-flash'

const DraftSchema = z.object({
  todos: z.array(
    z.object({
      title: z.string().min(1),
      category: z.string().min(1),
      priority: z.enum(['low', 'medium', 'high']),
      due: z.string().optional(),
      estimateMinutes: z.number().optional()
    })
  )
})

export async function planToTodos(userText: string): Promise<TodoDraft[]> {
  const today = new Date().toISOString().slice(0, 10)

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: userText,
    config: {
      systemInstruction: `Kamu adalah asisten TodoLand.
Ubah rencana kegiatan user menjadi todo list yang spesifik dan bisa langsung dikerjakan.
Aturan:
- Pecah kegiatan besar menjadi beberapa langkah kecil bila perlu.
- Kelompokkan ke kategori singkat (contoh: Kuliah, Pribadi, Kerja, Rumah, Kesehatan).
- Tentukan priority (low/medium/high) berdasarkan urgensi.
- Hari ini ${today}. Pahami kata seperti "besok", "lusa", "minggu depan" lalu isi "due" (YYYY-MM-DD).
- Isi estimateMinutes bila bisa diperkirakan.
- Tulis title dalam Bahasa Indonesia, singkat, diawali kata kerja.`,
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          todos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                category: { type: Type.STRING },
                priority: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
                due: { type: Type.STRING },
                estimateMinutes: { type: Type.NUMBER }
              },
              required: ['title', 'category', 'priority']
            }
          }
        },
        required: ['todos']
      }
    }
  })

  const parsed = DraftSchema.parse(JSON.parse(res.text ?? '{"todos":[]}'))
  return parsed.todos
}
