# Requirements Document

## Introduction

Spendly – Expense & Budget Visualizer adalah sebuah web app sederhana yang membantu pengguna mencatat pengeluaran sehari-hari dan memvisualisasikannya dalam bentuk daftar transaksi dan pie chart berdasarkan kategori. Aplikasi ini berjalan sepenuhnya di sisi client menggunakan HTML, CSS, dan Vanilla JavaScript tanpa backend server, dengan data tersimpan di browser melalui Local Storage API.

Aplikasi ini dirancang dengan tampilan clean, modern, dan mobile-friendly menggunakan card layout, visual hierarchy yang jelas, serta mendukung dark/light mode toggle.

---

## Glossary

- **App**: Aplikasi web Spendly – Expense & Budget Visualizer yang berjalan di browser.
- **Transaction**: Satu entri pengeluaran yang terdiri dari nama pengeluaran, nominal, dan kategori.
- **Transaction_Form**: Komponen form yang menyediakan input untuk menambahkan Transaction baru.
- **Transaction_List**: Komponen yang menampilkan daftar semua Transaction yang telah ditambahkan.
- **Category**: Klasifikasi pengeluaran (contoh: Makanan, Transportasi, Hiburan, Kesehatan, Lainnya).
- **Pie_Chart**: Visualisasi grafik lingkaran yang menampilkan distribusi pengeluaran per Category.
- **Summary_Panel**: Komponen yang menampilkan total pengeluaran dan ringkasan keuangan.
- **Monthly_Summary**: Ringkasan pengeluaran yang dikelompokkan berdasarkan bulan.
- **Storage**: Browser Local Storage API yang digunakan untuk menyimpan data Transaction.
- **Theme_Toggle**: Kontrol untuk beralih antara mode terang (light) dan mode gelap (dark).
- **Sort_Control**: Kontrol yang mengatur urutan tampilan Transaction pada Transaction_List.

---

## Requirements

### Requirement 1: Menambahkan Transaksi Pengeluaran

**User Story:** Sebagai pengguna, saya ingin mengisi form untuk mencatat pengeluaran saya, agar saya dapat melacak setiap pengeluaran sehari-hari.

#### Acceptance Criteria

1. THE Transaction_Form SHALL menyediakan field input teks untuk nama pengeluaran dengan panjang maksimal 100 karakter.
2. THE Transaction_Form SHALL menyediakan field input angka untuk nominal pengeluaran dengan nilai minimum 0,01 dan nilai maksimum 999.999.999,99.
3. THE Transaction_Form SHALL menyediakan dropdown pilihan Category dengan tepat lima pilihan: Makanan, Transportasi, Hiburan, Kesehatan, dan Lainnya.
4. WHEN pengguna mengklik tombol tambah transaksi, THE Transaction_Form SHALL memvalidasi bahwa field nama pengeluaran tidak kosong, nominal pengeluaran bernilai antara 0,01 dan 999.999.999,99, dan salah satu Category telah dipilih sebelum memproses input.
5. WHEN semua field terisi valid dan pengguna mengklik tombol tambah, THE App SHALL membuat Transaction baru dengan nama, nominal, dan Category yang diisi dan menambahkannya ke Transaction_List.
6. WHEN Transaction baru berhasil ditambahkan ke Transaction_List, THE Transaction_Form SHALL mengosongkan field nama pengeluaran, field nominal pengeluaran, dan mengembalikan dropdown Category ke kondisi belum dipilih.
7. IF field nama pengeluaran kosong saat pengguna mengklik tombol tambah, THEN THE Transaction_Form SHALL menampilkan pesan kesalahan yang menjelaskan bahwa nama pengeluaran wajib diisi dan tidak menambahkan Transaction ke Transaction_List.
8. IF field nominal pengeluaran kosong, bernilai nol, negatif, atau melebihi 999.999.999,99 saat pengguna mengklik tombol tambah, THEN THE Transaction_Form SHALL menampilkan pesan kesalahan yang menjelaskan bahwa nominal harus berupa angka antara 0,01 dan 999.999.999,99 dan tidak menambahkan Transaction ke Transaction_List.
9. IF Category belum dipilih saat pengguna mengklik tombol tambah, THEN THE Transaction_Form SHALL menampilkan pesan kesalahan yang menjelaskan bahwa Category wajib dipilih dan tidak menambahkan Transaction ke Transaction_List.

---

### Requirement 2: Menampilkan Daftar Transaksi

**User Story:** Sebagai pengguna, saya ingin melihat semua transaksi yang sudah saya tambahkan dalam bentuk daftar, agar saya dapat meninjau riwayat pengeluaran saya.

#### Acceptance Criteria

1. THE Transaction_List SHALL menampilkan semua Transaction yang tersimpan, masing-masing mencakup nama pengeluaran, nominal, Category, dan tanggal transaksi.
2. WHEN Transaction baru ditambahkan, THE Transaction_List SHALL memperbarui tampilan untuk menyertakan Transaction tersebut di posisi paling atas daftar tanpa perlu me-refresh halaman.
3. WHILE Transaction_List tidak memiliki data, THE App SHALL menampilkan pesan kosong yang memberi tahu pengguna bahwa belum ada transaksi yang dicatat.
4. THE Transaction_List SHALL menampilkan nominal pengeluaran dalam format mata uang Rupiah dengan awalan "Rp", titik sebagai pemisah ribuan, dan tanpa angka desimal (contoh: Rp1.500.000).

---

### Requirement 3: Menghapus Transaksi

**User Story:** Sebagai pengguna, saya ingin dapat menghapus transaksi tertentu dari daftar, agar saya dapat mengoreksi entri yang salah.

#### Acceptance Criteria

1. THE Transaction_List SHALL menampilkan tombol hapus pada setiap item Transaction.
2. WHEN pengguna mengklik tombol hapus pada sebuah Transaction, THE App SHALL menampilkan dialog konfirmasi yang meminta pengguna memastikan tindakan penghapusan sebelum melanjutkan.
3. WHEN pengguna mengkonfirmasi penghapusan pada dialog konfirmasi, THE App SHALL menghapus Transaction tersebut dari Transaction_List.
4. IF pengguna membatalkan penghapusan pada dialog konfirmasi, THEN THE App SHALL menutup dialog dan tidak melakukan perubahan pada Transaction_List.
5. WHEN sebuah Transaction berhasil dihapus, THE Transaction_List SHALL memperbarui tampilan dalam waktu kurang dari 1 detik untuk mencerminkan penghapusan tersebut tanpa me-refresh halaman.
6. WHEN sebuah Transaction dihapus, THE Storage SHALL memperbarui data yang tersimpan sehingga Transaction yang dihapus tidak muncul kembali setelah halaman di-refresh.
7. IF operasi penyimpanan ke Storage gagal saat Transaction dihapus, THEN THE App SHALL menampilkan pesan kesalahan yang menginformasikan pengguna bahwa data tidak dapat disimpan.

---

### Requirement 4: Menampilkan Total Pengeluaran

**User Story:** Sebagai pengguna, saya ingin melihat total keseluruhan pengeluaran saya secara otomatis, agar saya dapat memantau total biaya yang sudah dikeluarkan.

#### Acceptance Criteria

1. THE Summary_Panel SHALL menampilkan total keseluruhan nominal dari semua Transaction yang ada, dengan nilai Rp0 ketika tidak ada Transaction.
2. WHEN sebuah Transaction ditambahkan, THE Summary_Panel SHALL memperbarui total pengeluaran dalam waktu kurang dari 1 detik dengan menjumlahkan nominal Transaction baru ke total sebelumnya.
3. WHEN sebuah Transaction dihapus, THE Summary_Panel SHALL memperbarui total pengeluaran dalam waktu kurang dari 1 detik dengan mengurangi nominal Transaction yang dihapus dari total sebelumnya.
4. THE Summary_Panel SHALL menampilkan total pengeluaran dalam format mata uang Rupiah dengan awalan "Rp", titik sebagai pemisah ribuan, dan tanpa angka desimal (contoh: Rp1.500.000).
5. WHEN total pengeluaran melebihi Rp999.999.999, THE Summary_Panel SHALL tetap menampilkan total secara penuh tanpa pemotongan atau overflow teks.

---

### Requirement 5: Visualisasi Pie Chart Berdasarkan Kategori

**User Story:** Sebagai pengguna, saya ingin melihat distribusi pengeluaran saya dalam bentuk pie chart per kategori, agar saya dapat memahami pola pengeluaran terbesar saya.

#### Acceptance Criteria

1. THE Pie_Chart SHALL menampilkan distribusi persentase pengeluaran berdasarkan Category dari semua Transaction yang ada, dihitung berdasarkan total nilai nominal pengeluaran per Category terhadap total keseluruhan pengeluaran, dengan nilai persentase dibulatkan ke satu angka desimal.
2. THE Pie_Chart SHALL menampilkan legenda yang mencantumkan nama Category dan nilai persentase masing-masing Category.
3. WHEN sebuah Transaction ditambahkan atau dihapus, THE Pie_Chart SHALL memperbarui visualisasi dalam waktu tidak lebih dari 1 detik tanpa memerlukan reload halaman untuk mencerminkan perubahan distribusi pengeluaran.
4. WHILE Transaction_List tidak memiliki data, THE App SHALL menampilkan pesan teks yang memberitahu pengguna bahwa belum ada data untuk divisualisasikan pada Pie_Chart.
5. THE Pie_Chart SHALL membedakan setiap Category dengan warna yang unik sehingga tidak ada dua slice yang bersebelahan memiliki warna yang sama.

---

### Requirement 6: Persistensi Data dengan Local Storage

**User Story:** Sebagai pengguna, saya ingin data pengeluaran saya tetap tersimpan meskipun browser di-refresh atau ditutup, agar saya tidak kehilangan riwayat pengeluaran yang sudah dicatat.

#### Acceptance Criteria

1. WHEN sebuah Transaction berhasil ditambahkan ke Transaction_List, THE Storage SHALL menyimpan seluruh Transaction_List yang sudah diperbarui (termasuk Transaction baru) ke Local Storage dalam format JSON.
2. WHEN sebuah Transaction berhasil dihapus dari Transaction_List, THE Storage SHALL menyimpan seluruh Transaction_List yang sudah diperbarui (tanpa Transaction yang dihapus) ke Local Storage dalam format JSON.
3. WHEN halaman App dimuat atau di-refresh, THE App SHALL membaca data Transaction dari Local Storage dan memuat seluruh Transaction yang tersimpan ke Transaction_List.
4. IF Local Storage tidak mengandung data Transaction saat halaman dimuat, THEN THE App SHALL menginisialisasi Transaction_List sebagai daftar kosong dan menampilkan tampilan pengeluaran tanpa entri apapun.
5. IF data yang tersimpan di Local Storage tidak dapat di-parse sebagai JSON yang valid saat halaman dimuat, THEN THE App SHALL menghapus data korup tersebut dari Local Storage, menginisialisasi Transaction_List sebagai daftar kosong, dan menampilkan pesan kesalahan yang mengindikasikan kegagalan memuat data tersimpan.
6. THE Storage SHALL menyimpan data Transaction dalam format JSON sedemikian rupa sehingga serialisasi ulang dari hasil parsing menghasilkan representasi yang identik untuk setiap field Transaction (id, amount, category, date, description).

---

### Requirement 7: Ringkasan Pengeluaran Bulanan

**User Story:** Sebagai pengguna, saya ingin melihat ringkasan pengeluaran yang dikelompokkan per bulan, agar saya dapat memantau tren pengeluaran dari waktu ke waktu.

#### Acceptance Criteria

1. THE Monthly_Summary SHALL mengelompokkan Transaction berdasarkan bulan dan tahun pencatatan dan menampilkan kelompok bulan dari yang terbaru hingga terlama.
2. THE Monthly_Summary SHALL menampilkan total pengeluaran untuk setiap kelompok bulan dalam format mata uang Rupiah dengan awalan "Rp", titik sebagai pemisah ribuan, dan tanpa angka desimal.
3. WHEN sebuah Transaction ditambahkan atau dihapus, THE Monthly_Summary SHALL memperbarui ringkasan bulan yang terdampak dalam waktu tidak lebih dari 2 detik.
4. WHILE tidak ada Transaction untuk bulan tertentu, THE App SHALL tidak menampilkan kelompok bulan tersebut pada Monthly_Summary.
5. WHEN Transaction baru ditambahkan, THE App SHALL mencatat timestamp tanggal dan waktu berdasarkan zona waktu lokal perangkat pengguna secara otomatis pada Transaction tersebut.

---

### Requirement 8: Pengurutan Daftar Transaksi

**User Story:** Sebagai pengguna, saya ingin dapat mengurutkan daftar transaksi berdasarkan nominal atau kategori, agar saya dapat menemukan dan menganalisis transaksi dengan lebih mudah.

#### Acceptance Criteria

1. THE Sort_Control SHALL menyediakan pilihan pengurutan berdasarkan nominal pengeluaran secara ascending (terkecil ke terbesar).
2. THE Sort_Control SHALL menyediakan pilihan pengurutan berdasarkan nominal pengeluaran secara descending (terbesar ke terkecil).
3. THE Sort_Control SHALL menyediakan pilihan pengurutan berdasarkan Category secara alphabetical dari A ke Z.
4. WHEN pengguna memilih opsi pengurutan pada Sort_Control, THE Transaction_List SHALL menampilkan ulang seluruh Transaction sesuai urutan yang dipilih dalam waktu tidak lebih dari 2 detik tanpa me-refresh halaman.
5. THE Sort_Control SHALL menyediakan pilihan untuk kembali ke urutan default berdasarkan waktu pencatatan (terbaru di atas).
6. WHILE Transaction_List tidak memiliki data, THE Sort_Control SHALL tetap menampilkan pilihan pengurutan dan THE Transaction_List SHALL menampilkan pesan informasi bahwa belum ada transaksi untuk diurutkan.
7. THE Sort_Control SHALL menampilkan indikator visual pada opsi pengurutan yang sedang aktif sehingga pengguna dapat mengidentifikasi urutan yang sedang diterapkan.

---

### Requirement 9: Dark/Light Mode Toggle

**User Story:** Sebagai pengguna, saya ingin dapat beralih antara mode terang dan mode gelap, agar saya dapat menggunakan aplikasi sesuai preferensi visual saya dan kondisi pencahayaan.

#### Acceptance Criteria

1. THE Theme_Toggle SHALL menampilkan kontrol yang dapat diklik untuk beralih antara light mode dan dark mode, dengan indikator visual yang menunjukkan tema yang sedang aktif.
2. WHEN pengguna mengklik Theme_Toggle, THE App SHALL mengubah tema tampilan seluruh antarmuka antara light mode dan dark mode dalam waktu tidak lebih dari 300ms.
3. WHEN pengguna mengklik Theme_Toggle, THE Storage SHALL menyimpan preferensi tema yang dipilih ke Local Storage.
4. WHEN halaman App dimuat atau di-refresh, THE App SHALL membaca preferensi tema dari Local Storage dan menerapkan tema tersebut sebelum halaman ditampilkan untuk mencegah flash tema yang salah.
5. IF Local Storage tidak mengandung preferensi tema saat halaman dimuat dan sistem operasi pengguna menerapkan dark mode melalui prefers-color-scheme, THEN THE App SHALL menerapkan dark mode sebagai tema default.
6. IF Local Storage tidak mengandung preferensi tema saat halaman dimuat dan sistem operasi pengguna tidak menerapkan dark mode, THEN THE App SHALL menerapkan light mode sebagai tema default.

---

### Requirement 10: Performa dan Kompatibilitas Browser

**User Story:** Sebagai pengguna, saya ingin aplikasi berjalan cepat dan responsif di browser modern yang saya gunakan, agar pengalaman menggunakan aplikasi tetap nyaman.

#### Acceptance Criteria

1. THE App SHALL berjalan tanpa error JavaScript pada browser Chrome versi 109 ke atas, Firefox versi 109 ke atas, Edge versi 109 ke atas, dan Safari versi 16 ke atas.
2. THE App SHALL memuat seluruh antarmuka dan data Transaction dari Local Storage dalam waktu kurang dari 2 detik, diukur dari saat halaman mulai dimuat hingga seluruh elemen antarmuka dan data Transaction tampil pada layar, tanpa ketergantungan jaringan eksternal.
3. WHEN pengguna menambahkan atau menghapus Transaction, THE App SHALL memperbarui Transaction_List, Summary_Panel, dan Pie_Chart dalam waktu kurang dari 100ms, diukur dari saat aksi pengguna selesai hingga tampilan selesai diperbarui di layar.
4. THE App SHALL menampilkan seluruh konten antarmuka tanpa overflow horizontal yang tidak dapat di-scroll dan teks tidak terpotong pada layar dengan lebar antara 320px hingga 1920px.
5. THE App SHALL menggunakan tepat satu file CSS di dalam folder `css/` dan tepat satu file JavaScript di dalam folder `js/`.
