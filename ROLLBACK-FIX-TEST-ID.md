# Verifikasi fix Fleet/Weapon rollback

## Penyebab
Sinkronisasi awal menggabungkan record `localStorage` yang ID-nya belum ada di database ke koleksi bersama. Jika satu perangkat masih menyimpan salinan lama setelah record dihapus di perangkat lain, salinan lama tersebut dapat dimigrasikan lagi dan membuat record muncul kembali.

## Perbaikan
1. DELETE membuat marker permanen `_deleted` dengan ID `<kind>:<recordId>` dalam transaksi serializable.
2. GET mengeluarkan record yang mempunyai marker.
3. POST/compatibility POST-PATCH menolak ID yang sudah mempunyai marker.
4. Startup sync mengambil `withDeleted=1` dan menghapus salinan lokal lama sebelum migrasi.
5. Tombstone berlaku untuk semua koleksi portal (officers, attendance, announcements, fleet, weapons, videos, photos, photo-hidden).
6. Fleet/Weapon UI menunggu penghapusan terkonfirmasi server; bila gagal, record dipulihkan dan error ditampilkan.

## Uji manual setelah deploy
- Dari browser A, hapus satu record Fleet. Tunggu toast sukses.
- Dari browser B/perangkat lain yang masih menyimpan cache lama, buka/refresh portal. Record harus tetap hilang.
- Coba simpan ulang payload/ID lama melalui cache lama. API harus mengabaikan ID bertombstone; record tidak muncul di GET.
- Ulangi untuk Weapon.
- Tambah record baru dengan ID baru; record harus tetap tersimpan dan sinkron untuk semua user.

## Catatan data yang sudah telanjur rollback
Tombstone tidak dapat mengetahui penghapusan yang terjadi sebelum patch ini. Record yang sudah muncul lagi di database sebelum patch perlu dihapus sekali lagi setelah deploy untuk membuat tombstone permanen.

## Batas verifikasi lingkungan
Pemeriksaan sintaks dan struktur kode tidak membuktikan koneksi database produksi. Uji manual di atas tetap harus dilakukan terhadap Supabase/Vercel yang aktif.
