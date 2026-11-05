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


## Photo Gallery: halaman khusus
Menu **All Photos**, **Photo Categories**, dan **Albums** sekarang membuka halaman Photo Library tersendiri melalui sistem navigasi portal. Halaman ini bekerja dari Home maupun dari Fleet Data, Weapon Data, dan modul lain.
- **All Photos**: menampilkan seluruh foto unggulan dan foto yang tersimpan di database, termasuk pencarian serta filter kategori.
- **Photo Categories**: menampilkan kartu kategori; klik kategori untuk membuka foto di dalamnya.
- **Albums**: menampilkan koleksi yang dikelompokkan menurut kategori; klik album untuk melihat seluruh foto dalam koleksi.
- Kartu foto dapat dibuka dalam lightbox; tombol Delete tetap hanya ditampilkan untuk role Photo Gallery manager.


## Photo Gallery: role Viewer dan Upload dipisah
- **Viewer role:** `1559517381422874705` — dapat membuka **All Photos**, **Photo Categories**, dan **Albums**. Menu **Upload Photo** tidak ditampilkan.
- **Upload/manager role:** `1559517530312278036` — dapat membuka halaman Photo Gallery dan menu **Upload Photo**, termasuk menyimpan, menyembunyikan, dan menghapus foto.
- Pemegang role Upload juga dapat melihat galeri. Role Viewer saja tidak dapat mengunggah atau menghapus.
- API GET `photos` dan `photo-hidden` memeriksa viewer role atau upload role; API POST/DELETE tetap memeriksa upload role saja.
- Pada `.env` lokal dan Vercel, `DISCORD_ALLOWED_ROLE_IDS` harus memuat kedua role, dipisahkan koma:
  `1559517381422874705,1559517530312278036`
- Perbarui Environment Variables Vercel untuk Production/Preview yang dipakai, lalu redeploy. File `.env` tidak disertakan di ZIP.


## Notification bell — latest announcements
Klik ikon lonceng di navigation bar untuk membuka popup **Latest Announcements**. Popup mengambil enam pengumuman terbaru dari endpoint `GET /api/portal-data?kind=announcements`, menampilkan kategori, prioritas, judul, isi, penulis, dan waktu terbit. Pembacaan announcement tersedia untuk semua pengguna LSPD yang sudah login; endpoint POST/DELETE tetap dibatasi ke role High Command `1559517530312278036`.


## Fleet & Weapon data di Officer Profile
Detail Officer Profile kini memiliki panel **Assigned Inventory** yang menampilkan Fleet Assignments dan Weapon Assignments.
- Fleet dicocokkan memakai kolom `Nama Officer` (`officer`), identitas badge, assigned fields jika ada, dan callsign.
- Weapon dicocokkan memakai kolom `Pemegang / Badge Officer` (`assigned`), serta variasi officer/badge field.
- Identitas yang didukung: nama officer, nomor badge (dengan atau tanpa `#` / label `BADGE`), dan callsign.
- Panel menampilkan jumlah aset serta detail kendaraan/senjata, serial/plat, divisi, callsign, status, dan notes jika ada.
- Panel diperbarui saat data Fleet/Weapon disimpan, dihapus, atau menerima sinkronisasi database.
- Bila belum ada kecocokan, panel memberi petunjuk agar nilai assignment memakai nama, badge, atau callsign yang terdaftar pada profil.


## Roster-linked Fleet & Weapon assignment
Form Fleet Data dan Weapon Data memakai dropdown officer yang sama dengan Officer Attendance.
- Pilihan berbentuk `Nama — #Badge (Rank)` dan sumbernya adalah Officer Registration.
- Saat officer dipilih, Fleet Call Sign dan Division akan diisi dari profil; Division pada Weapon juga otomatis dipilih.
- Data inventaris menyimpan `officerId` / `assignedOfficerId` beserta nama, badge, rank, sehingga hubungan tidak lagi hanya bergantung pada teks.
- Satu officer dapat memiliki beberapa kendaraan dan beberapa senjata. Semua record yang terhubung tampil sebagai kartu terpisah di bagian Assigned Inventory, dengan hitungan per kategori dan scroll bila jumlahnya banyak.
- Data lama tetap dicoba dicocokkan berdasarkan nama, badge, atau identitas yang sudah tersimpan; data baru menggunakan officer ID.
