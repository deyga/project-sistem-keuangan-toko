import React, { useState } from 'react';
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

// ============================================
// DUMMY DATA
// ============================================
const dummyTransaksiPemasukan = [
  { id: 1, tanggal: '2024-10-31', kategori: 'Penjualan Hardware', nominal: 2500000, keterangan: 'Router Mikrotik RB750' },
  { id: 2, tanggal: '2024-10-30', kategori: 'Jasa Instalasi', nominal: 3000000, keterangan: 'Network Setup Kantor PT ABC' },
  { id: 3, tanggal: '2024-10-29', kategori: 'Penjualan Hardware', nominal: 1800000, keterangan: 'Switch TP-Link 24 Port' },
  { id: 4, tanggal: '2024-10-28', kategori: 'Konsultasi', nominal: 1500000, keterangan: 'Konsultasi Network Design' },
  { id: 5, tanggal: '2024-10-27', kategori: 'Penjualan Hardware', nominal: 4200000, keterangan: 'Access Point Ubiquiti' },
];

const kategoriPemasukan = [
  'Penjualan Hardware',
  'Jasa Instalasi',
  'Konsultasi',
  'Maintenance',
  'Lainnya'
];

// ============================================
// KOMPONEN UTAMA
// ============================================
const TransaksiPemasukan = () => {
  
  const [transaksiList, setTransaksiList] = useState(dummyTransaksiPemasukan);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    tanggal: '',
    kategori: '',
    nominal: '',
    keterangan: ''
  });
  const [errors, setErrors] = useState({});
  
  // Helper Functions
  const formatRupiah = (angka) => {
    const number = typeof angka === 'string' ? parseInt(angka) : angka;
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
    return transaksiList.reduce((acc, t) => acc + t.nominal, 0);
  };
  
  const filteredTransaksi = () => {
    if (!searchQuery) return transaksiList;
    return transaksiList.filter(t => 
      t.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.keterangan.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };
  
  const validateForm = () => {
    const newErrors = {};
    if (!formData.tanggal) newErrors.tanggal = 'Tanggal harus diisi';
    if (!formData.kategori) newErrors.kategori = 'Kategori harus dipilih';
    if (!formData.nominal) {
      newErrors.nominal = 'Nominal harus diisi';
    } else if (parseInt(formData.nominal) <= 0) {
      newErrors.nominal = 'Nominal harus lebih dari 0';
    }
    if (!formData.keterangan) newErrors.keterangan = 'Keterangan harus diisi';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // CRUD Operations
  const handleOpenModal = (mode, transaksi = null) => {
    if (mode === 'edit' && transaksi) {
      setEditMode(true);
      setSelectedId(transaksi.id);
      setFormData({
        tanggal: transaksi.tanggal,
        kategori: transaksi.kategori,
        nominal: transaksi.nominal.toString(),
        keterangan: transaksi.keterangan
      });
    } else {
      setEditMode(false);
      setSelectedId(null);
      setFormData({
        tanggal: '',
        kategori: '',
        nominal: '',
        keterangan: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ tanggal: '', kategori: '', nominal: '', keterangan: '' });
    setErrors({});
    setEditMode(false);
    setSelectedId(null);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (editMode) {
      setTransaksiList(transaksiList.map(t => 
        t.id === selectedId 
          ? {
              ...t,
              tanggal: formData.tanggal,
              kategori: formData.kategori,
              nominal: parseInt(formData.nominal),
              keterangan: formData.keterangan
            }
          : t
      ));
    } else {
      const newId = Math.max(...transaksiList.map(t => t.id)) + 1;
      const newTransaksi = {
        id: newId,
        tanggal: formData.tanggal,
        kategori: formData.kategori,
        nominal: parseInt(formData.nominal),
        keterangan: formData.keterangan
      };
      setTransaksiList([newTransaksi, ...transaksiList]);
    }
    handleCloseModal();
  };
  
  const handleDelete = (id) => {
    setSelectedId(id);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    setTransaksiList(transaksiList.filter(t => t.id !== selectedId));
    setShowDeleteModal(false);
    setSelectedId(null);
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
            <button className="flex items-center gap-2 px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
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
                        {transaksi.kategori}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{transaksi.keterangan}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-bold text-green-600">
                        {formatRupiah(transaksi.nominal)}
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
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.kategori ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-green-500'
                  }`}
                >
                  <option value="">-- Pilih Kategori --</option>
                  {kategoriPemasukan.map((kat, index) => (
                    <option key={index} value={kat}>{kat}</option>
                  ))}
                </select>
                {errors.kategori && <p className="text-red-500 text-sm mt-1">{errors.kategori}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nominal <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    type="number"
                    name="nominal"
                    value={formData.nominal}
                    onChange={handleInputChange}
                    placeholder="Masukkan nominal"
                    className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.nominal ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-green-500'
                    }`}
                  />
                </div>
                {errors.nominal && <p className="text-red-500 text-sm mt-1">{errors.nominal}</p>}
                {formData.nominal && !errors.nominal && (
                  <p className="text-green-600 text-sm font-semibold mt-2">
                    = {formatRupiah(formData.nominal)}
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
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  <Save size={20} />
                  <span>{editMode ? 'Update Transaksi' : 'Simpan Transaksi'}</span>
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