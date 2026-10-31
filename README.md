# °.🐚⋆❀˖°🫧 TodoLand

TodoLand adalah aplikasi desktop berbentuk **dynamic island** yang menempel di tengah atas layar. Saat kursor diarahkan ke island, tampilannya membesar menjadi panel berisi chat dan todo list.

Kamu cukup menulis rencana dengan bahasa sehari-hari, misalnya:

> "besok pagi jogging, siang ngerjain laporan PBO deadline jumat, malam belanja bulanan"

Gemini akan mengubahnya menjadi todo list yang lengkap dengan kategori, prioritas, dan deadline. Semua todo disimpan secara lokal di komputer.

```
        ┌────────────────────────────────────────┐
        │  °.🐚⋆❀˖°🫧 TodoLand       3/7 ✓     │  ← menempel di atas layar
        └────────────────────────────────────────┘
                    hover ↓
        ┌───────────────────────────────┐
        │  [💬 Chat]  [📋 Todo]     ✕  │
        │                               │
        │  📚 Kuliah                   │
        │    ☐ Kerjakan laporan PBO    │
        │  🏃 Kesehatan                │
        │    ☑ Jogging 30 menit        │
        └──────────────────────────────┘
```

## ✨ Fitur

- **Dynamic island** — pill/notch di atas layar yang membesar saat di-hover dan bisa diklik tembus saat tidak dipakai.
- **Chat ke todo** — tulis rencana bebas, Gemini mengubahnya menjadi todo terstruktur.
- **Pilih sebelum simpan** — hasil Gemini bisa dicentang/dihilangkan sebelum disimpan.
- **Kategori otomatis** — todo dikelompokkan per kategori dengan emoji.
- **Prioritas & deadline** — badge urgensi merah/kuning berdasarkan sisa hari menuju deadline.
- **Edit cepat** — double-click judul untuk mengubahnya, klik tanggal untuk mengganti deadline.
- **Hapus & bersihkan** — hapus satu todo atau semua todo yang sudah selesai.
- **Shortcut global** — `Ctrl+Shift+Space` untuk membuka island dan langsung fokus ke input chat.
- **System tray** — tampilkan/sembunyikan island, aktifkan start on login, atau keluar dari aplikasi.
- **Indikator deadline** — titik merah berdenyut di pill jika ada todo yang deadline-nya hari ini.
- **Local-first** — data disimpan di file JSON lokal, bukan di cloud.
- **Satu instance** — membuka aplikasi dua kali tidak akan membuat island dobel.

## 🧰 Tech Stack

| Bagian | Teknologi |
|---|---|
| Desktop shell | Electron |
| Build tool | electron-vite + Vite |
| UI | React + TypeScript |
| Styling | Tailwind CSS v4 + Poppins (`@fontsource`) |
| Animasi | Framer Motion |
| LLM | Gemini API (`@google/genai`) |
| Validasi | Zod |
| Penyimpanan | `electron-store` v8 |
| Installer | electron-builder + NSIS |

## 📋 Prasyarat

- **Windows 10/11** (target build utama; script macOS/Linux juga tersedia)
- **Node.js 20.19+ atau 22.12+**
- **npm**
- **API key Gemini** gratis dari [Google AI Studio](https://aistudio.google.com)

## 🚀 Menjalankan Proyek

Semua perintah dijalankan dari folder **`src/`**, karena `package.json` ada di sana.

```bash
git clone <url-repository> TodoLand
cd TodoLand/src
npm install
```

Buat file `.env` di dalam folder `src/`:

```env
MAIN_VITE_GEMINI_API_KEY=isi_api_key_kamu
```

Lalu jalankan:

```bash
npm run dev
```

> 💡 `.env` sudah masuk `.gitignore`. Jangan pernah meng-commit API key ke GitHub.

## 🕹 Cara Pakai

| Aksi | Cara |
|---|---|
| Buka island | Hover ke island, atau tekan `Ctrl+Shift+Space` |
| Membuat todo | Buka tab **Chat**, tulis rencana, tekan **Enter** |
| Memilih hasil | Centang saran yang ingin disimpan, lalu klik **Simpan** |
| Menyelesaikan todo | Centang checkbox di tab **Todo** |
| Mengedit judul | Double-click judul todo |
| Mengganti deadline | Klik tanggal pada todo |
| Menghapus todo | Klik tombol **✕** pada baris todo |
| Membersihkan todo selesai | Klik **Bersihkan ✓** |
| Menyembunyikan island | Klik ikon tray → **Tampilkan/Sembunyikan** |
| Keluar aplikasi | Tombol **✕** di panel atau menu tray → **Quit** |

## 📁 Struktur Folder

```text
TodoLand/
├── README.md
├── docs/
│   └── langkah-pembuatan.md     # tutorial lengkap pembuatan aplikasi
└── src/                         # kode aplikasi Electron
    ├── build/                   # ikon installer (.ico, .icns, .png)
    ├── resources/               # ikon tray/run
    ├── electron-builder.yml     # konfigurasi installer
    ├── electron.vite.config.ts
    ├── package.json
    └── src/
        ├── main/                # main process (Node.js)
        │   ├── index.ts         # jendela island, tray, shortcut
        │   ├── ipc.ts           # handler IPC
        │   ├── llm.ts           # integrasi Gemini
        │   └── store.ts         # penyimpanan todo
        ├── preload/             # jembatan aman ke renderer
        ├── renderer/src/        # UI React
        │   ├── App.tsx          # komponen island
        │   ├── useChat.ts       # state chat + Gemini
        │   ├── components/
        │   │   ├── ChatTab.tsx
        │   │   └── TodoTab.tsx
        │   └── assets/main.css  # Tailwind + font
        └── shared/              # tipe & util yang dipakai main + renderer
            ├── types.ts
            └── date.ts
```

## ⚙️ Konfigurasi

| Yang ingin diubah | Lokasi |
|---|---|
| API key Gemini | `src/.env` → `MAIN_VITE_GEMINI_API_KEY` |
| Model Gemini | `src/src/main/llm.ts` → konstanta `MODEL` |
| Lebar jendela & tinggi panel | `src/src/main/index.ts` → `WIDTH` dan `height` |
| Bentuk/ukuran island | `src/src/renderer/src/App.tsx` → class `w-[...]`, `h-[...]`, `borderRadius` |
| Font aplikasi | `src/src/renderer/src/assets/main.css` |
| Nama aplikasi & ikon installer | `src/electron-builder.yml` → `appId`, `productName`, `win.icon` |

Data todo tersimpan otomatis di:

```text
%APPDATA%\todoland\config.json
```

## 📦 Build Installer

```bash
cd src
npm run build:win
```

Installer akan muncul di:

```text
src/dist/todoland-1.0.0-setup.exe
```


