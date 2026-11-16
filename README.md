# Portofolio Aufa

Portofolio satu layar dengan galeri WebGL yang melengkung saat di-scroll, terinspirasi dari robin-noguier.com.

## Menjalankan

```bash
npm install
npm run dev
```

Buka http://localhost:3000

## Mengubah konten

Semua konten ada di **`src/content/cards.ts`**:

- `site`: nama di pojok kiri atas, judul tab, tautan kanan atas.
- `cards`: satu objek = satu card. Urutan di array = urutan scroll.

Field per card:

| Field         | Wajib | Keterangan |
|---------------|-------|------------|
| `slug`        | ✓ | ID unik, huruf kecil tanpa spasi |
| `title`       | ✓ | Judul besar |
| `description` | ✓ | Paragraf di bawah judul |
| `image`       | ✓ | Gambar utama di galeri WebGL (mis. `/images/profile.jpg`) |
| `colors`      | ✓ | `background`, `accent` (judul, garis kiri, titik nav), `text`: `"light"` / `"dark"` |
| `eyebrow`     |   | Teks kecil di atas judul |
| `details`     |   | Daftar `{ label, value }`, cocok untuk profil (TTL, domisili, dll.) |
| `preview`     |   | Gambar atau video `.mp4` untuk kotak kecil kiri bawah |
| `cta`         |   | Tombol `{ label, href }` |
| `label`       |   | Nama pendek untuk tooltip titik navigasi |

Simpan gambar di `public/images/`. Gambar akan otomatis di-crop (seperti `object-fit: cover`).

## Mengatur efek

Di `src/components/Gallery.tsx`, fungsi `layoutFor()`:

- `shear`: kemiringan kolom gambar
- `curve`: seberapa melengkung gambarnya
- `planeW` / `planeH`: ukuran gambar
- `x` / `y`: posisi kolom

Di `src/components/Portfolio.tsx`: `WHEEL_SPEED`, `TOUCH_SPEED`, dan `SNAP_DELAY` mengatur sensitivitas scroll.

Navigasi: scroll mouse / trackpad, swipe di HP, tombol panah, atau klik titik di kanan.
