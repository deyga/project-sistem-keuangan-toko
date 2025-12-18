import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp,
  Download
} from 'lucide-react';

const TransaksiPemasukan = ({ transaksiList = [], kategoriList = [] }) => {
  
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    tanggal: '',
    kategori_id: '',
    jumlah: '',
    keterangan: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const safeKategoriList = Array.isArray(kategoriList) ? kategoriList : [];

  const formatRupiah = (angka) => {
    const number = typeof angka === 'string' ? parseInt(angka) || 0 : angka;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const formatTanggal = (tanggal) => {
    const date = new Date(tanggal);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const hitungTotal = () => {
    return transaksiList.reduce((acc, t) => acc + (parseInt(t.jumlah) || 0), 0);
  };

  const filteredTransaksi = () => {
    if (!searchQuery) return transaksiList;
    const query = searchQuery.toLowerCase();
    return transaksiList.filter(t => 
      (t.kategori?.nama_kategori || '').toLowerCase().includes(query) ||
      (t.keterangan || '').toLowerCase().includes(query)
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal transaksi harus diisi!';
    if (!formData.kategori_id) newErrors.kategori_id = 'Kategori harus dipilih!';
    if (!formData.jumlah || parseInt(formData.jumlah) <= 0) {
      newErrors.jumlah = 'jumlah harus lebih dari 1';
    }
    if (!formData.keterangan) newErrors.keterangan = 'Keterangan harus diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

   //fungsi export 

     const handleExport = () => {
  if (transaksiList.length === 0) {
    alert('Tidak ada data pemasukan untuk diekspor.');
    return;
  }

  // Header CSV
  const headers = [
    'No',
    'Tanggal',
    'Kategori',
    'Keterangan',
    'Nominal'
  ];

  // Data rows
  const rows = transaksiList.map((t, index) => [
    index + 1,
    formatTanggal(t.tanggal),
    t.kategori?.nama_kategori || 'N/A',
    t.keterangan || '',
    t.jumlah
  ]);

  
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    
    const escapedRow = row.map(cell => 
      typeof cell === 'string' && cell.includes(',') ? `"${cell}"` : cell
    );
    csvContent += escapedRow.join(',') + '\n';
  });

  
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Pemasukan_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
 
  // 

  const handleOpenModal = (mode, transaksi = null) => {
    if (mode === 'edit' && transaksi) {
      setEditMode(true);
      setSelectedId(transaksi.id);
      setFormData({
        tanggal: transaksi.tanggal,
        kategori_id: transaksi.kategori_id?.toString() || '',
        jumlah: transaksi.jumlah.toString(),
        keterangan: transaksi.keterangan || ''
      });
    } else {
      setEditMode(false);
      setSelectedId(null);
      setFormData({
        tanggal: '',
        kategori_id: '',
        jumlah: '',
        keterangan: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ tanggal: '', kategori_id: '', jumlah: '', keterangan: '' });
    setErrors({});
    setEditMode(false);
    setSelectedId(null);
  };

  const handleInputChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
  if (errors[name]) {
    setErrors(prev => ({ ...prev, [name]: '' }));
  }
};

const handleSubmit = () => {
  if (!validateForm()) {
    console.log('Validasi gagal:', errors);
    return;
  }

  setIsSubmitting(true);

  const dataToSubmit = {
    tanggal: formData.tanggal,
    kategori_id: parseInt(formData.kategori_id),
    jumlah: parseFloat(formData.jumlah),
    keterangan: formData.keterangan.trim()
  };

  console.log('Mengirim data ke backend:', dataToSubmit);

  const commonOptions = {
    preserveScroll: true,
    onSuccess: () => {
      console.log('Berhasil!');
      handleCloseModal();
       router.reload({ only: ['transaksiList', 'kategoriList'] });
    },
    onError: (err) => {
      console.error('Error:', err);
      setErrors(err);
      setIsSubmitting(false);
    },
    onFinish: () => {
      setIsSubmitting(false);
    }
  };

  if (editMode) {
    router.put(`/pemasukan/${selectedId}`, dataToSubmit, commonOptions);
  } else {
    router.post('/pemasukan', dataToSubmit, commonOptions);
  }
};

const confirmDelete = () => {
  router.delete(`/pemasukan/${selectedId}`, {
    preserveScroll: true,
    onSuccess: () => {
      setShowDeleteModal(false);
      setSelectedId(null);
       router.reload({ only: ['transaksiList', 'kategoriList'] });
    },
    onError: () => {
      alert('Gagal menghapus transaksi');
      setShowDeleteModal(false);
    }
  });
};

const handleDelete = (id) => {
  setSelectedId(id);
  setShowDeleteModal(true);
};

  
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <TrendingUp className="text-green-600" size={32} />
                Transaksi Pemasukan
              </h1>
              <p className="text-slate-500 mt-2">Kelola semua transaksi pemasukan toko</p>
            </div>
            <button
              onClick={() => handleOpenModal('add')}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-600/30"
            >
              <Plus size={20} />
              <span className="font-medium">Tambah Transaksi</span>
            </button>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-medium mb-1">Total Pemasukan</p>
                <h2 className="text-3xl font-bold text-green-800">
                  {formatRupiah(hitungTotal())}
                </h2>
              </div>
              <div className="p-4 bg-green-600 rounded-xl">
                <DollarSign className="text-white" size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Cari berdasarkan kategori atau keterangan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
              <Download size={18} />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* TABEL */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Kategori</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Keterangan</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Nominal</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTransaksi().map((transaksi, index) => (
                  <tr key={transaksi.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm text-slate-600">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                      {formatTanggal(transaksi.tanggal)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        {transaksi.kategori?.nama_kategori || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{transaksi.keterangan}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-green-600">
                        {formatRupiah(transaksi.jumlah)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal('edit', transaksi)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(transaksi.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransaksi().length === 0 && (
              <div className="py-12 text-center">
                <FileText className="mx-auto text-slate-300 mb-3" size={48} />
                <p className="text-slate-500 font-medium">Tidak ada transaksi ditemukan</p>
                <p className="text-slate-400 text-sm mt-1">
                  {searchQuery ? 'Coba kata kunci lain' : 'Tambah transaksi baru untuk memulai'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-2xl font-bold text-slate-800">
                {editMode ? 'Edit Transaksi Pemasukan' : 'Tambah Transaksi Pemasukan'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 hover:bg-slate-100 rounded-lg transition">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Tanggal Transaksi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleInputChange}
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.tanggal ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-green-500'
                    }`}
                  />
                </div>
                {errors.tanggal && <p className="text-red-500 text-sm mt-1">{errors.tanggal}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  name="kategori_id"
                  value={formData.kategori_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.kategori_id ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-green-500'
                  }`}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {safeKategoriList.length > 0 ? (
                    safeKategoriList.map((kat) => (
                      <option key={kat.id} value={kat.id}>
                        {kat.nama_kategori}
                      </option>
                    ))
                  ) : (
                    <option disabled>Tidak ada kategori tersedia</option>
                  )}
                </select>
                {errors.kategori_id && <p className="text-red-500 text-sm mt-1">{errors.kategori_id}</p>}
                {safeKategoriList.length === 0 && (
                  <p className="text-amber-600 text-xs mt-1">Kategori belum tersedia. Tambah di menu Kategori terlebih dulu.</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nominal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="number"
                    name="jumlah"
                    value={formData.jumlah}
                    onChange={handleInputChange}
                    placeholder="Masukkan nominal"
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                     errors.jumlah ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-green-500'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.jumlah && <p className="text-red-500 text-sm mt-1">{errors.jumlah}</p>}
                {formData.jumlah && !errors.jumlah && (
                  <p className="text-green-600 text-sm font-semibold mt-2">
                    = {formatRupiah(formData.jumlah)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Keterangan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="keterangan"
                  value={formData.keterangan}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Masukkan keterangan transaksi"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
                    errors.keterangan ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-green-500'
                  }`}
                />
                {errors.keterangan && <p className="text-red-500 text-sm mt-1">{errors.keterangan}</p>}
              </div>
              
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition font-semibold ${
                  isSubmitting 
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                  : 'bg-green-600 text-white hover:bg-green-700'
                 }`}
                >
                  <Save size={20} />
                  <span>{isSubmitting 
                     ? 'Menyimpan...' 
                     : editMode 
                     ? 'Update Transaksi' 
                     : 'Simpan Transaksi'
                  }</span>
                </button>

                <button
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DELETE */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Transaksi?</h3>
              <p className="text-slate-600 mb-6">
                Transaksi yang dihapus tidak dapat dikembalikan.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                >
                  Ya, Hapus
                </button>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-semibold"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransaksiPemasukan;

