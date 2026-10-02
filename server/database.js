import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL);
const dbPath = isVercel ? '/tmp/kaskita.db' : path.join(__dirname, 'kaskita.db');

const db = new Database(dbPath);

// Enable foreign keys and WAL mode for high performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      org_name TEXT NOT NULL DEFAULT 'Komunitas Toba',
      org_tagline TEXT DEFAULT 'Organization Management',
      weekly_dues INTEGER DEFAULT 25000,
      currency TEXT DEFAULT 'Rp',
      user_name TEXT DEFAULT 'Natanael Christianto',
      user_initials TEXT DEFAULT 'NC',
      user_role TEXT DEFAULT 'Bendahara Umum',
      user_email TEXT DEFAULT 'natanael@kaskita.id',
      user_phone TEXT DEFAULT '+62 812-8899-7711',
      theme TEXT DEFAULT 'light'
    );
  `);

  // Members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Anggota',
      phone TEXT,
      email TEXT,
      address TEXT,
      notes TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      joined_date TEXT,
      dues_paid INTEGER DEFAULT 0,
      dues_unpaid INTEGER DEFAULT 0,
      avatar_color TEXT
    );
  `);

  // Ensure columns exist if table was already created
  try { db.prepare('ALTER TABLE members ADD COLUMN address TEXT').run(); } catch (e) {}
  try { db.prepare('ALTER TABLE members ADD COLUMN notes TEXT').run(); } catch (e) {}


  // Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      type TEXT NOT NULL, -- 'Income' or 'Expense'
      amount INTEGER NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      category TEXT NOT NULL,
      member_id INTEGER,
      description TEXT,
      receipt_url TEXT,
      payment_method TEXT DEFAULT 'Cash',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
    );
  `);

  // Meetings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL, -- YYYY-MM-DD
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      dues_amount INTEGER DEFAULT 25000,
      status TEXT DEFAULT 'Upcoming', -- 'Upcoming' or 'Completed'
      notes TEXT,
      agenda_topics TEXT
    );
  `);

  // Meeting Attendance table
  db.exec(`
    CREATE TABLE IF NOT EXISTS meeting_attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      meeting_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      status TEXT DEFAULT 'Present', -- 'Present', 'Absent', 'Permission', 'Sick'
      dues_paid INTEGER DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
      FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
      UNIQUE(meeting_id, member_id)
    );
  `);

  // Agenda table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agendas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      target_date TEXT,
      priority TEXT DEFAULT 'Medium', -- 'High', 'Medium', 'Low'
      status TEXT DEFAULT 'In Progress', -- 'To Do', 'In Progress', 'Completed'
      assigned_to TEXT,
      description TEXT
    );
  `);

  // Documentations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documentations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL, -- 'Foto Kegiatan', 'Nota & Kuitansi', 'Dokumen'
      date TEXT NOT NULL,
      file_url TEXT,
      description TEXT
    );
  `);

  seedDefaultData();
}

function seedDefaultData() {
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM settings').get().count;
  if (settingsCount === 0) {
    db.prepare(`
      INSERT INTO settings (id, org_name, org_tagline, weekly_dues, currency, user_name, user_initials, user_role, user_email, user_phone)
      VALUES (1, 'Komunitas Toba', 'Organization Management', 25000, 'Rp', 'Natanael Christianto', 'NC', 'Bendahara', 'natanael@kaskita.id', '+62 812-8899-7711')
    `).run();
  }

  const memberCount = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
  if (memberCount === 0) {
    const avatarColors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
      '#ec4899', '#06b6d4', '#14b8a6', '#6366f1', '#84cc16'
    ];

    const initialMembers = [
      { name: 'Natanael Christianto', role: 'Bendahara', phone: '081288997711', status: 'Active' },
      { name: 'Budi Santoso', role: 'Ketua', phone: '081312345678', status: 'Active' },
      { name: 'Yohanes Nababan', role: 'Wakil Ketua', phone: '081298765432', status: 'Active' },
      { name: 'Maria Pasaribu', role: 'Sekretaris', phone: '081387654321', status: 'Active' },
      { name: 'Daniel Simanjuntak', role: 'Koordinator Acara', phone: '081277665544', status: 'Active' },
      { name: 'Ruth Silalahi', role: 'Koordinator Konsumsi', phone: '081344556677', status: 'Active' },
      { name: 'Andre Hutapea', role: 'Koordinator Humas', phone: '081211223344', status: 'Active' },
      { name: 'Kevin Panjaitan', role: 'Koordinator Perlengkapan', phone: '081399887766', status: 'Active' },
      { name: 'Jessica Siregar', role: 'Anggota', phone: '081255443322', status: 'Active' },
      { name: 'David Situmorang', role: 'Anggota', phone: '081366778899', status: 'Active' },
      { name: 'Grace Nainggolan', role: 'Anggota', phone: '081233445566', status: 'Active' },
      { name: 'Samuel Tambunan', role: 'Anggota', phone: '081377889900', status: 'Active' },
      { name: 'Rachel Sinaga', role: 'Anggota', phone: '081244332211', status: 'Active' },
      { name: 'Michael Manurung', role: 'Anggota', phone: '081355667788', status: 'Active' },
      { name: 'Clara Sitorus', role: 'Anggota', phone: '081266554433', status: 'Active' },
      { name: 'Jonathan Marpaung', role: 'Anggota', phone: '081388776655', status: 'Active' },
      { name: 'Sarah Gultom', role: 'Anggota', phone: '081277889911', status: 'Active' },
      { name: 'Albert Pardede', role: 'Anggota', phone: '081311224455', status: 'Active' },
      { name: 'Theresia Aritonang', role: 'Anggota', phone: '081222335566', status: 'Active' },
      { name: 'Gabriel Pangaribuan', role: 'Anggota', phone: '081333446677', status: 'Active' },
      { name: 'Debora Lubis', role: 'Anggota', phone: '081244557788', status: 'Active' },
      { name: 'Christian Tarigan', role: 'Anggota', phone: '081355668899', status: 'Active' },
      { name: 'Angelina Sembiring', role: 'Anggota', phone: '081266779900', status: 'Active' },
      { name: 'Timothy Bangun', role: 'Anggota', phone: '081377880011', status: 'Active' },
      { name: 'Priscilia Karo', role: 'Anggota', phone: '081288991122', status: 'Active' },
      { name: 'Joshua Purba', role: 'Anggota', phone: '081399002233', status: 'Active' },
      { name: 'Hanna Saragih', role: 'Anggota', phone: '081200113344', status: 'Active' },
      { name: 'Immanuel Damanik', role: 'Anggota', phone: '081311224455', status: 'Active' },
      { name: 'Rebecca Munthe', role: 'Anggota', phone: '081222335566', status: 'Active' },
      { name: 'Andreas Sinambela', role: 'Anggota', phone: '081333446677', status: 'Active' },
      { name: 'Stephanie Hutabarat', role: 'Anggota', phone: '081244557788', status: 'Active' },
      { name: 'Felix Sitompul', role: 'Anggota', phone: '081355668899', status: 'Active' },
      { name: 'Nathania Harianja', role: 'Anggota', phone: '081266779900', status: 'Active' },
      { name: 'Rio Siagian', role: 'Anggota', phone: '081377880011', status: 'Active' },
      { name: 'Vania Silaban', role: 'Anggota', phone: '081288991122', status: 'Active' },
      { name: 'Ezekiel Simatupang', role: 'Anggota', phone: '081399002233', status: 'Inactive' },
      { name: 'Novita Tampubolon', role: 'Anggota', phone: '081200113344', status: 'Inactive' },
      { name: 'Bram Hutagalung', role: 'Anggota', phone: '081311224455', status: 'Inactive' },
      { name: 'Gisella Panggabean', role: 'Anggota', phone: '081222335566', status: 'Inactive' },
      { name: 'Rudy Rajagukguk', role: 'Anggota', phone: '081333446677', status: 'Inactive' },
      { name: 'Lidya Simamora', role: 'Anggota', phone: '081244557788', status: 'Inactive' },
      { name: 'Hendrik Sinurat', role: 'Anggota', phone: '081355668899', status: 'Inactive' }
    ];

    const insertMember = db.prepare(`
      INSERT INTO members (name, role, phone, email, status, joined_date, dues_paid, dues_unpaid, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertManyMembers = db.transaction((members) => {
      members.forEach((m, idx) => {
        const email = `${m.name.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`;
        const joinedDate = '2026-01-15';
        const color = avatarColors[idx % avatarColors.length];
        const duesPaid = m.status === 'Active' ? 150000 : 75000;
        const duesUnpaid = m.status === 'Active' ? 0 : 50000;
        insertMember.run(m.name, m.role, m.phone, email, m.status, joinedDate, duesPaid, duesUnpaid, color);
      });
    });

    insertManyMembers(initialMembers);
  }

  // Transactions Seeding
  // Must match exactly: Total Income = 15.000.000 (32 tx), Total Expenses = 6.250.000 (18 tx), Current Balance = 8.750.000
  const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  if (txCount === 0) {
    const insertTx = db.prepare(`
      INSERT INTO transactions (title, type, amount, date, category, description, payment_method, receipt_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Let's seed 32 income transactions summing to 15,000,000
    // And 18 expense transactions summing to 6,250,000
    const incomeTransactions = [
      // 11 Oct (shown in screenshot: +800.000)
      { title: 'Weekly dues', amount: 800000, date: '2026-10-11', category: 'Iuran Mingguan', desc: 'Iuran mingguan 32 anggota hadir' },
      // 04 Oct (shown in screenshot: +900.000)
      { title: 'Weekly dues', amount: 900000, date: '2026-10-04', category: 'Iuran Mingguan', desc: 'Iuran mingguan 36 anggota hadir' },
      // Additional income transactions (prior to 28 Sep):
      { title: 'Weekly dues', amount: 850000, date: '2026-09-27', category: 'Iuran Mingguan', desc: 'Iuran mingguan minggu ke-4' },
      { title: 'Weekly dues', amount: 925000, date: '2026-09-20', category: 'Iuran Mingguan', desc: 'Iuran mingguan minggu ke-3' },
      { title: 'Weekly dues', amount: 775000, date: '2026-09-13', category: 'Iuran Mingguan', desc: 'Iuran mingguan minggu ke-2' },
      { title: 'Weekly dues', amount: 800000, date: '2026-09-06', category: 'Iuran Mingguan', desc: 'Iuran mingguan minggu ke-1' },
      { title: 'Donation - Bpk. Hendra', amount: 1500000, date: '2026-09-27', category: 'Donasi', desc: 'Donasi sukarela untuk kas sosial' },
      { title: 'Donation - Alumni Toba', amount: 2000000, date: '2026-09-25', category: 'Donasi', desc: 'Dukungan kegiatan akhir tahun' },
      { title: 'Kas Awal Periode', amount: 2500000, date: '2026-09-01', category: 'Kas Awal', desc: 'Saldo kas pembukaan September' },
      { title: 'Penjualan Kaos Komunitas', amount: 650000, date: '2026-09-26', category: 'Merchandise', desc: 'Hasil penjualan 13 pcs kaos' },
      { title: 'Sponsorship Acara', amount: 1000000, date: '2026-09-22', category: 'Sponsorship', desc: 'Sponsor Warung Kopi Kita' },
      { title: 'Iuran Anggota Susulan', amount: 100000, date: '2026-09-26', category: 'Iuran Mingguan', desc: 'Pelunasan tunggakan 4 minggu' },
      { title: 'Iuran Anggota Susulan', amount: 75000, date: '2026-09-24', category: 'Iuran Mingguan', desc: 'Pelunasan tunggakan 3 minggu' },
      { title: 'Donasi Bunga Kasih', amount: 250000, date: '2026-09-23', category: 'Donasi', desc: 'Donasi sukarela' },
      { title: 'Weekly dues', amount: 200000, date: '2026-09-21', category: 'Iuran Mingguan', desc: 'Iuran via Transfer Bank' },
      { title: 'Iuran Anggota Susulan', amount: 125000, date: '2026-09-20', category: 'Iuran Mingguan', desc: 'Pelunasan iuran 5 minggu' },
      { title: 'Hasil Lelang Barang', amount: 350000, date: '2026-09-19', category: 'Lain-lain', desc: 'Lelang buku & merchandise' },
      { title: 'Donasi Anggota Baru', amount: 150000, date: '2026-09-18', category: 'Donasi', desc: 'Donasi penyambutan' },
      { title: 'Iuran Anggota Susulan', amount: 50000, date: '2026-09-17', category: 'Iuran Mingguan', desc: 'Iuran 2 minggu' },
      { title: 'Iuran Anggota Susulan', amount: 50000, date: '2026-09-16', category: 'Iuran Mingguan', desc: 'Iuran 2 minggu' },
      { title: 'Donasi Spontan', amount: 200000, date: '2026-09-15', category: 'Donasi', desc: 'Sumbangan snack box' },
      { title: 'Iuran Anggota Susulan', amount: 50000, date: '2026-09-14', category: 'Iuran Mingguan', desc: 'Iuran 2 minggu' },
      { title: 'Donasi Kas Peduli', amount: 300000, date: '2026-09-13', category: 'Donasi', desc: 'Bantuan sosial kas internal' },
      { title: 'Iuran Anggota Susulan', amount: 50000, date: '2026-09-12', category: 'Iuran Mingguan', desc: 'Iuran 2 minggu' },
      { title: 'Iuran Anggota Susulan', amount: 50000, date: '2026-09-11', category: 'Iuran Mingguan', desc: 'Iuran 2 minggu' },
      { title: 'Iuran Anggota Susulan', amount: 50000, date: '2026-09-10', category: 'Iuran Mingguan', desc: 'Iuran 2 minggu' },
      { title: 'Iuran Anggota Susulan', amount: 50000, date: '2026-09-09', category: 'Iuran Mingguan', desc: 'Iuran 2 minggu' },
      { title: 'Donasi Spontan', amount: 200000, date: '2026-09-08', category: 'Donasi', desc: 'Donasi kebersamaan' },
      { title: 'Iuran Anggota Susulan', amount: 75000, date: '2026-09-07', category: 'Iuran Mingguan', desc: 'Iuran 3 minggu' },
      { title: 'Iuran Anggota Susulan', amount: 50000, date: '2026-09-05', category: 'Iuran Mingguan', desc: 'Iuran 2 minggu' },
      { title: 'Iuran Anggota Susulan', amount: 50000, date: '2026-09-04', category: 'Iuran Mingguan', desc: 'Iuran 2 minggu' },
      { title: 'Bunga Rekening Bank', amount: 10000, date: '2026-09-02', category: 'Lain-lain', desc: 'Bunga tabungan operasional' }
    ];

    let sumIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
    const diffIncome = 15000000 - sumIncome;
    incomeTransactions[incomeTransactions.length - 1].amount += diffIncome;

    // 18 expense transactions summing to 6,250,000
    const expenseTransactions = [
      // 11 Oct (shown in screenshot: -350.000)
      { title: 'Meeting catering', amount: 350000, date: '2026-10-11', category: 'Konsumsi', desc: 'Konsumsi snack dan kopi rapat mingguan' },
      // 04 Oct (shown in screenshot: -500.000)
      { title: 'Venue rental', amount: 500000, date: '2026-10-04', category: 'Sewa Tempat', desc: 'Sewa aula pertemuan warga' },
      // 28 Sep (shown in screenshot: -150.000)
      { title: 'Equipment', amount: 150000, date: '2026-09-28', category: 'Perlengkapan', desc: 'Pembelian kabel roll & extension mic' },
      // Additional expense transactions (prior to 28 Sep):
      { title: 'Meeting catering', amount: 320000, date: '2026-09-27', category: 'Konsumsi', desc: 'Snack box pertemuan rutin' },
      { title: 'Venue rental', amount: 500000, date: '2026-09-20', category: 'Sewa Tempat', desc: 'Sewa ruangan pertemuan' },
      { title: 'Cetak Banner & Brosur', amount: 280000, date: '2026-09-24', category: 'Percetakan', desc: 'Cetak banner selamat datang' },
      { title: 'Sound System Rental', amount: 450000, date: '2026-09-22', category: 'Perlengkapan', desc: 'Sewa speaker aktif portable' },
      { title: 'Meeting catering', amount: 300000, date: '2026-09-13', category: 'Konsumsi', desc: 'Konsumsi mingguan' },
      { title: 'Venue rental', amount: 500000, date: '2026-09-06', category: 'Sewa Tempat', desc: 'Sewa ruang serbaguna' },
      { title: 'ATK & Buku Catatan', amount: 120000, date: '2026-09-08', category: 'Operasional', desc: 'Spidol, whiteboard marker, binder kas' },
      { title: 'Biaya Kebersihan Aula', amount: 100000, date: '2026-09-25', category: 'Operasional', desc: 'Tips petugas kebersihan gedung' },
      { title: 'Air Mineral Galon & Cup', amount: 80000, date: '2026-09-23', category: 'Konsumsi', desc: '4 galon air minum & cup' },
      { title: 'Fotokopi Agenda & Tatib', amount: 65000, date: '2026-09-21', category: 'Percetakan', desc: 'Fotokopi 45 rangkap draft program' },
      { title: 'Bingkisan Anggota Sakit', amount: 300000, date: '2026-09-19', category: 'Sosial', desc: 'Buah tangan menjenguk anggota sakit' },
      { title: 'Biaya Admin Rekening', amount: 15000, date: '2026-09-18', category: 'Administrasi', desc: 'Potongan bulanan bank' },
      { title: 'Sewa Proyektor & Screen', amount: 350000, date: '2026-09-15', category: 'Perlengkapan', desc: 'Presentasi program kerja' },
      { title: 'Snack Penyambutan', amount: 200000, date: '2026-09-05', category: 'Konsumsi', desc: 'Kue basah & teh manis' },
      { title: 'Transportasi Logistik', amount: 150000, date: '2026-09-03', category: 'Operasional', desc: 'Bensin antar jemput perlengkapan' }
    ];

    let sumExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
    const diffExpense = 6250000 - sumExpense;
    expenseTransactions[expenseTransactions.length - 1].amount += diffExpense;

    const insertAll = db.transaction(() => {
      incomeTransactions.forEach(t => {
        insertTx.run(t.title, 'Income', t.amount, t.date, t.category, t.desc, 'Cash', null);
      });
      expenseTransactions.forEach(t => {
        insertTx.run(t.title, 'Expense', t.amount, t.date, t.category, t.desc, 'Cash', null);
      });
    });

    insertAll();
  }

  // Meetings Seeding
  const meetingCount = db.prepare('SELECT COUNT(*) as count FROM meetings').get().count;
  if (meetingCount === 0) {
    const insertMeeting = db.prepare(`
      INSERT INTO meetings (title, date, time, location, dues_amount, status, notes, agenda_topics)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Next Meeting from design:
    // "Weekly Community Gathering", "Sunday, 18 October 2026 · 19:00 WIB", "Rumah Budi", "Rp 25.000 / member", "35 / 42 present", "83% attendance"
    const nextMeeting = insertMeeting.run(
      'Weekly Community Gathering',
      '2026-10-18',
      '19:00 WIB',
      'Rumah Budi',
      25000,
      'Upcoming',
      'Pertemuan rutin komunitas untuk update kas dan diskusi bakti sosial.',
      '1. Pembacaan Kas Mingguan\n2. Persiapan Bakti Sosial Toba Peduli\n3. Usulan Program Akhir Tahun'
    );

    const pastMeeting1 = insertMeeting.run(
      'Weekly Community Gathering',
      '2026-10-11',
      '19:00 WIB',
      'Aula Serbaguna Lt. 2',
      25000,
      'Completed',
      'Evaluasi iuran kas bulan September dan persiapan kegiatan Oktober.',
      '1. Laporan Kas Mingguan\n2. Evaluasi Anggaran'
    );

    const pastMeeting2 = insertMeeting.run(
      'Monthly Coordination Meeting',
      '2026-10-04',
      '18:30 WIB',
      'Rumah Ketua Budi',
      25000,
      'Completed',
      'Rapat koordinasi bulanan pengurus.',
      '1. Target Iuran Kas\n2. Rekonsiliasi Bank'
    );

    // Seed Attendance for Next Meeting (35 present out of 42 members)
    const members = db.prepare('SELECT id FROM members ORDER BY id ASC').all();
    const insertAttendance = db.prepare(`
      INSERT OR REPLACE INTO meeting_attendance (meeting_id, member_id, status, dues_paid, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertAttendances = db.transaction(() => {
      members.forEach((m, idx) => {
        // First 35 members present, rest 7 absent (to match 35/42 present, 83% attendance!)
        const isPresent = idx < 35;
        insertAttendance.run(
          nextMeeting.lastInsertRowid,
          m.id,
          isPresent ? 'Present' : 'Absent',
          isPresent ? 1 : 0,
          isPresent ? 'Hadir & Lunas Iuran' : 'Belum konfirmasi'
        );

        // Also seed attendance for past meetings
        insertAttendance.run(
          pastMeeting1.lastInsertRowid,
          m.id,
          idx < 32 ? 'Present' : 'Absent',
          idx < 32 ? 1 : 0,
          idx < 32 ? 'Hadir' : 'Izin'
        );
      });
    });

    insertAttendances();
  }

  // Agendas Seeding
  const agendaCount = db.prepare('SELECT COUNT(*) as count FROM agendas').get().count;
  if (agendaCount === 0) {
    const insertAgenda = db.prepare(`
      INSERT INTO agendas (title, target_date, priority, status, assigned_to, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertAgenda.run('Laporan Kas Bulanan Q3 2026', '2026-10-15', 'High', 'In Progress', 'Natanael Christianto', 'Rekonsiliasi transaksi kas dan print laporan fisik untuk ditandatangani');
    insertAgenda.run('Bakti Sosial Toba Peduli', '2026-10-25', 'High', 'To Do', 'Daniel Simanjuntak', 'Penggalangan dana tambahan dan distribusi sembako ke panti asuhan');
    insertAgenda.run('Pemesanan Rompi & Pin Komunitas', '2026-10-30', 'Medium', 'In Progress', 'Kevin Panjaitan', 'Vendor sablon sudah kirim sampel, tunggu approval ukuran dari anggota');
    insertAgenda.run('Peremajaan Sound System & Mic Kas', '2026-11-05', 'Low', 'To Do', 'Kevin Panjaitan', 'Riset harga 2 unit wireless microphone untuk rapat mingguan');
    insertAgenda.run('Penyusunan Anggaran Natal & Tahun Baru', '2026-11-15', 'High', 'To Do', 'Natanael & Budi', 'Draft estimasi konsumsi, tempat, dan cinderamata');
  }

  // Documentations Seeding
  const docCount = db.prepare('SELECT COUNT(*) as count FROM documentations').get().count;
  if (docCount === 0) {
    const insertDoc = db.prepare(`
      INSERT INTO documentations (title, category, date, file_url, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertDoc.run('Bukti Kuitansi Catering Rapat 11 Okt', 'Nota & Kuitansi', '2026-10-11', 'https://images.unsplash.com/photo-1554415707-9e49667ff43a?auto=format&fit=crop&w=600&q=80', 'Struk resmi pembelian snack box & kopi sebesar Rp 350.000');
    insertDoc.run('Kuitansi Pembayaran Sewa Aula 04 Okt', 'Nota & Kuitansi', '2026-10-04', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80', 'Bukti bayar lunas sewa aula serbaguna Rp 500.000');
    insertDoc.run('Nota Pembelian Kabel Roll & Extension', 'Nota & Kuitansi', '2026-09-28', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80', 'Struk toko elektronik kabel 15 meter Rp 150.000');
    insertDoc.run('Foto Rapat Mingguan Komunitas Toba', 'Foto Kegiatan', '2026-10-11', 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80', 'Dokumentasi suasana rapat evaluasi keuangan dan anggota di aula');
    insertDoc.run('Foto Gathering & Diskusi Santai', 'Foto Kegiatan', '2026-10-04', 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80', 'Sesi foto bersama seluruh anggota setelah penyerahan iuran kas');
  }
}

export default db;
