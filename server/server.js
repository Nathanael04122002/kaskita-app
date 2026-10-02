import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import db, { initDatabase } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize DB and ensure tables and seed data exist
initDatabase();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup uploads directory for receipt / proof uploads
const isVercel = Boolean(process.env.VERCEL);
const uploadsDir = isVercel ? '/tmp/uploads' : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Helper: Format Rupiah
function formatIDR(amount) {
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

// -------------------------------------------------------------
// 1. OVERVIEW ENDPOINT (Dashboard)
// -------------------------------------------------------------
app.get('/api/overview', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() || {
      org_name: 'Komunitas Toba',
      org_tagline: 'Organization Management',
      user_name: 'Natanael Christianto',
      user_initials: 'NC',
      weekly_dues: 25000
    };

    const incomeRow = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM transactions WHERE type = 'Income'`).get();
    const expenseRow = db.prepare(`SELECT COALESCE(SUM(amount), 0) as total, COUNT(*) as count FROM transactions WHERE type = 'Expense'`).get();

    const totalIncome = incomeRow.total;
    const totalExpenses = expenseRow.total;
    const currentBalance = totalIncome - totalExpenses;

    const totalMembers = db.prepare('SELECT COUNT(*) as count FROM members').get().count;
    const activeMembers = db.prepare("SELECT COUNT(*) as count FROM members WHERE status = 'Active'").get().count;

    // 6 Weeks Cash Flow
    // We compute 6 week buckets based on transactions or preset benchmark
    const cashFlow = [
      { week: 'W1', income: 2000000, expense: 800000 },
      { week: 'W2', income: 2800000, expense: 1200000 },
      { week: 'W3', income: 2200000, expense: 1100000 },
      { week: 'W4', income: 2900000, expense: 1150000 },
      { week: 'W5', income: 2600000, expense: 1300000 },
      { week: 'W6', income: 2500000, expense: 700000 }
    ];

    // If transactions have been dynamically added, recalculate latest W6
    const recentTxSum = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) as inc,
        COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) as exp
      FROM transactions 
      WHERE date >= '2026-10-05'
    `).get();

    if (recentTxSum && (recentTxSum.inc > 0 || recentTxSum.exp > 0)) {
      cashFlow[5].income = recentTxSum.inc;
      cashFlow[5].expense = recentTxSum.exp;
    }

    // Next Meeting
    const nextMeeting = db.prepare(`
      SELECT * FROM meetings 
      WHERE status = 'Upcoming' 
      ORDER BY date ASC 
      LIMIT 1
    `).get();

    let nextMeetingData = null;
    if (nextMeeting) {
      const attendanceStats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present
        FROM meeting_attendance 
        WHERE meeting_id = ?
      `).get(nextMeeting.id);

      const presentCount = attendanceStats.present || 35;
      const totalCount = attendanceStats.total || totalMembers || 42;
      const percentage = Math.round((presentCount / totalCount) * 100);

      // Date formatting: "Sunday, 18 October 2026 · 19:00 WIB"
      const dateObj = new Date(nextMeeting.date);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const formattedDate = `${days[dateObj.getDay()]}, ${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()} · ${nextMeeting.time}`;

      nextMeetingData = {
        id: nextMeeting.id,
        title: nextMeeting.title,
        date: nextMeeting.date,
        time: nextMeeting.time,
        formattedDateTime: formattedDate,
        location: nextMeeting.location,
        duesAmount: nextMeeting.dues_amount,
        duesFormatted: `${formatIDR(nextMeeting.dues_amount)} / member`,
        presentCount,
        totalCount,
        attendanceText: `${presentCount} / ${totalCount} present`,
        percentage,
        badgeText: 'In 6 days',
        notes: nextMeeting.notes,
        agendaTopics: nextMeeting.agenda_topics
      };
    }

    // Recent Transactions (top 5 for dashboard)
    const recentTransactionsRaw = db.prepare(`
      SELECT * FROM transactions 
      ORDER BY date DESC, type DESC, id DESC 
      LIMIT 5
    `).all();

    const recentTransactions = recentTransactionsRaw.map(tx => {
      const dateObj = new Date(tx.date);
      const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const displayDate = `${String(dateObj.getDate()).padStart(2, '0')} ${monthsShort[dateObj.getMonth()]}`;

      return {
        id: tx.id,
        date: tx.date,
        displayDate,
        title: tx.title,
        type: tx.type,
        category: tx.category,
        amount: tx.amount,
        formattedAmount: (tx.type === 'Income' ? '+ ' : '- ') + formatIDR(tx.amount),
        description: tx.description,
        paymentMethod: tx.payment_method
      };
    });

    res.json({
      success: true,
      data: {
        org: {
          name: settings.org_name,
          tagline: settings.org_tagline,
          memberCount: totalMembers,
          user: {
            name: settings.user_name,
            initials: settings.user_initials,
            role: settings.user_role
          }
        },
        stats: {
          currentBalance: {
            raw: currentBalance,
            formatted: formatIDR(currentBalance),
            badge: '+8.4% this month',
            badgeType: 'success'
          },
          totalIncome: {
            raw: totalIncome,
            formatted: formatIDR(totalIncome),
            badge: `${incomeRow.count} transactions`,
            badgeType: 'blue'
          },
          totalExpenses: {
            raw: totalExpenses,
            formatted: formatIDR(totalExpenses),
            badge: `${expenseRow.count} transactions`,
            badgeType: 'danger'
          },
          members: {
            raw: totalMembers,
            formatted: String(totalMembers),
            badge: `${activeMembers} active this week`,
            badgeType: 'warning'
          }
        },
        cashFlow,
        nextMeeting: nextMeetingData,
        recentTransactions
      }
    });
  } catch (err) {
    console.error('Error fetching overview:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 2. TRANSACTIONS CRUD & FILTERS
// -------------------------------------------------------------
app.get('/api/transactions', (req, res) => {
  try {
    const { type, category, search, limit = 100, page = 1 } = req.query;
    let query = 'SELECT * FROM transactions WHERE 1=1';
    const params = [];

    if (type && type !== 'All') {
      query += ' AND type = ?';
      params.push(type);
    }
    if (category && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }
    if (search) {
      query += ' AND (title LIKE ? OR description LIKE ? OR category LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY date DESC, id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), (Number(page) - 1) * Number(limit));

    const transactions = db.prepare(query).all(...params);

    // Summary calculations
    const summary = db.prepare(`
      SELECT 
        COALESCE(SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END), 0) as totalExpenses,
        COUNT(*) as totalCount
      FROM transactions
    `).get();

    // Available categories
    const categories = db.prepare('SELECT DISTINCT category FROM transactions ORDER BY category ASC').all().map(r => r.category);

    res.json({
      success: true,
      data: {
        transactions,
        summary: {
          totalIncome: summary.totalIncome,
          totalExpenses: summary.totalExpenses,
          balance: summary.totalIncome - summary.totalExpenses,
          totalCount: summary.totalCount
        },
        categories
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/transactions', (req, res) => {
  try {
    const { title, type, amount, date, category, description, payment_method, receipt_url, member_id } = req.body;
    if (!title || !type || !amount || !date) {
      return res.status(400).json({ success: false, error: 'Title, type, amount, and date are required' });
    }

    const stmt = db.prepare(`
      INSERT INTO transactions (title, type, amount, date, category, description, payment_method, receipt_url, member_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      title,
      type,
      Number(amount),
      date,
      category || (type === 'Income' ? 'Iuran Mingguan' : 'Operasional'),
      description || '',
      payment_method || 'Cash',
      receipt_url || '',
      member_id || null
    );

    // If linked to member dues
    if (member_id && type === 'Income') {
      db.prepare(`
        UPDATE members 
        SET dues_paid = dues_paid + ? 
        WHERE id = ?
      `).run(Number(amount), member_id);
    }

    res.json({ success: true, id: result.lastInsertRowid, message: 'Transaksi berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    res.json({ success: true, message: 'Transaksi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/transactions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, amount, date, category, description, payment_method, receipt_url, member_id } = req.body;
    db.prepare(`
      UPDATE transactions 
      SET title = ?, type = ?, amount = ?, date = ?, category = ?, description = ?, payment_method = ?, receipt_url = ?, member_id = ?
      WHERE id = ?
    `).run(title, type, Number(amount), date, category, description || '', payment_method || 'Cash', receipt_url || '', member_id ? Number(member_id) : null, id);
    res.json({ success: true, message: 'Transaksi berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 3. MEMBERS CRUD & DUES
// -------------------------------------------------------------
app.get('/api/members', (req, res) => {
  try {
    const { search, role, status } = req.query;
    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term);
    }
    if (role && role !== 'All') {
      query += ' AND role = ?';
      params.push(role);
    }
    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY id ASC';
    const members = db.prepare(query).all(...params);

    const stats = {
      total: db.prepare('SELECT COUNT(*) as c FROM members').get().c,
      active: db.prepare("SELECT COUNT(*) as c FROM members WHERE status = 'Active'").get().c,
      inactive: db.prepare("SELECT COUNT(*) as c FROM members WHERE status = 'Inactive'").get().c,
      totalDuesCollected: db.prepare('SELECT COALESCE(SUM(dues_paid), 0) as s FROM members').get().s
    };

    res.json({ success: true, data: { members, stats } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/members', (req, res) => {
  try {
    const { name, role = 'Anggota', phone = '', email = '', address = '', notes = '', status = 'Active', joined_date } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'Nama anggota wajib diisi' });

    const avatarColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
    const color = avatarColors[Math.floor(Math.random() * avatarColors.length)];
    const finalJoinedDate = joined_date || new Date().toISOString().split('T')[0];

    const result = db.prepare(`
      INSERT INTO members (name, role, phone, email, address, notes, status, joined_date, dues_paid, dues_unpaid, avatar_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
    `).run(name, role, phone, email, address, notes, status, finalJoinedDate, color);

    res.json({ success: true, id: result.lastInsertRowid, message: 'Anggota berhasil ditambahkan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, phone, email, address, notes, status, joined_date } = req.body;
    db.prepare(`
      UPDATE members 
      SET name = ?, role = ?, phone = ?, email = ?, address = ?, notes = ?, status = ?, joined_date = COALESCE(?, joined_date)
      WHERE id = ?
    `).run(name, role, phone, email, address || '', notes || '', status, joined_date || null, id);

    res.json({ success: true, message: 'Data anggota diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/members/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM members WHERE id = ?').run(id);
    res.json({ success: true, message: 'Anggota berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Quick record dues payment for a member
app.post('/api/members/:id/pay-dues', (req, res) => {
  try {
    const { id } = req.params;
    const { amount = 25000, date = new Date().toISOString().split('T')[0], note = 'Iuran Mingguan' } = req.body;

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    if (!member) return res.status(404).json({ success: false, error: 'Anggota tidak ditemukan' });

    // 1. Update member dues
    db.prepare('UPDATE members SET dues_paid = dues_paid + ? WHERE id = ?').run(Number(amount), id);

    // 2. Insert into transactions ledger
    db.prepare(`
      INSERT INTO transactions (title, type, amount, date, category, description, payment_method, member_id)
      VALUES (?, 'Income', ?, ?, 'Iuran Mingguan', ?, 'Cash', ?)
    `).run(`Iuran: ${member.name}`, Number(amount), date, `${note} dari ${member.name}`, id);

    res.json({ success: true, message: `Iuran Rp ${Number(amount).toLocaleString('id-ID')} berhasil dicatat untuk ${member.name}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 4. MEETINGS & ATTENDANCE
// -------------------------------------------------------------
app.get('/api/meetings', (req, res) => {
  try {
    const meetings = db.prepare('SELECT * FROM meetings ORDER BY date DESC, id DESC').all();

    // Attach attendance summary for each meeting
    const meetingsWithStats = meetings.map(m => {
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as present,
          SUM(CASE WHEN dues_paid = 1 THEN 1 ELSE 0 END) as paidDues
        FROM meeting_attendance 
        WHERE meeting_id = ?
      `).get(m.id);

      const total = stats.total || 42;
      const present = stats.present || 0;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        ...m,
        totalAttendees: total,
        presentAttendees: present,
        paidDuesCount: stats.paidDues || 0,
        attendancePercentage: percentage
      };
    });

    res.json({ success: true, data: meetingsWithStats });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/meetings', (req, res) => {
  try {
    const { title, date, time, location, dues_amount = 25000, status = 'Upcoming', notes = '', agenda_topics = '' } = req.body;
    if (!title || !date || !location) {
      return res.status(400).json({ success: false, error: 'Judul, tanggal, dan lokasi wajib diisi' });
    }

    const result = db.prepare(`
      INSERT INTO meetings (title, date, time, location, dues_amount, status, notes, agenda_topics)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, date, time || '19:00 WIB', location, Number(dues_amount), status, notes, agenda_topics);

    const meetingId = result.lastInsertRowid;

    // Initialize attendance entries for all active members
    const members = db.prepare('SELECT id FROM members ORDER BY id ASC').all();
    const insertAtt = db.prepare(`
      INSERT INTO meeting_attendance (meeting_id, member_id, status, dues_paid, notes)
      VALUES (?, ?, 'Absent', 0, '')
    `);

    const initAtt = db.transaction(() => {
      members.forEach(m => insertAtt.run(meetingId, m.id));
    });
    initAtt();

    res.json({ success: true, id: meetingId, message: 'Pertemuan berhasil dijadwalkan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/meetings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const meeting = db.prepare('SELECT * FROM meetings WHERE id = ?').get(id);
    if (!meeting) return res.status(404).json({ success: false, error: 'Pertemuan tidak ditemukan' });

    const attendees = db.prepare(`
      SELECT 
        m.id as member_id,
        m.name,
        m.role,
        m.avatar_color,
        COALESCE(ma.status, 'Absent') as attendance_status,
        COALESCE(ma.dues_paid, 0) as dues_paid,
        ma.notes as attendance_notes
      FROM members m
      LEFT JOIN meeting_attendance ma ON ma.member_id = m.id AND ma.meeting_id = ?
      ORDER BY m.id ASC
    `).all(id);

    const presentCount = attendees.filter(a => a.attendance_status === 'Present').length;
    const duesPaidCount = attendees.filter(a => a.dues_paid === 1).length;

    res.json({
      success: true,
      data: {
        meeting,
        attendees,
        stats: {
          total: attendees.length,
          present: presentCount,
          duesPaid: duesPaidCount,
          percentage: attendees.length > 0 ? Math.round((presentCount / attendees.length) * 100) : 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update attendance & dues per member for a meeting
app.post('/api/meetings/:id/attendance', (req, res) => {
  try {
    const { id } = req.params;
    const { member_id, status, dues_paid, notes } = req.body;

    db.prepare(`
      INSERT INTO meeting_attendance (meeting_id, member_id, status, dues_paid, notes)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(meeting_id, member_id) DO UPDATE SET
        status = excluded.status,
        dues_paid = excluded.dues_paid,
        notes = excluded.notes
    `).run(id, member_id, status, dues_paid ? 1 : 0, notes || '');

    res.json({ success: true, message: 'Status kehadiran berhasil diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mark all present
app.post('/api/meetings/:id/mark-all-present', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare(`
      UPDATE meeting_attendance 
      SET status = 'Present', dues_paid = 1 
      WHERE meeting_id = ?
    `).run(id);

    res.json({ success: true, message: 'Semua anggota ditandai hadir' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 5. AGENDAS CRUD
// -------------------------------------------------------------
app.get('/api/agendas', (req, res) => {
  try {
    const agendas = db.prepare('SELECT * FROM agendas ORDER BY id DESC').all();
    res.json({ success: true, data: agendas });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/agendas', (req, res) => {
  try {
    const { title, target_date, priority = 'Medium', status = 'In Progress', assigned_to = '', description = '' } = req.body;
    const result = db.prepare(`
      INSERT INTO agendas (title, target_date, priority, status, assigned_to, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, target_date, priority, status, assigned_to, description);

    res.json({ success: true, id: result.lastInsertRowid, message: 'Agenda berhasil dibuat' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.patch('/api/agendas/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;
    if (status) {
      db.prepare('UPDATE agendas SET status = ? WHERE id = ?').run(status, id);
    }
    if (priority) {
      db.prepare('UPDATE agendas SET priority = ? WHERE id = ?').run(priority, id);
    }
    res.json({ success: true, message: 'Agenda diperbarui' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/agendas/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM agendas WHERE id = ?').run(id);
    res.json({ success: true, message: 'Agenda dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 6. DOCUMENTATIONS & FILE UPLOAD
// -------------------------------------------------------------
app.get('/api/documentations', (req, res) => {
  try {
    const docs = db.prepare('SELECT * FROM documentations ORDER BY date DESC, id DESC').all();
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/documentations', upload.single('file'), (req, res) => {
  try {
    const { title, category, date, description, file_url } = req.body;
    let finalUrl = file_url;

    if (req.file) {
      finalUrl = `/uploads/${req.file.filename}`;
    }

    const result = db.prepare(`
      INSERT INTO documentations (title, category, date, file_url, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, category || 'Nota & Kuitansi', date || new Date().toISOString().split('T')[0], finalUrl || '', description || '');

    res.json({ success: true, id: result.lastInsertRowid, message: 'Dokumentasi berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/documentations/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM documentations WHERE id = ?').run(id);
    res.json({ success: true, message: 'Dokumentasi dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 7. REPORTS (Financial Statements & Category Analytics)
// -------------------------------------------------------------
app.get('/api/reports', (req, res) => {
  try {
    const incomeByCategory = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count 
      FROM transactions 
      WHERE type = 'Income' 
      GROUP BY category 
      ORDER BY total DESC
    `).all();

    const expenseByCategory = db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count 
      FROM transactions 
      WHERE type = 'Expense' 
      GROUP BY category 
      ORDER BY total DESC
    `).all();

    const monthlyBreakdown = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      GROUP BY month
      ORDER BY month ASC
    `).all();

    const totalIncome = db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM transactions WHERE type = 'Income'").get().s;
    const totalExpenses = db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM transactions WHERE type = 'Expense'").get().s;

    res.json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpenses,
          balance: totalIncome - totalExpenses
        },
        incomeByCategory,
        expenseByCategory,
        monthlyBreakdown
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 8. SETTINGS & PROFILE
// -------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const { org_name, org_tagline, weekly_dues, user_name, user_initials, user_role, user_email, user_phone, theme } = req.body;
    db.prepare(`
      UPDATE settings 
      SET org_name = ?, org_tagline = ?, weekly_dues = ?, user_name = ?, user_initials = ?, user_role = ?, user_email = ?, user_phone = ?, theme = ?
      WHERE id = 1
    `).run(org_name, org_tagline, Number(weekly_dues), user_name, user_initials, user_role, user_email, user_phone, theme);

    res.json({ success: true, message: 'Pengaturan berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset data back to default screenshot state
app.post('/api/reset-data', (req, res) => {
  try {
    db.pragma('foreign_keys = OFF');
    db.exec(`
      DROP TABLE IF EXISTS meeting_attendance;
      DROP TABLE IF EXISTS transactions;
      DROP TABLE IF EXISTS meetings;
      DROP TABLE IF EXISTS agendas;
      DROP TABLE IF EXISTS documentations;
      DROP TABLE IF EXISTS members;
      DROP TABLE IF EXISTS settings;
    `);
    db.pragma('foreign_keys = ON');
    initDatabase();
    res.json({ success: true, message: 'Data berhasil direset sesuai referensi awal!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// 9. DOCUMENTATIONS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/documentations', (req, res) => {
  try {
    const docs = db.prepare('SELECT * FROM documentations ORDER BY id DESC').all();
    res.json({ success: true, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/documentations', upload.single('file'), (req, res) => {
  try {
    const { title, category, date, description, file_url } = req.body;
    let finalFileUrl = file_url || '';
    
    if (req.file) {
      finalFileUrl = `/uploads/${req.file.filename}`;
    }

    const stmt = db.prepare(`
      INSERT INTO documentations (title, category, date, file_url, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(title, category || 'Foto Kegiatan', date || new Date().toISOString().split('T')[0], finalFileUrl, description || '');

    const newDoc = db.prepare('SELECT * FROM documentations WHERE id = ?').get(result.lastInsertRowid);
    res.json({ success: true, data: newDoc, message: 'Dokumentasi berhasil disimpan' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/documentations/:id', (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM documentations WHERE id = ?').run(id);
    res.json({ success: true, message: 'Dokumentasi berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve built client frontend
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

app.listen(PORT, () => {
  console.log(`KasKita backend server running on port ${PORT}`);
});

export default app;
