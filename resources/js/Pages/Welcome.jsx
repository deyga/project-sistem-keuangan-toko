//active

import React, { useState } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight,
  ArrowDownRight,
  DollarSign, 
  FileText, 
  Settings, 
  LogOut,
  Plus,
  Calendar,
  Download,
  Search,
  Bell,
  User,
  ChevronRight
} from 'lucide-react';

import TransaksiPemasukan from './Pemasukan/Index';
import TransaksiPengeluaran from './pengeluaran/TransaksiPengeluaran';
import LaporanKeuangan from './laporan/LaporanKeuangan';

const Dashboard = ({ 
  summaryToday = { totalPemasukan: 0, totalPengeluaran: 0, saldo: 0 },
  chartData = [],
  recentTransactions = [],
  pengeluaranKategori = [],
  transaksiPemasukan = [],
  transaksiPengeluaran = [],
  kategoriPemasukan = [],
  kategoriPengeluaran = []
}) => {
  
  // ✅ FIX: Nama variable yang benar
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('7-hari');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // SAFE DATA
  const safeSummary = {
    totalPemasukan: summaryToday?.totalPemasukan || 0,
    totalPengeluaran: summaryToday?.totalPengeluaran || 0,
    saldo: summaryToday?.saldo || 0
  };

  const safeChartData = Array.isArray(chartData) ? chartData : [];
  const safeRecentTransactions = Array.isArray(recentTransactions) ? recentTransactions : [];
  const safePengeluaranKategori = Array.isArray(pengeluaranKategori) ? pengeluaranKategori : [];

  const formatRupiah = (angka) => {
    const num = typeof angka === 'number' ? angka : parseInt(angka) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num);
  };

  const formatTanggal = (tanggal) => {
    if (!tanggal) return 'N/A';
    const date = new Date(tanggal);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // LOGIC GABUNGKAN SEMUA TRANSAKSI
  const allTransactions = [
    ...(Array.isArray(transaksiPemasukan) ? transaksiPemasukan.map(t => ({ 
      ...t, 
      jenis: 'Pemasukan' 
    })) : []),
    ...(Array.isArray(transaksiPengeluaran) ? transaksiPengeluaran.map(t => ({ 
      ...t, 
      jenis: 'Pengeluaran' 
    })) : [])
  ]
  .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
  .filter(t => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const kategoriNama = (t.kategori?.nama_kategori || '').toLowerCase();
    const keterangan = (t.keterangan || '').toLowerCase();
    const nominal = (t.nominal || 0).toString();
    const tanggal = formatTanggal(t.tanggal).toLowerCase();
    
    return kategoriNama.includes(query) || 
           keterangan.includes(query) || 
           nominal.includes(query) ||
           tanggal.includes(query);
  });

  // ✅ LOGIC PAGINATION (B)
  const displayedTransactions = showAllTransactions ? allTransactions : allTransactions.slice(0, 20);

  const { totalPemasukan, totalPengeluaran, saldo } = safeSummary;

  const menuItems = [
    { id: 'dashboard', page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pemasukan', page: 'pemasukan', label: 'Transaksi Pemasukan', icon: TrendingUp },
    { id: 'pengeluaran', page: 'pengeluaran', label: 'Transaksi Pengeluaran', icon: TrendingDown },
    { id: 'laporan', page: 'laporan', label: 'Laporan Keuangan', icon: FileText },
    { id: 'settings', page: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch(activePage) {
      case 'pemasukan':
        return <TransaksiPemasukan 
          transaksiList={Array.isArray(transaksiPemasukan) ? transaksiPemasukan : []} 
          kategoriList={Array.isArray(kategoriPemasukan) ? kategoriPemasukan : []} 
        />;
      
      case 'pengeluaran':
        return <TransaksiPengeluaran 
          transaksiList={Array.isArray(transaksiPengeluaran) ? transaksiPengeluaran : []} 
          kategoriList={Array.isArray(kategoriPengeluaran) ? kategoriPengeluaran : []} 
        />;

      case 'laporan':
        return <LaporanKeuangan 
          transaksiPemasukan={Array.isArray(transaksiPemasukan) ? transaksiPemasukan : []}
          transaksiPengeluaran={Array.isArray(transaksiPengeluaran) ? transaksiPengeluaran : []}
        />;
      
      case 'settings':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Settings className="mx-auto text-slate-300 mb-4" size={64} />
              <h2 className="text-2xl font-bold text-slate-700 mb-2">Settings</h2>
              <p className="text-slate-500">Halaman ini akan segera dibuat</p>
            </div>
          </div>
        );
      
      case 'dashboard':
      default:
        return (
          <>
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
              <div className="px-8 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                  <p className="text-sm text-slate-500 mt-1">Monitor keuangan real-time</p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* ✅ FIX: Tambah value dan onChange */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      placeholder="Cari transaksi..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                    {searchQuery && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">
                        {allTransactions.length} hasil
                      </div>
                    )}
                  </div>
                  
                  <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
                    <Bell size={20} className="text-slate-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </button>
                  
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">
                    <Plus size={20} />
                    <span className="font-medium">Transaksi Baru</span>
                  </button>
                </div>
              </div>
            </header>

            <div className="p-8">
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-slate-400" size={20} />
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="hari-ini">Hari Ini</option>
                    <option value="7-hari">7 Hari Terakhir</option>
                    <option value="30-hari">30 Hari Terakhir</option>
                    <option value="bulan-ini">Bulan Ini</option>
                  </select>
                </div>
                
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition">
                  <Download size={18} />
                  <span className="text-sm font-medium">Export Report</span>
                </button>
              </div>

              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <TrendingUp className="text-green-600" size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                      <ArrowUpRight size={16} />
                      <span>+12%</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Total Pemasukan</p>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">
                    {formatRupiah(totalPemasukan)}
                  </h3>
                  <p className="text-xs text-slate-400">Dari kemarin</p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <TrendingDown className="text-red-600" size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                      <ArrowDownRight size={16} />
                      <span>-5%</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Total Pengeluaran</p>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">
                    {formatRupiah(totalPengeluaran)}
                  </h3>
                  <p className="text-xs text-slate-400">Dari kemarin</p>
                </div>

                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 rounded-xl">
                      <DollarSign size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <ArrowUpRight size={16} />
                      <span>+8%</span>
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Saldo Hari Ini</p>
                  <h3 className="text-3xl font-bold mb-2">
                    {formatRupiah(saldo)}
                  </h3>
                  <p className="text-xs text-blue-100">Laba Bersih</p>
                </div>
              </div>

              {/* CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Trend Keuangan</h3>
                      <p className="text-sm text-slate-500 mt-1">Perbandingan 7 hari terakhir</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-xs text-slate-600">Pemasukan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-xs text-slate-600">Pengeluaran</span>
                      </div>
                    </div>
                  </div>
                  
                  {safeChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={safeChartData}>
                        <defs>
                          <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="hari" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        {/* ✅ FIX: YAxis dengan ticks konsisten */}
                        <YAxis 
                          stroke="#94a3b8" 
                          style={{ fontSize: '12px' }} 
                          domain={[0, 'auto']}
                          ticks={[0, 2000000, 4000000, 6000000, 8000000, 10000000]}
                          tickFormatter={(value) => `${(value / 1000000).toFixed(0)}jt`}
                        />
                        <Tooltip 
                          formatter={(value) => formatRupiah(value)}
                          contentStyle={{ 
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                          }}
                        />
                        <Area type="monotone" dataKey="pemasukan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPemasukan)" />
                        <Area type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorPengeluaran)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-80 flex items-center justify-center text-slate-400">
                      <p>Belum ada data transaksi untuk grafik</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-1">Kategori Pengeluaran</h3>
                  <p className="text-sm text-slate-500 mb-6">Breakdown pengeluaran</p>
                  
                  {safePengeluaranKategori.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={safePengeluaranKategori}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {safePengeluaranKategori.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || '#94a3b8'} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => formatRupiah(value)} />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <div className="mt-4 space-y-2">
                        {safePengeluaranKategori.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color || '#94a3b8' }}></div>
                              <span className="text-slate-600">{item.name || 'Lainnya'}</span>
                            </div>
                            <span className="font-semibold text-slate-800">{formatRupiah(item.value || 0)}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-slate-400">
                      <p>Belum ada pengeluaran</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ TABEL TRANSAKSI */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">
                        {searchQuery ? 'Hasil Pencarian' : (showAllTransactions ? 'Semua Transaksi' : 'Transaksi Terbaru')}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {searchQuery 
                          ? `${allTransactions.length} transaksi ditemukan` 
                          : showAllTransactions 
                            ? `Menampilkan ${allTransactions.length} dari ${allTransactions.length} transaksi`
                            : `Menampilkan ${displayedTransactions.length} dari ${allTransactions.length} transaksi`
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {searchQuery && (
                        <button 
                          onClick={() => setSearchQuery('')}
                          className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                        >
                          Reset Pencarian
                        </button>
                      )}

                      {!searchQuery && allTransactions.length > 20 && (
                        <button 
                          onClick={() => setShowAllTransactions(!showAllTransactions)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          <span>{showAllTransactions ? 'Tampilkan Lebih Sedikit' : 'Lihat Semua Transaksi'}</span>
                          <ChevronRight size={16} className={`transition-transform ${showAllTransactions ? 'rotate-90' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Tanggal</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Kategori</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase">Jenis</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-600 uppercase">Nominal</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {displayedTransactions.length > 0 ? (
                        displayedTransactions.map((t) => (
                          <tr key={t.id} className="hover:bg-slate-50 transition">
                            <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                              {formatTanggal(t.tanggal)}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                              {t.kategori?.nama_kategori || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                                t.jenis === 'Pemasukan' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {t.jenis === 'Pemasukan' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                {t.jenis || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right whitespace-nowrap">
                              <span className={`text-sm font-bold ${
                                t.jenis === 'Pemasukan' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {t.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(t.nominal || 0)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center whitespace-nowrap">
                              <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-slate-400">
                            {searchQuery 
                              ? `Tidak ada transaksi dengan kata kunci "${searchQuery}"` 
                              : 'Belum ada transaksi'
                            }
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* ✅ FIX: Footer button */}
                {!showAllTransactions && !searchQuery && allTransactions.length > 20 && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                    <p className="text-sm text-slate-600 mb-3">
                      Menampilkan 20 dari {allTransactions.length} transaksi
                    </p>
                    <button
                      onClick={() => setShowAllTransactions(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                    >
                      Muat Semua Transaksi ({allTransactions.length - 20} lainnya)
                    </button>
                  </div>
                )}
              </div>

            </div>
          </>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold">Network Solution</h1>
          <p className="text-xs text-slate-400 mt-1">Financial System</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.page)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activePage === item.page
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/50'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              <User size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-slate-400">Owner</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all">
            <LogOut size={20} />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;

