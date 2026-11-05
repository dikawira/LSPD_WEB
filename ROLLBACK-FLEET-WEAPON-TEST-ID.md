# Uji anti-rollback Fleet / Weapon

## Mekanisme yang diperbaiki
- Loader pertama sebelumnya menganggap semua item `localStorage` yang tidak ada di server sebagai record baru, lalu mengirimnya kembali melalui POST. Salinan browser yang lama dapat menghidupkan kembali ID setelah dihapus.
- Sekarang DELETE membuat tombstone permanen `_deleted` (`<kind>:<id>`) di tabel bersama `PortalRecord`.
- Semua GET menghilangkan record bertombstone. POST menolak ID tersebut dan memberi daftar `ignoredDeletedIds`.
- Sinkronisasi awal menerima `records + deletedIds`, menghapus cache lokal untuk ID bertombstone sebelum migrasi.
- API kompatibilitas dan importer legacy juga menghormati penanda penghapusan.

## Tes setelah deploy
1. Buka portal di browser A, buat record Fleet, tunggu sampai sinkronisasi berhasil.
2. Hapus record Fleet. Tunggu toast konfirmasi bahwa penghapusan permanen tersimpan di database bersama.
3. Buka portal di browser B yang sebelumnya pernah menyimpan record yang sama. Record harus tetap tidak terlihat.
4. Reload browser A dan B, lalu tunggu refresh otomatis. Record tetap harus hilang.
5. Ulangi untuk Weapon.
6. Buat record baru dengan ID baru untuk memastikan record baru masih bisa tersimpan dan tersinkron ke seluruh user.

## Data yang sudah telanjur muncul lagi sebelum patch
Tombstone tidak dapat merekonstruksi penghapusan historis. Jika ada record hantu yang sudah muncul lagi sebelum versi ini dipasang, hapus sekali lagi setelah deploy agar penanda permanen dibuat.

## Batas verifikasi
Pemeriksaan statis/sintaks tidak membuktikan database produksi. Tes dua browser di atas harus dilakukan terhadap deployment Supabase/Vercel yang aktif.
