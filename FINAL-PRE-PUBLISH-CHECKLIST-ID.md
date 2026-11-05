# LSPD Portal — Final Pre-Publish Checklist

## Perubahan yang sudah dilakukan dalam audit
- Menyatukan API kompatibilitas `/api/records` ke tabel `PortalRecord`, sehingga halaman modul lama dan portal utama membaca/menulis satu database bersama.
- Menambahkan impor satu kali dari tabel Prisma legacy `Announcement`, `Attendance`, `FleetVehicle`, dan `Weapon` ke `PortalRecord`; ID yang sudah ada di `PortalRecord` dipertahankan sebagai data kanonis.
- Memperbaiki hidrasi Announcement untuk akun viewer: jika migrasi data lokal ditolak karena role manager-only, viewer tetap memuat salinan server bersama.
- Membuka akses baca pengumuman untuk seluruh user yang sudah login; create/update/delete tetap role High Command `1559517530312278036`.
- Mendaftarkan koleksi `videos` pada API database, menambahkan validasi URL/kategori/durasi, dan membatasi publikasi/penghapusan ke role manager `1559517530312278036`.
- Menambahkan polling pada halaman modul dan Media Center agar perubahan user lain terlihat tanpa harus selalu reload.
- Mengalihkan halaman Analytics dan Chain of Command versi route lama ke koleksi `PortalRecord` yang sama, dengan polling ketika halaman aktif.
- Ringkasan profil pada route modul kini mengambil data roster bersama terlebih dahulu; tabel `User` hanya menjadi fallback profil/login.
- Menambahkan refresh Photo Gallery setiap 20 detik; data yang tidak berubah tidak dicat ulang.
- Memperbaiki sinkronisasi localStorage agar antrean simpan/hapus diproses berurutan, kegagalan ditandai, dan polling tidak menimpa perubahan lokal yang belum berhasil tersimpan.
- Saat startup, local-only records dari setiap browser digabungkan ke DB jika ID-nya belum ada; jika ID bentrok, record server menjadi sumber yang menang.
- Menambahkan endpoint `/api/health` yang memeriksa koneksi DB dan ketersediaan tabel `PortalRecord` untuk user yang sudah login.

## Sumber data bersama
| Koleksi | Penyimpanan pusat | Pembaruan lintas user |
|---|---|---|
| Officer roster/profile | `PortalRecord` kind `officers` | Polling portal 20 detik |
| Attendance | `PortalRecord` kind `attendance` | Polling portal 20 detik |
| Announcements | `PortalRecord` kind `announcements` | Polling portal 20 detik dan popup memuat langsung |
| Fleet | `PortalRecord` kind `fleet` | Polling portal 20 detik |
| Weapons | `PortalRecord` kind `weapons` | Polling portal 20 detik |
| Photo Gallery | `PortalRecord` kind `photos` dan `photo-hidden` | Load/poll 20 detik |
| Legacy Media Center videos | `PortalRecord` kind `videos` | Polling halaman 15 detik |

## Pemeriksaan yang masih harus dilakukan di mesin/deployment pemilik
Paket sumber dapat diperiksa di lingkungan ini, tetapi instalasi dependency tidak berhasil karena npm registry tidak tersedia/timeout. Karena itu build Next.js penuh dan type-check berbasis dependency belum dapat dinyatakan lulus di sini. Tidak ada kredensial Supabase/Discord produksi yang digunakan untuk tes live. Karena itu status koneksi database produksi, migration Supabase, dan OAuth Discord tetap harus diverifikasi di environment milik pemilik project.

Setelah mengekstrak ZIP di komputer sendiri (jangan mengganti `.env`):

```bash
bun install
bunx prisma generate
bunx prisma migrate deploy
bun run build
bun run start
```

Jika memakai npm:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

Setelah aplikasi hidup dan login Discord berhasil, buka `http://localhost:3000/api/health` (atau domain production + `/api/health`). Hasil yang diharapkan adalah `ok: true`, `database: "connected"`, `portalRecordsTable: "available"`, `legacyPrismaImport: "complete"`, dan hitungan `recordsByKind`. Jika 503, jangan publish sebelum memeriksa `DATABASE_URL`, `DIRECT_URL`, dan migration log.

Tes dengan dua akun yang sudah diizinkan masuk portal: buat satu data uji pada Officer/Fleet/Weapon/Announcement/Photo sesuai role, kemudian pastikan akun kedua melihat perubahan setelah refresh atau interval sinkronisasi. Verifikasi juga bahwa role viewer `1559517381422874705` hanya dapat melihat galeri, sedangkan role manager `1559517530312278036` dapat upload/delete foto/video dan mengelola announcement.

Tidak ada sistem web yang dapat dijamin bebas dari semua bug hanya dari pemeriksaan sumber. Nyatakan siap publish setelah build produksi dan tes dua akun pada database Supabase yang benar-benar dipakai Vercel berhasil.
