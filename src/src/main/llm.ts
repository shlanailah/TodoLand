import { GoogleGenAI, Type } from '@google/genai'
import { z } from 'zod'
import type { TodoDraft } from '../shared/types'
import { todayLocal } from '../shared/date'

const ai = new GoogleGenAI({
  apiKey: import.meta.env.MAIN_VITE_GEMINI_API_KEY,
  httpOptions: { timeout: 30_000 } // batalkan kalau Gemini tidak membalas dalam 30 detik
})

// Cek nama model terbaru yang masuk free tier di AI Studio
const MODEL = 'gemini-3.5-flash-lite'

const DraftSchema = z.object({
  todos: z.array(
    z.object({
      title: z.string().min(1),
      category: z.string().min(1),
      priority: z.enum(['low', 'medium', 'high']),
      due: z.string().optional(),
      estimateMinutes: z.number().optional(),
      notes: z.string().optional()
    })
  )
})

export async function planToTodos(userText: string): Promise<TodoDraft[]> {
  const today = todayLocal() // jangan toISOString(): itu UTC, bisa mundur sehari di WIB

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: userText,
    config: {
      systemInstruction: `Kamu adalah asisten TodoLand.
Ubah rencana kegiatan user menjadi todo list yang spesifik dan bisa langsung dikerjakan.
Aturan:
- Satu kegiatan yang disebut user = satu todo. JANGAN memecahnya menjadi langkah-langkah
  kecil atau menambah kegiatan yang tidak disebut user.
- Buat beberapa todo hanya jika user memang menyebut beberapa kegiatan berbeda.
- Kalau user meminta dipecah/dirinci (misal "pecah jadi langkah-langkah"), baru boleh dipecah.
- Kelompokkan ke kategori singkat (contoh: Kuliah, Pribadi, Kerja, Rumah, Kesehatan).
- Tentukan priority dari deadline dan bobot kegiatan: deadline hari ini/besok = high,
  2–3 hari lagi = medium, lebih jauh = low; naikkan satu tingkat untuk ujian/tugas besar.
- Hari ini ${today}. Pahami kata seperti "besok", "lusa", "minggu depan" lalu isi "due" (YYYY-MM-DD).
- Isi estimateMinutes bila bisa diperkirakan.
- Isi notes (opsional) hanya jika user menyebut detail tambahan untuk todo itu, misalnya jam,
  tempat, syarat, atau hal penting lain. Tulis singkat dan jangan mengarang.
- Tulis title dalam Bahasa Indonesia yang rapi: singkat, diawali kata kerja, huruf besar di awal
  kata dan untuk singkatan. Contoh: "tubes rpl milestone 9" → "Kerjakan Tubes RPL Milestone 9".`,
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
                estimateMinutes: { type: Type.NUMBER },
                notes: { type: Type.STRING }
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
