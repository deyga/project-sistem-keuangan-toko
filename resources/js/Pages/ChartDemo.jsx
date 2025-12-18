//import React from 'react';
//import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

 //laporan pemasukan aktive

 // resources/js/Pages/laporan/LaporanKeuangan.jsx
 import React, { useState, useMemo } from 'react';
 import { FileText, Calendar, Download, TrendingUp, TrendingDown, DollarSign, Filter } from 'lucide-react';
 import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
 
 const LaporanKeuangan = ({ transaksiPemasukan = [], transaksiPengeluaran = [] }) => {
   
   const [periodeTipe, setPeriodeTipe] = useState('bulan-ini');
   const [tanggalMulai, setTanggalMulai] = useState('');
   const [tanggalAkhir, setTanggalAkhir] = useState('');
   
   // FIX 1: GANTI NAMA VARIABEL — PAKAI YANG BENAR!
   const safePemasukan = Array.isArray(transaksiPemasukan) ? transaksiPemasukan : [];
   const safePengeluaran = Array.isArray(transaksiPengeluaran) ? transaksiPengeluaran : [];
 
   // DEBUG — LIHAT APA YANG MASUK
   console.log('DATA MASUK KE LAPORAN:', { safePemasukan, safePengeluaran });
 
   const formatRupiah = (angka) => {
     const num = typeof angka === 'number' ? angka : parseFloat(angka) || 0;
     return new Intl.NumberFormat('id-ID', { 
       style: 'currency', 
       currency: 'IDR', 
       minimumFractionDigits: 0 
     }).format(num);
   };
 
   const formatTanggal = (tanggal) => {
     if (!tanggal) return 'Invalid Date';
     const date = new Date(tanggal);
     if (isNaN(date.getTime())) return 'Invalid Date';
     return date.toLocaleDateString('id-ID', { 
       day: 'numeric', 
       month: 'long', 
       year: 'numeric' 
     });
   };
 
   const getDateRange = () => {
     const today = new Date();
     today.setHours(0, 0, 0, 0);
     let mulai = new Date(today);
     let akhir = new Date(today);
     akhir.setHours(23, 59, 59, 999);
 
     switch(periodeTipe) {
       case 'hari-ini':
         mulai = new Date(today.getFullYear(), today.getMonth(), today.getDate());
         akhir = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
         break;
       case 'minggu-ini':
         const dayOfWeek = today.getDay();
         const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
         mulai = new Date(today);
         mulai.setDate(today.getDate() - diff);
         mulai.setHours(0, 0, 0, 0);
         akhir = new Date(today);
         akhir.setHours(23, 59, 59, 999);
         break;
       case 'bulan-ini':
         mulai = new Date(today.getFullYear(), today.getMonth(), 1);
         akhir = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
         break;
       case 'custom':
         if (tanggalMulai && tanggalAkhir) {
           mulai = new Date(tanggalMulai);
           akhir = new Date(tanggalAkhir);
           mulai.setHours(0, 0, 0, 0);
           akhir.setHours(23, 59, 59, 999);
         }
         break;
       default:
         mulai = new Date(today.getFullYear(), today.getMonth(), 1);
         akhir = new Date();
     }
     return { mulai, akhir };
   };
 
   const filterByDateRange = (transaksi) => {
     if (!Array.isArray(transaksi)) return [];
     const { mulai, akhir } = getDateRange();
     
     return transaksi.filter(t => {
       if (!t.tanggal) return false;
       const tanggalTransaksi = new Date(t.tanggal);
       if (isNaN(tanggalTransaksi.getTime())) return false;
       
       const tanggalOnly = new Date(tanggalTransaksi.getFullYear(), tanggalTransaksi.getMonth(), tanggalTransaksi.getDate());
       const mulaiOnly = new Date(mulai.getFullYear(), mulai.getMonth(), mulai.getDate());
       const akhirOnly = new Date(akhir.getFullYear(), akhir.getMonth(), akhir.getDate());
       
       return tanggalOnly >= mulaiOnly && tanggalOnly <= akhirOnly;
     });
   };
 
   const hitungTotal = (transaksi) => {
     return transaksi.reduce((sum, t) => sum + (parseFloat(t.jumlah) || 0), 0);
   };
 
   const groupByKategori = (transaksi) => {
     return transaksi.reduce((acc, t) => {
       const namaKategori = t.kategori?.nama_kategori || 'Lain-lain';
       const nominal = parseFloat(t.jumlah) || 0;
       acc[namaKategori] = (acc[namaKategori] || 0) + nominal;
       return acc;
     }, {});
   };
 
   const convertToChartData = (grouped) => {
     return Object.entries(grouped).map(([name, value]) => ({ 
       name: name || 'Unknown', 
       value: value || 0 
     }));
   };
 
   // FIX 2: GANTI safeTransaksiPemasukan → safePemasukan
   const laporanData = useMemo(() => {
     const filteredPemasukan = filterByDateRange(safePemasukan);
     const filteredPengeluaran = filterByDateRange(safePengeluaran);
     
     const totalPemasukan = hitungTotal(filteredPemasukan);
     const totalPengeluaran = hitungTotal(filteredPengeluaran);
     const labaRugi = totalPemasukan - totalPengeluaran;
     
     const pemasukanByKategori = groupByKategori(filteredPemasukan);
     const pengeluaranByKategori = groupByKategori(filteredPengeluaran);
     
     const pemasukanChartData = convertToChartData(pemasukanByKategori);
     const pengeluaranChartData = convertToChartData(pengeluaranByKategori);
     
     const comparisonData = [
       { name: 'Pemasukan', value: totalPemasukan, fill: '#10b981' },
       { name: 'Pengeluaran', value: totalPengeluaran, fill: '#ef4444' },
     ];
     
     return {
       filteredPemasukan, filteredPengeluaran, totalPemasukan, totalPengeluaran, labaRugi,
       pemasukanByKategori, pengeluaranByKategori,
       pemasukanChartData, pengeluaranChartData, comparisonData
     };
   }, [safePemasukan, safePengeluaran, periodeTipe, tanggalMulai, tanggalAkhir]); // FIX 3: GANTI DI SINI!
 
   const {
     filteredPemasukan,
     filteredPengeluaran,
     totalPemasukan,
     totalPengeluaran,
     labaRugi,
     pemasukanChartData,
     pengeluaranChartData,
     comparisonData,
     pemasukanByKategori,
     pengeluaranByKategori
   } = laporanData;
 
   const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
 
   const handleExport = () => {
     alert('Export laporan (PDF/Excel) akan segera tersedia!');
   };
 
   const getPeriodeLabel = () => {
     const { mulai, akhir } = getDateRange();
     const format = (date) => date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
 
     switch(periodeTipe) {
       case 'hari-ini': return `Hari Ini - ${format(mulai)}`;
       case 'minggu-ini': return `Minggu Ini - ${format(mulai)} s/d ${format(akhir)}`;
       case 'bulan-ini': return `Bulan ${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`;
       case 'custom': return tanggalMulai && tanggalAkhir ? `${format(mulai)} s/d ${format(akhir)}` : 'Pilih rentang tanggal';
       default: return 'Semua Periode';
     }
   };
 
   // TAMBAH DEBUG KALAU MASIH KOSONG
   if (safePemasukan.length === 0 && safePengeluaran.length === 0) {
     return (
       <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-8">
         <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
           <h1 className="text-3xl font-bold text-yellow-600 mb-4">BELUM ADA TRANSAKSI!</h1>
           <p className="text-lg text-slate-600">Silakan tambah transaksi di menu Pemasukan atau Pengeluaran</p>
         </div>
       </div>
     );
   }
 
     return (
     <div className="min-h-screen bg-slate-50 p-8">
       <div className="max-w-7xl mx-auto">
         
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
           <div className="flex items-center justify-between">
             <div>
               <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                 <FileText className="text-blue-600" size={32} />
                 Laporan Keuangan
               </h1>
               <p className="text-slate-500 mt-2">Analisis laba/rugi dan breakdown transaksi</p>
             </div>
             <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
               <Download size={20} />
               <span className="font-medium">Export Laporan</span>
             </button>
           </div>
         </div>
         
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
           <div className="flex items-center gap-2 mb-4">
             <Filter className="text-slate-600" size={20} />
             <h3 className="text-lg font-bold text-slate-800">Filter Periode</h3>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="md:col-span-2">
               <label className="block text-sm font-semibold text-slate-700 mb-2">Pilih Periode</label>
               <select 
                 value={periodeTipe} 
                 onChange={(e) => setPeriodeTipe(e.target.value)} 
                 className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
               >
                 <option value="hari-ini">Hari Ini</option>
                 <option value="minggu-ini">Minggu Ini</option>
                 <option value="bulan-ini">Bulan Ini</option>
                 <option value="custom">Custom Range</option>
               </select>
             </div>
             
             {periodeTipe === 'custom' && (
               <>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Mulai</label>
                   <input type="date" value={tanggalMulai} onChange={(e) => setTanggalMulai(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-2">Tanggal Akhir</label>
                   <input type="date" value={tanggalAkhir} onChange={(e) => setTanggalAkhir(e.target.value)} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
               </>
             )}
           </div>
           
           <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
             <div className="flex items-center gap-2 text-blue-800">
               <Calendar size={18} />
               <span className="text-sm font-semibold">Periode: {getPeriodeLabel()}</span>
             </div>
           </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <div className="flex items-start justify-between mb-4">
               <div className="p-3 bg-green-100 rounded-xl">
                 <TrendingUp className="text-green-600" size={24} />
               </div>
             </div>
             <p className="text-slate-500 text-sm font-medium mb-1">Total Pemasukan</p>
             <h3 className="text-3xl font-bold text-green-600 mb-2">{formatRupiah(totalPemasukan)}</h3>
             <p className="text-xs text-slate-400">{filteredPemasukan.length} transaksi</p>
           </div>
           
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <div className="flex items-start justify-between mb-4">
               <div className="p-3 bg-red-100 rounded-xl">
                 <TrendingDown className="text-red-600" size={24} />
               </div>
             </div>
             <p className="text-slate-500 text-sm font-medium mb-1">Total Pengeluaran</p>
             <h3 className="text-3xl font-bold text-red-600 mb-2">{formatRupiah(totalPengeluaran)}</h3>
             <p className="text-xs text-slate-400">{filteredPengeluaran.length} transaksi</p>
           </div>
           
           <div className={`rounded-2xl shadow-sm border p-6 ${labaRugi >= 0 ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-700' : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white border-orange-600'}`}>
             <div className="flex items-start justify-between mb-4">
               <div className="p-3 bg-white/20 rounded-xl">
                 <DollarSign size={24} />
               </div>
             </div>
             <p className="text-sm font-medium mb-1 opacity-90">{labaRugi >= 0 ? 'Laba Bersih' : 'Rugi Bersih'}</p>
             <h3 className="text-3xl font-bold mb-2">{formatRupiah(Math.abs(labaRugi))}</h3>
             <p className="text-xs opacity-75">{labaRugi >= 0 ? 'Periode ini menguntungkan' : 'Periode ini merugi'}</p>
           </div>
         </div>
 
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Perbandingan Pemasukan & Pengeluaran</h3>
             <ResponsiveContainer width="100%" height={300}>
               <BarChart data={comparisonData}>
                 <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                 <XAxis dataKey="name" stroke="#64748b" />
                 <YAxis stroke="#64748b" tickFormatter={(v) => `${(v/1000000).toFixed(1)}jt`} />
                 <Tooltip formatter={(v) => formatRupiah(v)} />
                 <Bar dataKey="value" fill={(entry) => entry.fill} radius={[8,8,0,0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
 
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
             <h3 className="text-lg font-bold text-slate-800 mb-4">Breakdown Pemasukan per Kategori</h3>
             {pemasukanChartData.length > 0 ? (
               <>
                 <ResponsiveContainer width="100%" height={240}>
                   <PieChart>
                     <Pie data={pemasukanChartData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                       {pemasukanChartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                     </Pie>
                     <Tooltip formatter={(v) => formatRupiah(v)} />
                   </PieChart>
                 </ResponsiveContainer>
                 <div className="mt-4 space-y-2">
                   {pemasukanChartData.map((item, i) => (
                     <div key={i} className="flex items-center justify-between text-sm">
                       <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                         <span className="text-slate-600">{item.name}</span>
                       </div>
                       <span className="font-semibold text-slate-800">{formatRupiah(item.value)}</span>
                     </div>
                   ))}
                 </div>
               </>
             ) : <div className="py-12 text-center text-slate-400">Tidak ada data</div>}
           </div>
         </div>
 
         {/* TABEL RINGKASAN & PIE PENGELUARAN — COPY DARI KODE LAMA KAMU */}
         {/* PASTIKAN SEMUA ADA SAMPE AKHIR */}
 
       </div>
     </div>
   );
 };
 
 export default LaporanKeuangan;




