# LSPD Portal — Interface Refresh

## Ringkasan perubahan
- Halaman utama sekarang menjadi public-facing landing page yang dapat dibuka tanpa login.
- Informasi umum departemen, standar pelayanan, dan informasi rekrutmen ditampilkan untuk semua pengunjung.
- Tombol **Officer Login** mengarahkan ke autentikasi Discord yang sudah ada.
- Setelah autentikasi berhasil, anggota tetap masuk ke portal internal yang sudah ada. Layar pembuka internal dan tombol masuk tetap digunakan sebelum menu anggota ditampilkan.
- Seluruh modul, API, database integration, media center, role-based permissions, dan fitur portal internal dipertahankan.
- Tampilan internal diperbarui dengan palet graphite/slate dan aksen champagne, dengan animasi yang lebih ringan.

## File yang diubah
- `src/app/page.tsx` — public homepage + session-aware internal portal.
- `src/app/globals.css` — styling public homepage.
- `src/app/layout.tsx` — metadata.
- `public/portal.html` — visual refresh untuk portal anggota; tidak menghapus modul atau script fungsional.

## Deployment
1. Extract folder project.
2. Install dependencies dengan `npm install`.
3. Siapkan environment variables sesuai `.env.example` (Discord OAuth, session secret, database).
4. Jalankan migration/generate sesuai workflow deployment project (`npx prisma migrate deploy`, `npx prisma generate`).
5. Build dan deploy seperti sebelumnya.

Catatan: verifikasi build otomatis belum dapat diselesaikan di lingkungan kerja ini karena proses instalasi dependency terhenti. Jalankan `npm install` lalu `npm run build` di lingkungan deployment untuk pemeriksaan final.
