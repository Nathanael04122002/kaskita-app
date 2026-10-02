# KasKita - Organization & Cash Management

Aplikasi web manajemen uang kas dan organisasi lengkap (Frontend & Backend) dengan antarmuka modern yang dibuat persis sesuai referensi desain **KasKita** (*Komunitas Toba*).

---

## 🌟 Fitur Utama Sesuai Referensi Desain

1. **Overview (Dashboard Utama)**:
   - **4 Stat Cards Utama**:
     - *Current Balance*: **Rp 8.750.000** (`+8.4% this month`)
     - *Total Income*: **Rp 15.000.000** (`32 transactions`)
     - *Total Expenses*: **Rp 6.250.000** (`18 transactions`)
     - *Members*: **42** (`35 active this week`)
   - **Cash Flow Chart (Last 6 Weeks)**:
     - Grafik batang ganda interaktif (*Dual-bar chart*): Biru (*Income*) & Merah (*Expense*) untuk W1 s.d. W6.
     - Toggle Mingguan (*Weekly*) & Bulanan (*Monthly*) dengan tooltip interaktif.
   - **Next Meeting Card**:
     - Badge *In 6 days*
     - Judul: **Weekly Community Gathering**
     - Tanggal & Waktu: **Sunday, 18 October 2026 · 19:00 WIB**
     - Lokasi: **📍 Rumah Budi**
     - Target Iuran: **Rp 25.000 / member**
     - Status Kehadiran: **35 / 42 present**
     - Progress bar: **83% attendance**
     - Tombol interaktif **View meeting** untuk membuka lembar absensi dan verifikasi iuran.
   - **Recent Transactions**:
     - Daftar 5 transaksi terbaru sesuai referensi:
       - `11 Oct` · **Weekly dues** · Income · `+ Rp 800.000`
       - `11 Oct` · **Meeting catering** · Expense · `- Rp 350.000`
       - `04 Oct` · **Weekly dues** · Income · `+ Rp 900.000`
       - `04 Oct` · **Venue rental** · Expense · `- Rp 500.000`
       - `28 Sep` · **Equipment** · Expense · `- Rp 150.000`
     - Tombol cepat **Catat Kas** (+ Modal input transaksi baru).

2. **Meetings (Jadwal Pertemuan)**:
   - Kalender & daftar seluruh pertemuan (Akan Datang & Selesai).
   - Modal penjadwalan pertemuan baru.
   - Modal detail absensi per anggota (Hadir, Izin, Sakit, Alpa) dan status pelunasan iuran.
   - Tombol instan *Tandai Hadir Semua*.

3. **Attendance (Presensi Komunitas)**:
   - Matriks persentase kehadiran anggota komunitas (rata-rata 83.4%).
   - Pembagian status kehadiran per pertemuan.

4. **Finance (Buku Kas & Arus Kas Lengkap)**:
   - Buku besar kas mencakup seluruh 50 transaksi (32 kas masuk & 18 kas keluar).
   - Filter transaksi berdasarkan tipe (*Kas Masuk*, *Kas Keluar*), kategori (*Iuran*, *Donasi*, *Konsumsi*, *Sewa*, dll.), dan pencarian teks.
   - Ekspor laporan transaksi ke format **CSV**.
   - Input transaksi baru dengan pilihan metode pembayaran (Tunai, Transfer Bank BCA, Mandiri, QRIS, E-Wallet).

5. **Members (Direktori 42 Anggota)**:
   - Daftar lengkap 42 anggota Komunitas Toba dengan inisial avatar berwarna.
   - Peran kepengurusan: Ketua, Wakil Ketua, Bendahara, Sekretaris, Koordinator Acara, Anggota.
   - Filter status *Aktif* (35 anggota) dan *Non-Aktif* (7 anggota).
   - Tombol cepat **Bayar Kas** per anggota yang langsung mencatat transaksi ke buku kas.

6. **Agenda (Program Kerja)**:
   - Papan Kanban program kerja (*To Do*, *In Progress*, *Completed*).
   - Status prioritas (*High*, *Medium*, *Low*), target tanggal penyelesaian, dan penanggung jawab (*PIC*).

7. **Documentation (Dokumentasi & Bukti Kas)**:
   - Galeri foto kegiatan rapat dan bukti struk pembayaran kas (kuitansi catering, nota kuitansi sewa aula, nota perlengkapan).
   - Modal pratinjau gambar bukti transaksi (*lightbox zoom*).
   - Form upload bukti dokumentasi baru.

8. **Reports (Laporan Pertanggungjawaban Resmi)**:
   - Format cetak resmi Laporan Keuangan Kas Komunitas Toba.
   - Rincian pemasukan dan pengeluaran per kategori.
   - Format ramah cetak (*Print / Save as PDF*) lengkap dengan kolom tanda tangan resmi Ketua (*Budi Santoso*) dan Bendahara Umum (*Natanael Christianto*).

9. **Settings & Profile**:
   - Pengaturan nama organisasi, tagline, tarif iuran kas mingguan.
   - Toggle **Dark Mode** & **Light Mode**.
   - Profil pengguna: **Natanael Christianto** (`NC`) - Bendahara.
   - Tombol **Reset Data ke Default Desain** untuk mengembalikan database ke angka persis screenshot referensi kapan saja.

---

## 🛠️ Arsitektur Teknologi

- **Backend**:
  - Runtime: **Node.js** (ES Modules)
  - Framework: **Express.js**
  - Database: **SQLite** (via `better-sqlite3`, WAL mode, persistensi otomatis)
  - Penyimpanan file: **Multer** untuk upload nota / foto bukti kas
- **Frontend**:
  - Library: **React 19** + **Vite**
  - Styling: **Tailwind CSS v4**
  - Icons: **Lucide React**
  - Typography: **Plus Jakarta Sans** (Google Fonts)

---

## 🚀 Cara Menjalankan Aplikasi

Server backend saat ini sudah aktif berjalan di latar belakang pada port **5000**.

### 1. Menjalankan Server Utama (Frontend + Backend Terintegrasi):
```bash
# Dari folder utama:
npm start
```
Buka browser di: **http://localhost:5000**

### 2. Menjalankan Mode Pengembangan (Hot-Reloading):
Terminal 1 (Backend Express):
```bash
npm run dev:server
# Berjalan di http://localhost:5000
```

Terminal 2 (Frontend Vite):
```bash
npm run dev:client
# Berjalan di http://localhost:3000 (proxy otomatis ke port 5000)
```

---

## 🗄️ Struktur Database SQLite

Database disimpan di file `server/kaskita.db` dengan tabel-tabel berikut:
- `settings`: Data organisasi, profil bendahara, tarif iuran.
- `members`: 42 anggota Komunitas Toba beserta riwayat iuran & status.
- `transactions`: 50 transaksi kas (total masuk Rp 15.000.000, total keluar Rp 6.250.000, saldo Rp 8.750.000).
- `meetings`: Jadwal rapat mingguan dan koordinasi.
- `meeting_attendance`: Presensi per pertemuan per anggota.
- `agendas`: Daftar program kerja dan status tugas.
- `documentations`: Galeri foto kegiatan dan bukti nota pembayaran.
