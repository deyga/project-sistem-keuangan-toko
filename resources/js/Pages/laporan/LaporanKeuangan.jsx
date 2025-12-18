// resources/js/Pages/laporan/LaporanKeuangan.jsx
import React, { useState, useMemo } from 'react';
import { FileText, Calendar, Download, TrendingUp, TrendingDown, DollarSign, Filter } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const LaporanKeuangan = ({ transaksiPemasukan = [], transaksiPengeluaran = [] }) => {
  
  const [periodeTipe, setPeriodeTipe] = useState('bulan-ini');
  const [tanggalMulai, setTanggalMulai] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const safePemasukan = Array.isArray(transaksiPemasukan) ? transaksiPemasukan : [];
  const safePengeluaran = Array.isArray(transaksiPengeluaran) ? transaksiPengeluaran : [];

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
  }, [safePemasukan, safePengeluaran, periodeTipe, tanggalMulai, tanggalAkhir]);

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

  //format tanggal 
    const formatTanggalCSV = (tanggal) => {
    if (!tanggal) return '-';
    const date = new Date(tanggal);
    if (isNaN(date.getTime())) return '-';
    
    // Format: DD-MM-YYYY 
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };


  //fungsi export
  const handleExport = () => {
    setIsExporting(true);
  
    try {
      // Header CSV
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "\uFEFF"; // BOM untuk Excel Indonesia
      
      // Judul Laporan
      csvContent += `LAPORAN KEUANGAN\n`;
      csvContent += `Periode: ${getPeriodeLabel()}\n`;
      csvContent += `Tanggal Cetak: ${new Date().toLocaleString('id-ID')}\n\n`;
      
      // Ringkasan
      csvContent += `RINGKASAN KEUANGAN\n`;
      csvContent += `Kategori,Jumlah\n`;
      csvContent += `Total Pemasukan,${totalPemasukan}\n`;
      csvContent += `Total Pengeluaran,${totalPengeluaran}\n`;
      csvContent += `${labaRugi >= 0 ? 'Laba' : 'Rugi'} Bersih,${Math.abs(labaRugi)}\n\n`;
      
      // Detail Pemasukan
      csvContent += `DETAIL PEMASUKAN\n`;
      csvContent += `No,Tanggal,Kategori,Keterangan,Jumlah\n`;
      filteredPemasukan.forEach((item, index) => {
        const tanggal = formatTanggal(item.tanggal);
        const kategori = item.kategori?.nama_kategori || 'Lain-lain';
        const keterangan = (item.keterangan || '-').replace(/,/g, ';'); // Escape koma
        const jumlah = parseFloat(item.jumlah) || 0;
        csvContent += `${index + 1},${tanggal},${kategori},"${keterangan}",${jumlah}\n`;
      });
      csvContent += `,,,,TOTAL PEMASUKAN:,${totalPemasukan}\n\n`;
      
      // Detail Pengeluaran
      csvContent += `DETAIL PENGELUARAN\n`;
      csvContent += `No,Tanggal,Kategori,Keterangan,Jumlah\n`;
      filteredPengeluaran.forEach((item, index) => {
        const tanggal = formatTanggal(item.tanggal);
        const kategori = item.kategori?.nama_kategori || 'Lain-lain';
        const keterangan = (item.keterangan || '-').replace(/,/g, ';');
        const jumlah = parseFloat(item.jumlah) || 0;
        csvContent += `${index + 1},${tanggal},${kategori},"${keterangan}",${jumlah}\n`;
      });
      csvContent += `,,,,TOTAL PENGELUARAN:,${totalPengeluaran}\n\n`;
      
      // Breakdown per Kategori
      csvContent += `BREAKDOWN PEMASUKAN PER KATEGORI\n`;
      csvContent += `Kategori,Jumlah\n`;
      Object.entries(pemasukanByKategori).forEach(([kategori, jumlah]) => {
        csvContent += `${kategori},${jumlah}\n`;
      });
      csvContent += `\n`;
      
      csvContent += `BREAKDOWN PENGELUARAN PER KATEGORI\n`;
      csvContent += `Kategori,Jumlah\n`;
      Object.entries(pengeluaranByKategori).forEach(([kategori, jumlah]) => {
        csvContent += `${kategori},${jumlah}\n`;
      });
      
      // Download file
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      
      const filename = `Laporan_Keuangan_${periodeTipe}_${new Date().toISOString().split('T')[0]}.csv`;
      link.setAttribute("download", filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Notifikasi sukses
      alert(`Laporan berhasil diexport!\n\nFile: ${filename}\nPeriode: ${getPeriodeLabel()}\n\nSilakan buka file CSV dengan Excel atau Google Sheets.`);
      
    } catch (error) {
      console.error('Error export:', error);
      alert('Gagal export laporan. Silakan coba lagi.');
    } finally {
      setIsExporting(false);
    }
  };

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
            <button 
              onClick={handleExport} 
              disabled={isExporting}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition shadow-lg font-medium ${
                isExporting 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/30 hover:scale-105 transform'
              }`}
            >
              <Download size={20} className={isExporting ? 'animate-bounce' : ''} />
              <span>{isExporting ? 'Exporting...' : 'Export Laporan (CSV)'}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
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

          {/*composed chart */} 
              
              
            
          {/* */}

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

        {/* break dwon pengeluran kategori*/}
        {/* */}
        
        {/* BREAKDOWN + PERFORMANCE DASHBOARD */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">

  {/* Breakdown Pengeluaran per Kategori */}
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
    <h3 className="text-lg font-bold text-slate-800 mb-4">
      Breakdown Pengeluaran per Kategori
    </h3>

    {pengeluaranChartData.length > 0 ? (
      <>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={pengeluaranChartData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
            >
              {pengeluaranChartData.map((e, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatRupiah(v)} />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-6 space-y-3">
          {pengeluaranChartData.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-slate-600">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-800">
                {formatRupiah(item.value)}
              </span>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="py-12 text-center text-slate-400">
        Tidak ada data
      </div>
    )}
  </div>

  {/* Performance Dashboard */}
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
    <h3 className="text-lg font-bold text-slate-800 mb-4">
      Performance Dashboard
    </h3>

    {(() => {
      const targetPemasukan =
        totalPemasukan > 0 ? totalPemasukan * 1.2 : 10000000;
      const targetPengeluaran =
        totalPengeluaran > 0 ? totalPengeluaran * 0.9 : 8000000;

      const performanceData = [
        {
          name: 'Pemasukan',
          value: totalPemasukan,
          target: targetPemasukan,
          percentage:
            totalPemasukan > 0
              ? Math.min((totalPemasukan / targetPemasukan) * 100, 100)
              : 0,
          fill: '#10b981',
        },
        {
          name: 'Pengeluaran',
          value: totalPengeluaran,
          target: targetPengeluaran,
          percentage:
            totalPengeluaran > 0
              ? Math.min((totalPengeluaran / targetPengeluaran) * 100, 100)
              : 0,
          fill: '#ef4444',
        },
        {
          name: 'Efisiensi',
          value: labaRugi,
          target: targetPemasukan - targetPengeluaran,
          percentage:
            totalPemasukan > 0
              ? Math.min((Math.abs(labaRugi) / totalPemasukan) * 100, 100)
              : 0,
          fill: labaRugi >= 0 ? '#3b82f6' : '#f59e0b',
        },
      ];

      return (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                startAngle={90}
                endAngle={450}
                dataKey="percentage"
              >
                {performanceData.map((e, i) => (
                  <Cell key={i} fill={e.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `${v.toFixed(1)}%`} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-6 space-y-3">
            {performanceData.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatRupiah(item.value)} /{' '}
                      {formatRupiah(item.target)}
                    </p>
                  </div>
                </div>
                <p
                  className="text-lg font-bold"
                  style={{ color: item.fill }}
                >
                  {item.percentage.toFixed(0)}%
                </p>
              </div>
            ))}
          </div>
        </>
      );
    })()}
  </div>

</div>
 
        {/* kpi summary card */}
          
          {/* KPI SUMMARY */}
<div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-10 mt-16">
  <h3 className="text-lg font-bold text-slate-800 mb-4">
    Ringkasan KPI Keuangan
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    
    {/* KPI PEMASUKAN */}
    <div className="rounded-2xl p-5 border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-green-600 rounded-xl">
          <TrendingUp className="text-white" size={22} />
        </div>
        <span className="text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
          PEMASUKAN
        </span>
      </div>

      <p className="text-sm text-green-700 mb-1">
        Rata-rata per Transaksi
      </p>

      <p className="text-2xl font-bold text-green-800">
        {formatRupiah(
          filteredPemasukan.length
            ? totalPemasukan / filteredPemasukan.length
            : 0
        )}
      </p>

      <p className="text-xs text-green-600 mt-2">
        {filteredPemasukan.length} transaksi
      </p>
    </div>

    {/* KPI PENGELUARAN */}
    <div className="rounded-2xl p-5 border border-red-200 bg-gradient-to-br from-red-50 to-rose-50">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-red-600 rounded-xl">
          <TrendingDown className="text-white" size={22} />
        </div>
        <span className="text-xs font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
          PENGELUARAN
        </span>
      </div>

      <p className="text-sm text-red-700 mb-1">
        Rata-rata per Transaksi
      </p>

      <p className="text-2xl font-bold text-red-800">
        {formatRupiah(
          filteredPengeluaran.length
            ? totalPengeluaran / filteredPengeluaran.length
            : 0
        )}
      </p>

      <p className="text-xs text-red-600 mt-2">
        {filteredPengeluaran.length} transaksi
      </p>
    </div>

    {/* KPI PROFIT / LOSS */}
    <div
      className={`rounded-2xl p-5 border ${
        labaRugi >= 0
          ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'
          : 'border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-xl ${
            labaRugi >= 0 ? 'bg-blue-600' : 'bg-orange-600'
          }`}
        >
          <DollarSign className="text-white" size={22} />
        </div>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            labaRugi >= 0
              ? 'text-blue-700 bg-blue-100'
              : 'text-orange-700 bg-orange-100'
          }`}
        >
          {labaRugi >= 0 ? 'PROFIT' : 'LOSS'}
        </span>
      </div>

      <p
        className={`text-sm mb-1 ${
          labaRugi >= 0 ? 'text-blue-700' : 'text-orange-700'
        }`}
      >
        Profit Margin
      </p>

      <p
        className={`text-2xl font-bold ${
          labaRugi >= 0 ? 'text-blue-800' : 'text-orange-800'
        }`}
      >
        {totalPemasukan > 0
          ? ((labaRugi / totalPemasukan) * 100).toFixed(1)
          : 0}
        %
      </p>

      <p
        className={`text-xs mt-2 ${
          labaRugi >= 0 ? 'text-blue-600' : 'text-orange-600'
        }`}
      >
        {labaRugi >= 0
          ? 'Keuangan dalam kondisi sehat'
          : 'Perlu optimasi pengeluaran'}
      </p>
    </div>

  </div>
</div>


   {/* analisis matric perkategori */}

      {/* ANALISIS METRIC PER KATEGORI */}
<div
  className="
    bg-white rounded-2xl shadow-sm border border-slate-200
    p-8 mb-14

    h-[560px] flex flex-col"
>
  <h3 className="text-xl font-bold text-slate-800 mb-2">
    Analisis Metric per Kategori
  </h3>

  <p className="text-sm text-slate-500 mb-4">
    Perbandingan pemasukan, pengeluaran, dan selisih tiap kategori
  </p>

  {(() => {
    const allKategori = new Set([
      ...Object.keys(pemasukanByKategori),
      ...Object.keys(pengeluaranByKategori),
    ]);

    const chartData = Array.from(allKategori).map((kategori) => {
      const pemasukan = pemasukanByKategori[kategori] || 0;
      const pengeluaran = pengeluaranByKategori[kategori] || 0;

      return {
        kategori:
          kategori.length > 18 ? kategori.slice(0, 18) + '…' : kategori,
        pemasukan,
        pengeluaran,
        selisih: pemasukan - pengeluaran,
      };
    });

    return chartData.length > 0 ? (
      <>
      
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

              <XAxis
                dataKey="kategori"
                angle={-15}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />

              <YAxis
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)} jt`}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />

              <Tooltip
                formatter={(value, name) => [formatRupiah(value), name]}
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                }}
              />
              <Legend />

              <Bar
                dataKey="pemasukan"
                name="Pemasukan"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="pengeluaran"
                name="Pengeluaran"
                fill="#ef4444"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="selisih"
                name="Selisih"
                fill="#3b82f6"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </>
    ) : (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        Tidak ada data kategori
      </div>
    );
  })()}
</div>

         {/* Tabel Transaksi Terbesar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16 mt-20">
        {/* Top Pemasukan */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-600" size={20} />
                  Top 5 Pemasukan Terbesar
            </h3>
          {filteredPemasukan.length > 0 ? (
            <div className="space-y-3">
              {filteredPemasukan
                .sort((a, b) => parseFloat(b.jumlah) - parseFloat(a.jumlah))
                .slice(0, 5)
                .map((item, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                     <div className="flex-1">
                        <p className="font-semibold text-slate-800">{item.kategori?.nama_kategori || 'Lain-lain'}</p>
                        <p className="text-xs text-slate-500">{formatTanggal(item.tanggal)}</p>
                   </div>
                     <div className="text-right">
                        <p className="font-bold text-green-600">{formatRupiah(item.jumlah)}</p>
               </div>
              </div>
             ))}
          </div>
            ) : (
      <div className="py-8 text-center text-slate-400">Tidak ada data</div>
    )}
  </div>

  {/* Top Pengeluaran */}
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
      <TrendingDown className="text-red-600" size={20} />
      Top 5 Pengeluaran Terbesar
    </h3>
    {filteredPengeluaran.length > 0 ? (
      <div className="space-y-3">
        {filteredPengeluaran
          .sort((a, b) => parseFloat(b.jumlah) - parseFloat(a.jumlah))
          .slice(0, 5)
          .map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex-1">
                <p className="font-semibold text-slate-800">{item.kategori?.nama_kategori || 'Lain-lain'}</p>
                <p className="text-xs text-slate-500">{formatTanggal(item.tanggal)}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-red-600">{formatRupiah(item.jumlah)}</p>
              </div>
            </div>
          ))}
      </div>
    ) : (
      <div className="py-8 text-center text-slate-400">Tidak ada data</div>
    )}
  </div>
</div>

{/* Insight & Rekomendasi */}
<div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-200 p-6 mb-8">
  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
    Insight & Rekomendasi
  </h3>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="bg-white rounded-lg p-4 border border-blue-200">
      <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
      <p className="text-2xl font-bold text-blue-600">
        {totalPemasukan > 0 ? ((labaRugi / totalPemasukan) * 100).toFixed(1) : 0}%
      </p>
      <p className="text-xs text-slate-500 mt-1">
        {labaRugi >= 0 ? 'Kondisi sehat' : 'Perlu perhatian'}
      </p>
    </div>
    
    <div className="bg-white rounded-lg p-4 border border-blue-200">
      <p className="text-sm text-slate-600 mb-1">Rata-rata Pengeluaran/Hari</p>
      <p className="text-2xl font-bold text-orange-600">
        {formatRupiah(filteredPengeluaran.length > 0 ? totalPengeluaran / filteredPengeluaran.length : 0)}
      </p>
      <p className="text-xs text-slate-500 mt-1">
        {filteredPengeluaran.length} transaksi
      </p>
    </div>
    
      <div className="bg-white rounded-lg p-4 border border-blue-200">
         <p className="text-sm text-slate-600 mb-1">Kategori Tertinggi</p>
         <p className="text-lg font-bold text-purple-600">
             {pengeluaranChartData.length > 0 
                ? pengeluaranChartData.reduce((max, item) => item.value > max.value ? item : max).name
                : '-'
              }
             </p>
             <p className="text-xs text-slate-500 mt-1">Pengeluaran terbesar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanKeuangan;