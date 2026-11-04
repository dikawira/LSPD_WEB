# Panduan Update LSPD Portal — Perbaikan Photo Gallery

## Yang diperbaiki
1. Tombol **Publish Photo** tidak lagi membaca elemen `lspdPhotoDuration` yang sebenarnya tidak ada di formulir.
2. Kolom **Caption / Details** sekarang disimpan dan dapat ditampilkan sebagai caption kartu foto.
3. Prisma otomatis menambahkan `pgbouncer=true` dan `connection_limit=1` untuk `DATABASE_URL` Supabase Transaction Pooler port `6543`.
4. Validasi API menerima `details` opsional dengan batas 500 karakter.
5. Tidak ada migration database baru. Project tetap memakai tabel `PortalRecord` yang sudah ada.

## Cara memasang di komputer
1. Buat salinan/backup folder project lama.
2. Ekstrak ZIP perbaikan ini ke folder baru.
3. Pindahkan file `.env` milikmu yang sudah diperbarui ke folder project baru. ZIP ini sengaja tidak menyertakan `.env`.
4. Buka folder baru di VS Code.
5. Jalankan:
   ```bash
   bun install
   bun run db:generate
   bun run dev
   ```
   Jika memakai npm:
   ```bash
   npm install
   npx prisma generate
   npm run dev
   ```
6. Buka `http://localhost:3000`, login dengan Discord, lalu uji Photo Gallery.

## Environment variables
Pastikan `.env` lokal dan Vercel berisi:
- `DATABASE_URL`: Supabase Transaction Pooler port `6543`.
- `DIRECT_URL`: Supabase Session Pooler port `5432` atau direct database connection.
- `AUTH_SECRET`.
- Kredensial Discord OAuth dan ID server/role yang sebelumnya digunakan.

Contoh format ada di `.env.example`. Jangan menyalin placeholder contoh sebagai kredensial sungguhan. Kode Prisma sudah mengaktifkan mode PgBouncer secara otomatis untuk `DATABASE_URL` port `6543`.

## Deploy ke Vercel
1. Update source project di GitHub dengan isi folder ZIP ini (jangan commit `.env`).
2. Pastikan environment variables di Vercel sudah diperbarui untuk Production/Preview sesuai kebutuhan.
3. Jalankan redeploy.
4. Periksa Build Logs. Script build menjalankan `prisma migrate deploy`, `prisma generate`, lalu `next build`.
5. Jangan menghapus tabel atau menjalankan reset database jika migrasi gagal. Periksa error terlebih dahulu.

## Catatan keamanan penting
Arsip sumber yang dikirim untuk diperbaiki menyertakan file `.env`. Untuk keamanan, ZIP hasil perbaikan ini tidak menyertakan `.env`, `.env.local`, folder `.git`, `node_modules`, atau `.next`.

Segera rotasi/ganti:
- Password database Supabase.
- Discord Client Secret.
- `AUTH_SECRET`.

Setelah mengganti, perbarui `.env` lokal dan Vercel Environment Variables. Jangan mengirim file `.env` lagi dan jangan memasukkannya ke GitHub.

## Batas verifikasi
Pemeriksaan sintaks JavaScript inline dan TypeScript berhasil dilakukan. Build produksi penuh dan uji tulis/hapus langsung ke database Supabase tidak dapat dijalankan dari lingkungan ini; lakukan pengujian setelah memasang kredensial baru di komputer/Vercel.


## Pembaruan status rail — posisi referensi
Versi ini mengatur lebar status rail menjadi 91% dari lebar halaman, tanpa batas lebar maksimum, dengan margin kiri-kanan seimbang. Kolom jam/tanggal dan badge Operational Duty Active ditaruh rapat di ujung kanan. Bagian lain tidak diubah.
