# Implementation Plan: Spendly – Expense & Budget Visualizer

## Overview

Implementasi dilakukan secara incremental menggunakan Vanilla JavaScript murni (HTML + CSS + JS) tanpa framework atau build tools. Setiap langkah membangun di atas langkah sebelumnya, dimulai dari fondasi struktur file dan fungsi utilitas murni, lalu komponen UI, kemudian persistensi dan integrasi penuh. Pengujian dilakukan secara manual melalui browser.

---

## Tasks

- [x] 1. Buat struktur file proyek dan konfigurasi dasar
  - Buat file `index.html` dengan boilerplate HTML5, meta viewport, link ke `css/style.css` dan `js/app.js`
  - Buat file `css/style.css` (kosong, siap diisi)
  - Buat file `js/app.js` (kosong, siap diisi)
  - Pastikan struktur direktori sesuai desain: `index.html`, `css/style.css`, `js/app.js` — tidak ada file lain kecuali test
  - _Requirements: 10.5_

- [x] 2. Implementasi fungsi utilitas murni (pure functions) di `js/app.js`
  - [x] 2.1 Implementasi `generateUUID()` — UUID v4 menggunakan `crypto.randomUUID()` atau fallback manual
    - _Requirements: 1.5_
  - [x] 2.2 Implementasi `formatRupiah(amount)` — menghasilkan string "Rp" + titik ribuan tanpa desimal
    - Contoh: `15000` → `"Rp15.000"`, `1500000` → `"Rp1.500.000"`
    - _Requirements: 2.4, 4.4, 7.2_
  - [x] 2.4 Implementasi `validateForm(description, amount, category)` — mengembalikan `{ valid: boolean, errors: { description?, amount?, category? } }`
    - Validasi: description tidak kosong/whitespace, amount antara 0.01–999999999.99, category salah satu dari ["Food", "Transport", "Fun"]
    - _Requirements: 1.2, 1.4, 1.7, 1.8, 1.9_
  - [x] 2.6 Implementasi `calculateTotal(transactions)` — menjumlahkan semua `amount`, mengembalikan `0` untuk array kosong
    - _Requirements: 4.1, 4.2, 4.3_
  - [x] 2.8 Implementasi `aggregateByCategory(transactions)` — mengembalikan objek `{ [category]: totalAmount }`
    - _Requirements: 5.1, 5.2_
  - [x] 2.10 Implementasi `sortTransactions(transactions, sortOption)` — mengembalikan array baru terurut sesuai opsi (`date-desc`, `amount-asc`, `amount-desc`, `category-asc`)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  - [x] 2.12 Implementasi `groupByMonth(transactions)` — mengembalikan array `[{ label: "Juli 2024", total: number }, ...]` diurutkan terbaru ke terlama, tidak menyertakan bulan tanpa transaksi
    - _Requirements: 7.1, 7.4_

- [x] 3. Implementasi Local Storage dan manajemen state di `js/app.js`
  - [x] 3.1 Deklarasikan state aplikasi: `let transactions = []`, `let currentSort = 'date-desc'`, `let pendingDeleteId = null`, serta konstanta `CATEGORIES = ['Food', 'Transport', 'Fun']` dan `CATEGORY_COLORS`
    - _Requirements: 8.5_
  - [x] 3.2 Implementasi `saveToStorage()` — serialize `transactions` ke JSON dan simpan ke key `"spendly_transactions"`, tangkap exception dan tampilkan error global jika gagal
    - _Requirements: 6.1, 6.2, 3.7_
  - [x] 3.3 Implementasi `loadFromStorage()` — baca key `"spendly_transactions"`, parse JSON, kembalikan array kosong jika tidak ada data, hapus data korup dan kembalikan array kosong jika parse gagal
    - _Requirements: 6.3, 6.4, 6.5_
  - [x] 3.5 Implementasi `addTransaction(description, amount, category)` — buat objek Transaction baru (dengan `generateUUID()` dan `new Date().toISOString()`), push ke `transactions`, panggil `saveToStorage()` lalu `renderAll()`
    - _Requirements: 1.5, 7.5_
  - [x] 3.7 Implementasi `deleteTransaction(id)` — filter `transactions` untuk menghapus elemen dengan `id` yang cocok, panggil `saveToStorage()` lalu `renderAll()`
    - _Requirements: 3.3, 3.5, 3.6_

- [x] 4. Buat markup HTML lengkap di `index.html`
  - [x] 4.1 Buat struktur header: logo "Spendly", tombol `#theme-toggle` dengan ikon matahari/bulan, sticky di atas layar
    - _Requirements: 9.1_
  - [x] 4.2 Buat Transaction Form Card: field `#input-name` (maxlength="100"), `#input-amount` (min/max/step), select `#select-category` (3 opsi: Food, Transport, Fun), tombol `#btn-add`, dan `<span class="error-msg">` di bawah setiap field
    - _Requirements: 1.1, 1.2, 1.3, 1.7, 1.8, 1.9_
  - [x] 4.3 Buat Summary Panel Card: elemen `#total-display`
    - _Requirements: 4.1, 4.4_
  - [x] 4.4 Buat Sort Control dan Transaction List Card: `#sort-control` (4 opsi radio/select), container `#transaction-list`, pesan kosong `#empty-msg`
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.6, 8.7_
  - [x] 4.5 Buat Pie Chart Card: elemen `<canvas id="pie-chart">`, `#chart-legend`, pesan kosong `#chart-empty-msg`
    - _Requirements: 5.2, 5.4_
  - [x] 4.6 Buat Monthly Summary Card: container `#monthly-summary`
    - _Requirements: 7.1, 7.2_
  - [x] 4.7 Buat Confirmation Dialog: `<dialog id="confirm-dialog">` dengan tombol `#btn-confirm-delete` dan `#btn-cancel-delete`, atribut `data-pending-id`
    - _Requirements: 3.1, 3.2, 3.4_
  - [x] 4.8 Buat elemen notifikasi error global `#global-error` di bagian atas halaman
    - _Requirements: 3.7, 6.5_

- [x] 5. Implementasi CSS lengkap di `css/style.css`
  - [x] 5.1 Definisikan CSS Custom Properties untuk light mode (`:root`) dan dark mode (`html.dark`), serta transisi tema `body { transition: ... 150ms ease }`
    - _Requirements: 9.2, 9.5, 9.6_
  - [x] 5.2 Implementasi layout dua kolom untuk desktop (≥768px) dan single-column untuk mobile (<768px) menggunakan CSS Grid atau Flexbox
    - _Requirements: 10.4_
  - [x] 5.3 Styling card, form, tombol, transaction list items, sort control (dengan indikator visual opsi aktif), dialog, dan pesan kosong
    - _Requirements: 8.7_
  - [x] 5.4 Styling pie chart card, legenda, dan monthly summary card
    - _Requirements: 5.2_
  - [x] 5.5 Styling header sticky, theme toggle button dengan ikon yang berubah sesuai tema
    - _Requirements: 9.1_
  - [x] 5.6 Pastikan tidak ada horizontal overflow pada viewport 320px–1920px; teks tidak terpotong
    - _Requirements: 10.4_

- [ ] 6. Implementasi fungsi render di `js/app.js`
  - [-] 6.1 Implementasi `renderSummaryPanel()` — hitung total dengan `calculateTotal()`, format dengan `formatRupiah()`, update `#total-display`
    - _Requirements: 4.1, 4.4, 4.5_
  - [-] 6.2 Implementasi `renderTransactionList()` — ambil sorted transactions dengan `sortTransactions(transactions, currentSort)`, render setiap item ke `#transaction-list` (nama, `formatRupiah(amount)`, kategori, tanggal), tampilkan/sembunyikan `#empty-msg`, tandai opsi sort aktif di `#sort-control`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 8.4, 8.6, 8.7_
  - [-] 6.3 Implementasi `renderPieChart()` — gunakan Canvas API untuk menggambar slice dengan `CATEGORY_COLORS`, render legenda di `#chart-legend` dengan persentase 1 desimal, tampilkan/sembunyikan `#chart-empty-msg`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  - [ ] 6.4 Implementasi `renderMonthlySummary()` — panggil `groupByMonth()`, render grup ke `#monthly-summary` dengan label bulan dan total `formatRupiah()`, sembunyikan jika kosong
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  - [ ] 6.5 Implementasi `renderAll()` — memanggil keempat fungsi render di atas secara berurutan
    - _Requirements: 2.2, 3.5, 4.2, 4.3, 5.3, 7.3, 8.4_

- [ ] 7. Implementasi event handlers di `js/app.js`
  - [ ] 7.1 Event handler tombol `#btn-add`: panggil `validateForm()`, tampilkan error per field jika tidak valid, panggil `addTransaction()` dan reset form jika valid
    - _Requirements: 1.4, 1.5, 1.6, 1.7, 1.8, 1.9_
  - [ ] 7.2 Event handler tombol hapus di setiap transaction item: simpan ID ke `pendingDeleteId`, tampilkan `#confirm-dialog`
    - _Requirements: 3.1, 3.2_
  - [ ] 7.3 Event handler `#btn-confirm-delete`: panggil `deleteTransaction(pendingDeleteId)`, tutup dialog, reset `pendingDeleteId`
    - _Requirements: 3.3, 3.5, 3.6_
  - [ ] 7.4 Event handler `#btn-cancel-delete`: tutup dialog tanpa perubahan, reset `pendingDeleteId`
    - _Requirements: 3.4_
  - [ ] 7.5 Event handler `#sort-control`: update `currentSort`, panggil `renderTransactionList()`
    - _Requirements: 8.4_
  - [ ] 7.6 Event handler `#theme-toggle`: implementasi `toggleTheme()` — toggle class `dark` pada `<html>`, simpan preferensi ke `"spendly_theme"` di localStorage, update ikon tombol
    - _Requirements: 9.2, 9.3_

- [ ] 8. Implementasi inisialisasi aplikasi dan theme management di `js/app.js`
  - [ ] 8.1 Implementasi `initTheme()` — baca `"spendly_theme"` dari localStorage; jika tidak ada, gunakan `prefers-color-scheme`; terapkan class `dark` sebelum render pertama untuk mencegah flash
    - _Requirements: 9.4, 9.5, 9.6_
  - [ ] 8.2 Implementasi fungsi `init()` — panggil `initTheme()`, muat data dari `loadFromStorage()` ke `transactions`, daftarkan semua event handler, panggil `renderAll()`
    - _Requirements: 6.3, 6.4, 6.5, 10.2_
  - [ ] 8.3 Hubungkan `init()` ke event `DOMContentLoaded` di bagian bawah `app.js`
    - _Requirements: 9.4, 10.2_

- [ ] 9. Verifikasi akhir — Pastikan aplikasi berfungsi dengan benar di browser
  - Buka `index.html` di browser dan lakukan manual testing untuk semua fitur utama
  - Verifikasi tidak ada error JavaScript di browser console
  - Tanyakan kepada pengguna jika ada pertanyaan sebelum menyelesaikan implementasi

---

## Notes

- Task bertanda `*` bersifat opsional
- Setiap task merujuk ke requirement spesifik untuk keterlacakan (traceability)
- Seluruh kode harus masuk ke tepat **satu file CSS** (`css/style.css`) dan **satu file JavaScript** (`js/app.js`) sesuai requirement 10.5
- Pengujian dilakukan secara manual melalui browser — tidak diperlukan test runner atau library eksternal

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "2.4", "2.6", "2.8", "2.10", "2.12"] },
    { "id": 1, "tasks": ["3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "3.5", "3.7"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6", "4.7", "4.8"] },
    { "id": 4, "tasks": ["5.1", "5.2", "5.3", "5.4", "5.5", "5.6", "6.1", "6.2", "6.3", "6.4"] },
    { "id": 5, "tasks": ["6.5"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6"] },
    { "id": 7, "tasks": ["8.1", "8.2"] },
    { "id": 8, "tasks": ["9.1", "9.2"] }
  ]
}
```
