# LSPD Portal — Final Pre-Publish Audit

Tanggal audit: 5 November 2026

## Ringkasan

Project telah diaudit dan diperbaiki pada jalur data bersama, role media/announcement, halaman Analytics dan Chain of Command, serta migrasi data Prisma lama. Data operasional yang dinamis kini menggunakan `PortalRecord` sebagai satu sumber data PostgreSQL.

**Status:** audit sumber dan pemeriksaan sintaks lulus. **Belum boleh dianggap production-verified** sampai build Next.js penuh, koneksi Supabase, migrasi di environment produksi, OAuth Discord, dan tes lintas dua akun dijalankan pada environment pemilik project.

## Hal yang diperbaiki dalam final audit

1. API kompatibilitas `/api/records` dan API portal utama `/api/portal-data` menggunakan tabel bersama `PortalRecord`.
2. Ditambahkan impor satu kali dari tabel Prisma legacy `User` (hanya profil yang memiliki data personel), `Announcement`, `Attendance`, `FleetVehicle`, dan `Weapon` ke `PortalRecord`. ID server yang sudah ada tetap menjadi versi kanonis.
3. Sinkronisasi awal browser menggabungkan data lokal yang belum ada di server. Jika record lokal memiliki ID yang sama dengan server, server menang. Untuk record personel lama dengan ID berbeda, pencocokan dilakukan berdasarkan badge/nama; kendaraan berdasarkan plat; senjata berdasarkan serial. Field server tetap menang, sedangkan field lokal hanya mengisi nilai server yang kosong.
4. User tanpa role manager tetap dapat memuat Announcement dari server. Jika data Announcement lokal lama tidak dapat dimigrasikan karena role manager-only, viewer tetap menghidrasi salinan server dan tidak tertahan pada data lokal lama.
5. Analytics dan Chain of Command route sekunder membaca endpoint roster/inventaris bersama dan melakukan refresh ketika halaman aktif.
6. Ringkasan profil pada halaman modul menggunakan record officer bersama terlebih dahulu; tabel `User` menjadi fallback untuk identitas login.
7. Ditambahkan `/api/health` untuk memeriksa koneksi database, tabel `PortalRecord`, jumlah user, jumlah record per jenis, dan status impor legacy.
8. Teks Fleet/Weapon diperbarui agar menyatakan data berasal dari database bersama, bukan hanya perangkat saat ini.
9. Analytics dan Chain of Command versi route sekunder dipindahkan ke client views yang membaca API bersama dan refresh tiap 15 detik; server route tetap memverifikasi sesi login.
9. Struktur Mega Dropdown Preview 1, Photo Gallery submenu, logout Discord, avatar Discord, lightbox profil, multi-asset Fleet/Weapon, role Photo Gallery, dan fitur sebelumnya dipertahankan.

## Pemetaan data bersama

| Bagian/menu | Sumber data | Refresh |
|---|---|---:|
| Home / dashboard / statistik utama | `PortalRecord` kinds `officers`, `attendance`, `fleet`, `weapons`, `announcements` | 20 detik |
| Chain of Command / Officer Directory | `PortalRecord` kind `officers` | 15–20 detik |
| Officer Registration | `PortalRecord` kind `officers` | 15–20 detik |
| Officer Attendance | `PortalRecord` kind `attendance` | 15–20 detik |
| Fleet Data | `PortalRecord` kind `fleet` | 20 detik |
| Weapon Data | `PortalRecord` kind `weapons` | 20 detik |
| Announcements | `PortalRecord` kind `announcements` | Fetch langsung/polling |
| Photo Gallery / All Photos / Categories / Albums | `PortalRecord` kinds `photos` dan `photo-hidden` | 20 detik |
| Legacy Media Center videos | `PortalRecord` kind `videos` | 15 detik |
| Analytics | API `/api/records` untuk officers, attendance, fleet, weapons | 15 detik |
| Handbook | Link/dokumen statis eksternal | Tidak memerlukan database |

Semua akun yang lolos Discord login dan menggunakan deployment/database yang sama membaca sumber data PostgreSQL yang sama. Perubahan antar akun terlihat melalui polling; ini bukan WebSocket instan. Record berbeda digabung secara terpisah. Edit bersamaan pada record ID yang sama tetap menggunakan prinsip last-write-wins.

## Role dan akses saat ini

- Portal login dikendalikan oleh `DISCORD_ALLOWED_ROLE_IDS` dan fail-closed ketika allow-list kosong atau user tidak memiliki role yang diizinkan.
- Photo Viewer: role `1559517381422874705` dapat melihat Photo Gallery.
- Photo Manager: role `1559517530312278036` dapat melihat, upload, hide, dan delete foto; role yang sama dapat mengelola Announcement dan video.
- Announcement dapat dibaca oleh semua user portal yang sudah login; create/update/delete hanya untuk role `1559517530312278036`.
- **Penting:** CRUD Officer roster, Attendance, Fleet, dan Weapon saat ini tersedia untuk semua user yang berhasil login ke portal. Jika operasi tersebut harus dibatasi khusus High Command/command staff, tentukan ID role pengelola lalu tambahkan gate server-side pada API sebelum production. Jangan hanya menyembunyikan tombol di browser.
- Role disimpan pada sesi OAuth. Setelah role Discord berubah, user harus logout lalu login kembali agar sesi mendapatkan role terbaru.

## Pemeriksaan yang berhasil

- 7 blok JavaScript inline pada portal lolos `node --check`.
- 23 file TypeScript/TSX lolos parsing/transpilasi sintaks TypeScript; tidak ditemukan syntax diagnostics.
- 219 atribut ID HTML diperiksa; tidak ditemukan duplicate ID.
- 17 pemeriksaan integrasi statis (PortalRecord, role, legacy import, analytics/chain, menu, sync) lulus.
- Pemeriksaan import path lokal, file migration, package JSON, route OAuth/health, dan pengecualian file rahasia lulus.
- Pemeriksaan statis API, PortalRecord, impor legacy, role, menu Mega Dropdown, Photo Gallery, dan endpoint health lulus.
- Import lokal relatif dan alias `@/` pada file TypeScript/TSX diperiksa; tidak ada path import lokal yang hilang.
- `package.json`, migration PortalRecord, route OAuth, route logout, dan route health ada.
- `.env` dan `.env.local` tidak dimasukkan ke ZIP.

## Yang belum dapat diverifikasi di lingkungan audit

- Build Next.js produksi (`next build`) dan full TypeScript type-check berbasis dependency belum dijalankan. `node_modules` tidak tersedia dan instalasi dependency sebelumnya tidak berhasil karena npm registry timeout; parsing sintaks di atas bukan pengganti build penuh.
- Tidak ada kredensial Supabase/Discord produksi yang digunakan. Koneksi database, migrasi, OAuth guild-member lookup, role Discord aktual, dan sinkronisasi dua browser belum diuji live.
- Tidak ada sistem yang dapat dijamin bebas dari semua bug hanya dari source review. Jangan publikasikan sebelum checklist di bawah lulus.

## Checklist wajib sebelum publish

1. Pertahankan `.env` lokal milikmu; ZIP tidak menyertakannya. Di Vercel Production atur `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `DISCORD_REDIRECT_URI`, `DISCORD_GUILD_ID`, `DISCORD_ALLOWED_ROLE_IDS`, dan `APP_URL`.
2. `DATABASE_URL` gunakan connection string Supabase pooler yang sesuai untuk runtime aplikasi. `DIRECT_URL` gunakan koneksi direct/session yang didukung untuk menjalankan migration; jangan mengisi password/URL database ke chat.
3. Atur Discord OAuth redirect URI menjadi `https://DOMAIN-PRODUKSI/api/auth/discord/callback` baik di `.env` Vercel maupun Discord Developer Portal. `DISCORD_ALLOWED_ROLE_IDS` harus berisi role Discord yang boleh masuk portal.
4. Instal dan build di komputer project:

   ```bash
   bun install
   bunx prisma generate
   bunx prisma migrate deploy
   bun run build
   bun run start
   ```

   `build` juga menjalankan `prisma migrate deploy`; command manual di atas membantu memisahkan error migration dari error build.
5. Login dengan dua akun Discord yang memang diizinkan. Pada akun A buat satu record uji di Officer/Fleet/Weapon dan satu data sesuai izin; pastikan akun B melihat data yang sama setelah refresh atau paling lama interval sinkronisasi.
6. Verifikasi `/api/health` saat sudah login: hasil yang diharapkan `ok: true`, `database: "connected"`, `portalRecordsTable: "available"`, `legacyPrismaImport: "complete"`, serta `recordsByKind`.
7. Uji role: akun Viewer `1559517381422874705` dapat membuka All Photos/Categories/Albums tetapi tidak dapat Upload/Delete; akun Manager `1559517530312278036` dapat mengelola foto dan Announcement. Uji juga Announcement popup pada akun viewer.
8. Periksa data hasil impor legacy dan jumlah personel/armada/senjata sebelum menghapus atau mematikan deployment lama. Backup Supabase sebelum migration/deploy.

**Rekomendasi publish:** lakukan deploy staging/preview terlebih dahulu. Publikasikan ke domain utama hanya setelah `bun run build`, `/api/health`, OAuth Discord, tes role, dan tes sinkronisasi dua akun semuanya berhasil.
