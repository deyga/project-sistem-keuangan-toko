import React, { useEffect, useState } from 'react';
//tambah import(revsi)

import { router } from '@inertiajs/react'; 
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, Line, ComposedChart } from 'recharts';
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
  Mail,
  User,
  ChevronRight,
  CalendarDays,
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  HandCoins,
  BanknoteArrowUp,
  DiamondPercent,
  Database

} from 'lucide-react';

import TransaksiPemasukan from './Pemasukan/Index';
import TransaksiPengeluaran from './pengeluaran/TransaksiPengeluaran';
import LaporanKeuangan from './laporan/LaporanKeuangan';
import SettingBackup from './Setting/Backup';
import EmailInbox  from './Email/EmailInbox';

const Dashboard = ({ 
  summaryToday = { totalPemasukan: 0, totalPengeluaran: 0, saldo: 0 },
  chartData = [],
  recentTransactions = [],
  pengeluaranKategori = [],
  transaksiPemasukan = [],
  transaksiPengeluaran = [],
  kategoriPemasukan = [],
  kategoriPengeluaran = [],
  auth = { user: { name: 'User', role: 'kasir' } } //auth role login
}) => {

  //function logut
  const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin logout?')) {
    router.post('/logout');
  }
  };
  
  
  const [activePage, setActivePage] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('7-hari');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [unreadEmailCount, setUnreadEmailCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);

  // SAFE DATA
  const safeSummary = {
    totalPemasukan: summaryToday?.totalPemasukan || 0,
    totalPengeluaran: summaryToday?.totalPengeluaran || 0,
    saldo: summaryToday?.saldo || 0
  };

  const safeChartData = Array.isArray(chartData) ? chartData : [];
  const safeRecentTransactions = Array.isArray(recentTransactions) ? recentTransactions : [];
  const safePengeluaranKategori = Array.isArray(pengeluaranKategori) ? pengeluaranKategori : [];
  
 //loadEmail

 useEffect(() => {
  const loadUnreadCount = () => {
    fetch('/api/emails/unread-count', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin'
    })
      .then(res => res.json())
      .then(data => {
        setUnreadEmailCount(data.count || 0);
      })
      .catch(err => {
        console.error('Error loading email count:', err);
      });
  };

  // Load pertama kali
  loadUnreadCount();

  // Auto refresh setiap 30 detik
  const interval = setInterval(loadUnreadCount, 30000);

  return () => clearInterval(interval);
}, []);



 // React.useEffect(() => {
 // if (activePage === 'email-inbox') {
    //fetch('/api/email/inbox')
   // axios.get('/api/emails/unread-count')
     // .then(res => res.json())
     // setUnreadEmailCount(res.data.count)
     // .then(data => setInboxData(data.emails));
 // }
 // }, [activePage]);


   

 //
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

  //logic filtered periode
   const filterByPeriod = (transactions, period) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  
  return transactions.filter(t => {
    const transDate = new Date(t.tanggal);
    transDate.setHours(0, 0, 0, 0);
    
    switch(period) {
      case 'hari-ini':
        return transDate.getTime() === today.getTime();
      
      case '7-hari':
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6); 
        return transDate >= sevenDaysAgo && transDate <= today;
      
      case '30-hari':
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 29); 
        return transDate >= thirtyDaysAgo && transDate <= today;
      
      case 'bulan-ini':
        return transDate.getMonth() === today.getMonth() && 
               transDate.getFullYear() === today.getFullYear();
      
      default:
        return true; 
    }
  });
};
   
  // LOGIC GABUNGKAN SEMUA TRANSAKSI 

  const combinedTransactions = [
  ...(Array.isArray(transaksiPemasukan) ? transaksiPemasukan.map(t => ({ 
    ...t, 
    jenis: 'Pemasukan' 
  })) : []),
  ...(Array.isArray(transaksiPengeluaran) ? transaksiPengeluaran.map(t => ({ 
    ...t, 
    jenis: 'Pengeluaran' 
  })) : [])
];

//Filter berdasarkan PERIODE 
const periodFilteredTransactions = filterByPeriod(combinedTransactions, selectedPeriod);

// Filter berdasarkan SEARCH QUERY
const allTransactions = periodFilteredTransactions
  .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
  .filter(t => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const kategoriNama = (t.kategori?.nama_kategori || '').toLowerCase();
    const keterangan = (t.keterangan || '').toLowerCase();
    const nominal = (t.jumlah || 0).toString(); 
    const tanggal = formatTanggal(t.tanggal).toLowerCase();
    
    return kategoriNama.includes(query) || 
           keterangan.includes(query) || 
           nominal.includes(query) ||
           tanggal.includes(query);
  });

     //Pagination 
        const displayedTransactions = showAllTransactions ? allTransactions : allTransactions.slice(0, 20);

     // Hitung SUMMARY berdasarkan periode yang dipilih
       const totalPemasukanPeriod = periodFilteredTransactions
        .filter(t => t.jenis === 'Pemasukan')
        //.reduce((sum, t) => sum +(t.jumlah || 0), 0);
        .reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0); 

        const totalPengeluaranPeriod = periodFilteredTransactions
        .filter(t => t.jenis === 'Pengeluaran')
        //.reduce((sum, t) => sum +(t.jumlah || 0), 0);
        .reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);

        const saldoPeriod = totalPemasukanPeriod - totalPengeluaranPeriod;

       //revisi//

       //logic generate data 30 hari 
       const generateMonthlyChartData = () => {
         const today = new Date();
         const monthData =[];

         //loop generate 30 h
         for (let i = 29; i>=0; i--) {
           const date = new Date(today);
           date.setDate(today.getDate() -i);
           
           date.setHours(0,0,0,0);
           const dateStr = date.toISOString().split('T')[0];
           const dayName = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });

           //pemasukan hari ini
           const pemasukanHariIni = (transaksiPemasukan || [])
           .filter(t => {
           const tDate = new Date(t.tanggal);
           tDate.setHours(0, 0, 0, 0);
           return tDate.getTime() === date.getTime();
           })
           .reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0)

           // Hitung pengeluaran hari ini
           const pengeluaranHariIni = (transaksiPengeluaran || [])
            .filter(t => {
            const tDate = new Date(t.tanggal);
            tDate.setHours(0, 0, 0, 0);
            return tDate.getTime() === date.getTime();
            })
            .reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
    
           // Hitung saldo (selisih)
           const saldo = pemasukanHariIni - pengeluaranHariIni;
    
           // Hitung jumlah transaksi
           const jumlahTransaksi = 
           (transaksiPemasukan || []).filter(t => {
           const tDate = new Date(t.tanggal);
           tDate.setHours(0, 0, 0, 0);
           return tDate.getTime() === date.getTime();
           }).length +
           (transaksiPengeluaran || []).filter(t => {
           const tDate = new Date(t.tanggal);
           tDate.setHours(0, 0, 0, 0);
           return tDate.getTime() === date.getTime();
           }).length;
    
           monthData.push({
           date: dateStr,
           hari: dayName,
           pemasukan: pemasukanHariIni,
           pengeluaran: pengeluaranHariIni,
           saldo: saldo,
           count: jumlahTransaksi
          });
         }
          return monthData;
       }
  
      const monthlyChartData = generateMonthlyChartData();


        //LOGIC CALENDER DLL+

          // LOGIC UNTUK FINANCIAL CALENDAR
const getFilteredTransactionsByDate = (date) => {
  if (!date) return { pemasukan: [], pengeluaran: [] };
  
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  const pemasukan = transaksiPemasukan.filter(t => {
    const transDate = new Date(t.tanggal);
    transDate.setHours(0, 0, 0, 0);
    return transDate.getTime() === targetDate.getTime();
  });
  
  const pengeluaran = transaksiPengeluaran.filter(t => {
    const transDate = new Date(t.tanggal);
    transDate.setHours(0, 0, 0, 0);
    return transDate.getTime() === targetDate.getTime();
  });
  
  return { pemasukan, pengeluaran };
};

// Data untuk tanggal yang dipilih atau hari ini
const currentDate = selectedDate || new Date().toISOString().split('T')[0];
const { pemasukan: pemasukanHarian, pengeluaran: pengeluaranHarian } = getFilteredTransactionsByDate(currentDate);

const totalPemasukanHarian = pemasukanHarian.reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
const totalPengeluaranHarian = pengeluaranHarian.reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
const saldoHarian = totalPemasukanHarian - totalPengeluaranHarian;

// Format tanggal untuk label
const tanggalLabel = new Date(currentDate).toLocaleDateString('id-ID', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});   




  // MENU ITEMS

  const menuItems = [
    { id: 'dashboard', page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pemasukan', page: 'pemasukan', label: 'Transaksi Pemasukan', icon: TrendingUp },
    { id: 'pengeluaran', page: 'pengeluaran', label: 'Transaksi Pengeluaran', icon: TrendingDown },
    { id: 'laporan', page: 'laporan', label: 'Laporan Keuangan', icon: FileText },
    { id: 'Setting', page: 'Setting', label: 'Settings', icon: Settings },
    { id: 'email', page: 'email', label: 'Email Internal', icon: Mail, badge: unreadEmailCount },
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
      
      case 'email-inbox':
      case 'email-sent':
      case 'email':
      return <EmailInbox onBack={() => setActivePage('dashboard')} />;

      case 'Setting':
       // return  <SettingBackup backups={[]} />;
       return (
    <div className="p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Settings</h2>
        
        <button
          onClick={() => router.visit(route('backup.index'))}
          className="flex items-center gap-3 px-6 py-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition w-full text-left"
        >
          <Database size={24} className="text-blue-600" />
          <div>
            <p className="font-semibold text-slate-800">Database Backup</p>
            <p className="text-sm text-slate-500">Kelola backup database</p>
          </div>
        </button>
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
                  {/* FIX: Tambah value dan onChange */}
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

                  {/* email  */}
                  {/*className="relative p-2 hover:bg-slate-100 rounded-lg transition"> */}
                  {/*  <Bell size={20} className="text-slate-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}

                  <button  
                     onClick={() => setActivePage('email')}
                     className="relative p-2 hover:bg-slate-100 rounded-lg transition group"
                     title="Email Internal"
                     >
                   
                   <Mail size={20} className="text-slate-600 group-hover:text-blue-600 transition" />
                     {unreadEmailCount > 0 && (
                      <>
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadEmailCount > 9 ? '9+' : unreadEmailCount}
                     </span>
                      </>
                      )}  
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
                      <BanknoteArrowUp className="text-green-600" size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                      <ArrowUpRight size={16} />
                      <span>+12%</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Total Pemasukan</p>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">
                    {formatRupiah(totalPemasukanPeriod)}
                  </h3>
                  {/*revisi*/}
                  <p className="text-xs text-slate-400">
                   {selectedPeriod === 'hari-ini' ? 'Hari ini' : 
                   selectedPeriod === '7-hari' ? '7 hari terakhir' :
                   selectedPeriod === '30-hari' ? '30 hari terakhir' : 'Bulan ini'}
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <DiamondPercent className="text-red-600" size={24} />
                    </div>
                    <div className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                      <ArrowDownRight size={16} />
                      <span>-5%</span>
                    </div>
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Total Pengeluaran</p>
                  <h3 className="text-3xl font-bold text-slate-800 mb-2">
                    {formatRupiah(totalPengeluaranPeriod)}
                  </h3>
                  {/*revisi*/}
                  <p className="text-xs text-slate-400">
                    {selectedPeriod === 'hari-ini' ? 'Hari ini' : 
                     selectedPeriod === '7-hari' ? '7 hari terakhir' :
                     selectedPeriod === '30-hari' ? '30 hari terakhir' : 'Bulan ini'}
                  </p>
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
                    {formatRupiah(saldoPeriod)}
                  </h3>
                  {/*revisi*/}
                  <p className="text-xs text-blue-100">
                   {selectedPeriod === 'hari-ini' ? 'Hari ini' : 
                    selectedPeriod === '7-hari' ? '7 hari terakhir' :
                    selectedPeriod === '30-hari' ? '30 hari terakhir' : 'Bulan ini'}
                  </p>
                </div>
              </div>

              {/* tambahkan halaman baru */}

{/* TARGET PROGRESS BARS */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  
  {/* Target Pemasukan Bulanan */}
  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-200 p-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-bold text-green-800">Target Pemasukan Bulan Ini</h3>
      <div className="p-2 bg-green-600 rounded-lg">
        <HandCoins className="text-white" size={20} />
      </div>
    </div>
    
    {(() => {
      const targetPemasukan = 50000000; 
      const bulanIni = filterByPeriod(transaksiPemasukan, 'bulan-ini');
      const totalBulanIni = bulanIni.reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
      const percentage = Math.min((totalBulanIni / targetPemasukan) * 100, 100);
      
      return (
        <>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-sm text-green-700">Realisasi</p>
              <p className="text-2xl font-bold text-green-800">
                {formatRupiah(totalBulanIni)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700">Target</p>
              <p className="text-xl font-semibold text-green-800">
                {formatRupiah(targetPemasukan)}
              </p>
            </div>
          </div>
          
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-green-700">
                  Progress
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-green-700">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-green-200">
              <div 
                style={{ width: `${percentage}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-600 transition-all duration-500"
              ></div>
            </div>
          </div>
          
          <p className="text-xs text-green-600 mt-3">
            {percentage >= 100 
              ? 'Target tercapai!' 
              : `Kurang ${formatRupiah(targetPemasukan - totalBulanIni)} lagi`
            }
          </p>
        </>
      );
    })()}
  </div>

  {/* Budget Pengeluaran Bulanan */}
  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl shadow-sm border border-red-200 p-6">
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-lg font-bold text-red-800">Budget Pengeluaran Bulan Ini</h3>
      <div className="p-2 bg-red-600 rounded-lg">
        <Wallet className="text-white" size={20} />
      </div>
    </div>
    
    {(() => {
      const budgetPengeluaran = 40000000; 
      const bulanIni = filterByPeriod(transaksiPengeluaran, 'bulan-ini');
      const totalBulanIni = bulanIni.reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);
      const percentage = Math.min((totalBulanIni / budgetPengeluaran) * 100, 100);
      const isOverBudget = totalBulanIni > budgetPengeluaran;
      
      return (
        <>
          <div className="flex items-end justify-between mb-2">
            <div>
              <p className="text-sm text-red-700">Terpakai</p>
              <p className="text-2xl font-bold text-red-800">
                {formatRupiah(totalBulanIni)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-700">Budget</p>
              <p className="text-xl font-semibold text-red-800">
                {formatRupiah(budgetPengeluaran)}
              </p>
            </div>
          </div>
          
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-red-700">
                  Penggunaan
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-red-700">
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-red-200">
              <div 
                style={{ width: `${Math.min(percentage, 100)}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                  isOverBudget ? 'bg-orange-600' : 'bg-red-600'
                }`}
              ></div>
            </div>
          </div>
          
          <p className="text-xs text-red-600 mt-3">
            {isOverBudget 
              ? `⚠️Over budget ${formatRupiah(totalBulanIni - budgetPengeluaran)}!` 
              : `Sisa budget ${formatRupiah(budgetPengeluaran - totalBulanIni)}`
            }
          </p>
        </>
      );
    })()}
  </div>
</div>

{/* MINI CALENDAR + RECENT ACTIVITY */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
  
  {/* Mini Calendar */}
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-slate-800">Kalender Transaksi</h3>
      <Calendar className="text-slate-400" size={20} />
    </div>
    
    {(() => {
      const today = new Date();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const firstDay = new Date(currentYear, currentMonth, 1).getDay();
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      
      // Hitung transaksi per tanggal bulan ini
      const transactionsThisMonth = combinedTransactions.filter(t => {
        const d = new Date(t.tanggal);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      
      const transactionsByDate = {};
      transactionsThisMonth.forEach(t => {
        const date = new Date(t.tanggal).getDate();
        transactionsByDate[date] = (transactionsByDate[date] || 0) + 1;
      });
      
      return (
        <>
          <div className="text-center mb-4">
            <p className="text-sm font-semibold text-slate-600">
              {monthNames[currentMonth]} {currentYear}
            </p>
          </div>
          
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(day => (
              <div key={day} className="text-xs font-semibold text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const date = i + 1;
              const isToday = date === today.getDate();
              const hasTransactions = transactionsByDate[date];
              
              return (
                <div
                  key={date}
                  className={`aspect-square flex items-center justify-center text-xs rounded-lg relative ${
                    isToday 
                      ? 'bg-blue-600 text-white font-bold' 
                      : hasTransactions 
                        ? 'bg-green-100 text-green-700 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {date}
                  {hasTransactions && !isToday && (
                    <div className="absolute bottom-0.5 w-1 h-1 bg-green-600 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span className="text-slate-600">Hari Ini</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span className="text-slate-600">Ada Transaksi</span>
              </div>
            </div>
          </div>
        </>
      );
    })()}
  </div>

  {/* Recent Activity Timeline */}
  <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-bold text-slate-800">Aktivitas Terbaru</h3>
      <button 
        onClick={() => setActivePage('dashboard')}
        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
      >
        Lihat Semua →
      </button>
    </div>
    
    {allTransactions.length > 0 ? (
      <div className="space-y-3">
        {allTransactions.slice(0, 5).map((t, index) => (
          <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition">
            <div className={`p-2 rounded-lg ${
              t.jenis === 'Pemasukan' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {t.jenis === 'Pemasukan' 
                ? <TrendingUp size={16} className="text-green-600" />
                : <TrendingDown size={16} className="text-red-600" />
              }
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-slate-800 text-sm">
                    {t.kategori?.nama_kategori || 'Tanpa Kategori'}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {t.keterangan || 'Tidak ada keterangan'}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${
                    t.jenis === 'Pemasukan' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {t.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(t.jumlah)}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatTanggal(t.tanggal)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="py-12 text-center text-slate-400">
        <FileText className="mx-auto mb-2" size={32} />
        <p className="text-sm">Belum ada transaksi</p>
      </div>
    )}
    
    {allTransactions.length > 5 && (
      <div className="mt-4 pt-3 border-t border-slate-200 text-center">
        <button 
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Tampilkan {allTransactions.length - 5} transaksi lainnya
        </button>
      </div>
    )}
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
                      <AreaChart data={safeChartData}
                       margin={{ top: 10, right: 30, left: 20, bottom: 5 }}    
                      >
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
                        {/*: YAxis dengan ticks konsisten */}
                        <YAxis 
                          stroke="#94a3b8" 
                          style={{ fontSize: '12px' }} 
                          domain={[0, 'auto']}
                          tickFormatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}jt`;
                            if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`;
                            return value;
                           }}
                           width={50}
                         
                         
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
                 
                 {/* composerd chart data 30 hari*/}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h3 className="text-lg font-bold text-slate-800">Analisis Keuangan 30 Hari</h3>
      <p className="text-sm text-slate-500 mt-1">Kombinasi Line-Bar-Area Chart dengan detail transaksi</p>
    </div>
    <div className="flex gap-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span className="text-xs text-slate-600">Saldo (Area)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-green-500"></div>
        <span className="text-xs text-slate-600">Pemasukan (Bar)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-red-500"></div>
        <span className="text-xs text-slate-600">Pengeluaran (Bar)</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-orange-500"></div>
        <span className="text-xs text-slate-600">Jumlah Transaksi (Line)</span>
      </div>
    </div>
  </div>
  
  {monthlyChartData.length > 0 ? (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={monthlyChartData}>
        <defs>
          <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis 
          dataKey="hari" 
          stroke="#94a3b8" 
          style={{ fontSize: '11px' }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis 
          yAxisId="left"
          stroke="#94a3b8" 
          style={{ fontSize: '12px' }}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}jt`}
        />
        <YAxis 
          yAxisId="right"
          orientation="right"
          stroke="#f97316" 
          style={{ fontSize: '12px' }}
          label={{ value: 'Transaksi', angle: 90, position: 'insideRight' }}
        />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'count') return [value, 'Jumlah Transaksi'];
            return [formatRupiah(value), name];
          }}
          contentStyle={{ 
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        />
        
        <Area 
          yAxisId="left"
          type="monotone" 
          dataKey="saldo" 
          fill="url(#colorSaldo)" 
          stroke="#3b82f6"
          strokeWidth={2}
          name="Saldo"
        />
        
        <Bar 
          yAxisId="left"
          dataKey="pemasukan" 
          fill="#10b981"
          name="Pemasukan"
          radius={[8, 8, 0, 0]}
        />
        
        <Bar 
          yAxisId="left"
          dataKey="pengeluaran" 
          fill="#ef4444"
          name="Pengeluaran"
          radius={[8, 8, 0, 0]}
        />
        
        <Line 
          yAxisId="right"
          type="monotone" 
          dataKey="count" 
          stroke="#f97316"
          strokeWidth={3}
          dot={{ fill: '#f97316', r: 4 }}
          name="Jumlah Transaksi"
        />
      </ComposedChart>
    </ResponsiveContainer>
  ) : (
    <div className="h-96 flex items-center justify-center text-slate-400">
      <p>Belum ada data transaksi untuk chart bulanan</p>
    </div>
  )}
  
  {/* Summary Stats */}
  <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-200">
    <div className="text-center">
      <p className="text-xs text-slate-500 mb-1">Total Pemasukan</p>
      <p className="text-lg font-bold text-green-600">
        {formatRupiah(monthlyChartData.reduce((sum, d) => sum + d.pemasukan, 0))}
      </p>
    </div>
    <div className="text-center">
      <p className="text-xs text-slate-500 mb-1">Total Pengeluaran</p>
      <p className="text-lg font-bold text-red-600">
        {formatRupiah(monthlyChartData.reduce((sum, d) => sum + d.pengeluaran, 0))}
      </p>
    </div>
    <div className="text-center">
      <p className="text-xs text-slate-500 mb-1">Saldo Akhir</p>
      <p className="text-lg font-bold text-blue-600">
        {formatRupiah(monthlyChartData.reduce((sum, d) => sum + d.saldo, 0))}
      </p>
    </div>
    <div className="text-center">
      <p className="text-xs text-slate-500 mb-1">Total Transaksi</p>
      <p className="text-lg font-bold text-orange-600">
        {monthlyChartData.reduce((sum, d) => sum + d.count, 0)}
      </p>
    </div>
  </div>
</div>
              

              {/* */}


              {/* TABEL TRANSAKSI */}
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
                                {t.jenis === 'Pemasukan' ? '+' : '-'} {formatRupiah(t.jumlah || 0)}
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
                
                {/* Footer button */}
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
        
      {/*items badge */}

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
                 {item.badge > 0 && (
                 <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                 {item.badge > 9 ? '9+' : item.badge}
                 </span>
                 )}
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
             {/* <p className="text-sm font-semibold">Admin User</p> */}
             {/* <p className="text-xs text-slate-400">Owner</p> */}
             
             <p className="text-sm font-semibold">{auth.user.name}</p>
             <p className="text-xs text-slate-400">
              {auth.user.role === 'admin' ? 'Administrator' : 'Kasir'}
             </p>

            </div>
          </div>
          <button 
           onClick={handleLogout}
           className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600 hover:text-white transition-all">
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

