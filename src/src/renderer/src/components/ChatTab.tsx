import { useEffect, useRef, useState } from 'react'
import { formatDate } from '../../../shared/date'
import type { Chat } from '../useChat'

type Props = {
  chat: Chat
  focusSignal: number
  onBusyChange: (busy: boolean) => void
}

export default function ChatTab({ chat, focusSignal, onBusyChange }: Props): React.JSX.Element {
  const { text, setText, loading, drafts, selected, error, submit, save, toggleSelected } = chat
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Hanya mengetik yang menahan island terbuka; loading tidak, jadi island tetap bisa ditutup.
  useEffect(() => onBusyChange(focused), [focused, onBusyChange])

  // Saat tab ini dilepas, jangan tinggalkan status busy yang menahan island terbuka.
  useEffect(() => () => onBusyChange(false), [onBusyChange])

  // Shortcut global / tray meminta input langsung fokus.
  useEffect(() => {
    if (focusSignal > 0) inputRef.current?.focus()
  }, [focusSignal])

  const categories = drafts ? new Set(drafts.map((d) => d.category)).size : 0

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-hidden">
      <div className="flex-1 overflow-y-auto text-sm">
        {loading && <p className="animate-pulse text-white/60">✨ Sedang memproses…</p>}
        {error && <p className="text-red-400">{error}</p>}
        {drafts && (
          <div className="space-y-2">
            <p className="text-white/70">
              Ditemukan {drafts.length} todo di {categories} kategori. Pilih yang mau disimpan:
            </p>
            {drafts.map((d, i) => (
              <label
                key={i}
                className={`flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 ${
                  selected.has(i) ? 'bg-white/10' : 'bg-white/5 text-white/40'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggleSelected(i)}
                  className="mt-1"
                />
                <div>
                  <div>{d.title}</div>
                  <div className="text-xs text-white/50">
                    {d.category}
                    {d.due && ` · ${formatDate(d.due)}`}
                  </div>
                </div>
              </label>
            ))}
            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                disabled={!selected.size}
                className="rounded-full bg-white px-3 py-1 text-black disabled:opacity-40"
              >
                Simpan {selected.size}/{drafts.length}
              </button>
              <button onClick={submit} className="rounded-full bg-white/10 px-3 py-1">
                Ulangi
              </button>
            </div>
          </div>
        )}
        {!loading && !drafts && !error && (
          <p className="text-white/40">
            Ceritakan rencanamu, contoh: &quot;besok mau jogging, terus ngerjain laporan PBO
            deadline jumat&quot;
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Tulis rencana kegiatan…"
        className="rounded-full bg-white/10 px-4 py-2 text-sm outline-none placeholder:text-white/40"
      />
    </div>
  )
}
