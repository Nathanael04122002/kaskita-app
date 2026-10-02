import React, { useState, useEffect, useRef } from 'react';
import { Plus, Image as ImageIcon, FileText, Trash2, ZoomIn, X, Search, Upload, Camera, File } from 'lucide-react';

const CATEGORIES = ['Foto Kegiatan', 'Nota & Kuitansi', 'Dokumen / Notulensi'];

function getCategoryStyle(cat) {
  switch (cat) {
    case 'Foto Kegiatan': return { bg: 'bg-violet-500', label: '📸' };
    case 'Nota & Kuitansi': return { bg: 'bg-emerald-500', label: '🧾' };
    default: return { bg: 'bg-amber-500', label: '📄' };
  }
}

export default function DocumentationPage({ onOpenAdd }) {
  const [docs, setDocs] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Foto Kegiatan');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const fetchDocs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/documentations');
      const json = await res.json();
      if (json.success) setDocs(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Hapus dokumentasi ini?')) return;
    try {
      await fetch(`/api/documentations/${id}`, { method: 'DELETE' });
      fetchDocs();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setFilePreview(ev.target.result);
    reader.readAsDataURL(file);
    setFileUrl('');
  };

  const resetForm = () => {
    setTitle('');
    setCategory('Foto Kegiatan');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setFileUrl('');
    setFilePreview(null);
    setSelectedFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { alert('Judul wajib diisi'); return; }
    setIsSubmitting(true);
    try {
      let finalUrl = fileUrl;

      if (selectedFile) {
        // Upload file via FormData
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', title);
        formData.append('category', category);
        formData.append('date', date);
        formData.append('description', description);

        const res = await fetch('/api/documentations', { method: 'POST', body: formData });
        const json = await res.json();
        if (json.success) {
          setIsAddOpen(false);
          resetForm();
          fetchDocs();
        } else {
          alert(json.error || 'Gagal menyimpan');
        }
      } else {
        // Submit via JSON with URL
        const res = await fetch('/api/documentations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, category, date, description, file_url: finalUrl })
        });
        const json = await res.json();
        if (json.success) {
          setIsAddOpen(false);
          resetForm();
          fetchDocs();
        } else {
          alert(json.error || 'Gagal menyimpan');
        }
      }
    } catch (err) {
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = docs.filter(d => {
    const matchCat = categoryFilter === 'All' || d.category === categoryFilter;
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || (d.description || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const catCounts = {
    All: docs.length,
    'Foto Kegiatan': docs.filter(d => d.category === 'Foto Kegiatan').length,
    'Nota & Kuitansi': docs.filter(d => d.category === 'Nota & Kuitansi').length,
    'Dokumen / Notulensi': docs.filter(d => d.category === 'Dokumen / Notulensi').length,
  };

  return (
    <div className="space-y-5">
      {/* Header Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Arsip', value: docs.length, color: 'text-blue-600', icon: '🗂️' },
          { label: 'Foto Kegiatan', value: catCounts['Foto Kegiatan'], color: 'text-violet-600', icon: '📸' },
          { label: 'Nota & Kuitansi', value: catCounts['Nota & Kuitansi'], color: 'text-emerald-600', icon: '🧾' },
          { label: 'Dokumen', value: catCounts['Dokumen / Notulensi'], color: 'text-amber-600', icon: '📄' },
        ].map(item => (
          <div key={item.label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
            <span className="text-2xl">{item.icon}</span>
            <div>
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari dokumentasi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[['All', 'Semua', '🗂️'], ['Foto Kegiatan', 'Foto', '📸'], ['Nota & Kuitansi', 'Nota', '🧾'], ['Dokumen / Notulensi', 'Dokumen', '📄']].map(([val, lbl, icon]) => (
              <button
                key={val}
                onClick={() => setCategoryFilter(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                  categoryFilter === val
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <span>{icon}</span>
                <span>{lbl}</span>
                <span className={`text-[10px] px-1 rounded-full ${categoryFilter === val ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-600'}`}>{catCounts[val]}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Dokumentasi</span>
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      {isLoading ? (
        <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl">
          <p className="text-4xl mb-3 animate-pulse">🗂️</p>
          <p>Memuat arsip dokumentasi...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <p className="text-5xl mb-4">📂</p>
          <p className="font-semibold text-slate-600 dark:text-slate-300">Belum ada dokumentasi</p>
          <p className="text-xs mt-1 mb-5">{search || categoryFilter !== 'All' ? 'Coba ubah filter pencarian' : 'Upload foto kegiatan, nota, atau dokumen pertama Anda'}</p>
          {!search && categoryFilter === 'All' && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="mx-auto flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
            >
              <Plus className="w-4 h-4" />
              Tambah Dokumentasi Pertama
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => {
            const style = getCategoryStyle(doc.category);
            const isImage = doc.file_url && (doc.file_url.match(/\.(jpg|jpeg|png|gif|webp|bmp)/i) || doc.file_url.startsWith('data:image') || doc.file_url.startsWith('http') || doc.file_url.startsWith('/uploads'));
            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group cursor-pointer flex flex-col"
                onClick={() => setPreviewDoc(doc)}
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  {isImage ? (
                    <img
                      src={doc.file_url}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                      <div className={`w-14 h-14 ${style.bg} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                        {style.label}
                      </div>
                      <p className="text-xs text-slate-400">Klik untuk lihat detail</p>
                    </div>
                  )}
                  {/* Category badge */}
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full text-white ${style.bg} shadow-sm`}>
                    {style.label} {doc.category}
                  </span>
                  {/* Zoom overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all drop-shadow-lg" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] text-slate-400 font-medium">📅 {doc.date}</p>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-2">{doc.title}</h4>
                    {doc.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{doc.description}</p>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">Tap untuk lihat</span>
                    <button
                      onClick={(e) => handleDelete(doc.id, e)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${getCategoryStyle(previewDoc.category).bg}`}>
                    {getCategoryStyle(previewDoc.category).label} {previewDoc.category}
                  </span>
                  <span className="text-[10px] text-slate-400">📅 {previewDoc.date}</span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{previewDoc.title}</h4>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Image */}
            {previewDoc.file_url && (
              <div className="bg-slate-950 flex items-center justify-center max-h-[60vh] overflow-auto">
                <img
                  src={previewDoc.file_url}
                  alt={previewDoc.title}
                  className="max-w-full max-h-[60vh] object-contain"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
            )}

            {/* Description */}
            {previewDoc.description && (
              <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{previewDoc.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Documentation Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Tambah Dokumentasi</h3>
                  <p className="text-xs text-purple-200 mt-0.5">Foto kegiatan, nota, atau dokumen</p>
                </div>
              </div>
              <button
                onClick={() => { setIsAddOpen(false); resetForm(); }}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* File Upload Area */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  File / Foto <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <div
                  className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-4 text-center cursor-pointer hover:border-violet-400 hover:bg-violet-50/30 dark:hover:bg-violet-950/20 transition group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {filePreview ? (
                    <div className="relative">
                      <img src={filePreview} alt="preview" className="max-h-40 mx-auto rounded-xl object-contain" />
                      <p className="text-xs text-violet-600 mt-2 font-semibold">
                        {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2 group-hover:text-violet-400 transition" />
                      <p className="text-sm font-semibold text-slate-500 group-hover:text-violet-600 transition">Klik untuk upload file / foto</p>
                      <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF, atau format lainnya</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {!filePreview && (
                  <div className="mt-2">
                    <p className="text-[10px] text-slate-400 mb-1 text-center">atau masukkan URL gambar</p>
                    <input
                      type="url"
                      placeholder="https://... (URL gambar online)"
                      value={fileUrl}
                      onChange={e => setFileUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                    />
                  </div>
                )}
              </div>

              {/* Judul */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul / Keterangan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Foto Rapat Bulanan Oktober 2026"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 transition"
                />
              </div>

              {/* Kategori & Tanggal */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Kategori</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  >
                    <option value="Foto Kegiatan">📸 Foto Kegiatan</option>
                    <option value="Nota & Kuitansi">🧾 Nota & Kuitansi</option>
                    <option value="Dokumen / Notulensi">📄 Dokumen / Notulensi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Keterangan Tambahan <span className="text-slate-400 font-normal">(opsional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Deskripsi singkat tentang dokumentasi ini..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => { setIsAddOpen(false); resetForm(); }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow transition flex items-center gap-2 disabled:opacity-60"
                >
                  <File className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Dokumentasi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
