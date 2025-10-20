// ========================================
// IMPORT LIBRARY 
// ========================================
import { Head } from '@inertiajs/react';  
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; 
import { 
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';  // grafik via recharts

// ========================================
// COMPONENT DASHBOARD
// ========================================
export default function Dashboard({ summary, trend7Hari, pengeluaranPerKategori, transaksiTerbaru }) {
    // Props di atas adalah data yang dikirim dari DashboardController.php
    // - summary: data ringkasan (pemasukan, pengeluaran, saldo hari ini)
    // - trend7Hari: data grafik line chart (7 hari terakhir)
    // - pengeluaranPerKategori: data grafik pie chart (pengeluaran per kategori)
    // - transaksiTerbaru: data tabel transaksi terbaru (10 transaksi terakhir)

    return (
        // AuthenticatedLayout 
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard Sistem Keuangan
                </h2>
            }
        >
            {/* Set title tab browser */}
            <Head title="Dashboard" />

            {/* Container */}
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* ========================================
                        SECTION 1: SUMMARY CARDS 
                        ======================================== */}
                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                        
                        {/* CARD 1: Total Pemasukan Hari Ini */}
                        <SummaryCard
                            title="Pemasukan Hari Ini"
                            value={formatRupiah(summary.pemasukan_hari_ini)}
                            icon="💵"
                            color="green"
                        />

                        {/* CARD 2: Total Pengeluaran Hari Ini */}
                        <SummaryCard
                            title="Pengeluaran Hari Ini"
                            value={formatRupiah(summary.pengeluaran_hari_ini)}
                            icon="💸"
                            color="red"
                        />

                        {/* CARD 3: Saldo/Keuntungan Hari Ini */}
                        <SummaryCard
                            title="Saldo Hari Ini"
                            value={formatRupiah(summary.saldo_hari_ini)}
                            icon="💰"
                            color="blue"
                        />

                        {/* CARD 4: Jumlah Transaksi Hari Ini */}
                        <SummaryCard
                            title="Jumlah Transaksi"
                            value={summary.jumlah_transaksi}
                            icon="📊"
                            color="purple"
                        />
                    </div>

                    {/* ========================================
                        SECTION 2: GRAFIK (LINE CHART & PIE CHART)
                        ======================================== */}
                    <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-2">
                        
                        {/* GRAFIK 1: Line Chart - Trend 7 Hari */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                📈 Trend Pemasukan vs Pengeluaran (7 Hari Terakhir)
                            </h3>
                            <TrendChart data={trend7Hari} />
                        </div>

                        {/* GRAFIK 2: Pie Chart - Pengeluaran Per Kategori */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                🥧 Pengeluaran Per Kategori (Bulan Ini)
                            </h3>
                            <CategoryChart data={pengeluaranPerKategori} />
                        </div>
                    </div>

                    {/* ========================================
                        SECTION 3: TABEL TRANSAKSI TERBARU
                        ======================================== */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            📋 Transaksi Terbaru
                        </h3>
                        <TransactionTable data={transaksiTerbaru} />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

// ========================================
// COMPONENT: SUMMARY CARD (KARTU RINGKASAN)
// ========================================
function SummaryCard({ title, value, icon, color }) {
    

    
    const colorClasses = {
        green: 'bg-green-100 border-green-500 text-green-800',
        red: 'bg-red-100 border-red-500 text-red-800',
        blue: 'bg-blue-100 border-blue-500 text-blue-800',
        purple: 'bg-purple-100 border-purple-500 text-purple-800',
    };

    return (
        <div className={`${colorClasses[color]} rounded-lg shadow-md p-6 border-l-4`}>
            <div className="flex items-center justify-between">
                <div>
                    {/* Judul card */}
                    <p className="text-sm font-semibold opacity-80">{title}</p>
                    {/* Nilai */}
                    <p className="text-2xl font-bold mt-2">{value}</p>
                </div>
                {/* Icon emoji */}
                <div className="text-4xl">{icon}</div>
            </div>
        </div>
    );
}

// ========================================
// COMPONENT: TREND CHART (LINE CHART)
// ========================================
function TrendChart({ data }) {
    // Props:
    // - data: array data trend 7 hari dari controller
    //   Format: [{ hari: 'Sen', pemasukan: 5000000, pengeluaran: 3000000 }, ...]

    return (
        // ResponsiveContainer 
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                {/* Grid background */}
                <CartesianGrid strokeDasharray="3 3" />
                
                {/*  tampilkan hari */}
                <XAxis dataKey="hari" />
                
                {/* - tampilkan angka */}
                <YAxis />
                
                {/* popup saat hover grafik */}
                <Tooltip 
                    formatter={(value) => formatRupiah(value)}  // Format angka jadi Rupiah
                    labelStyle={{ fontWeight: 'bold' }}
                />
                
                {/* keterangan warna garis */}
                <Legend />
                
                {/* Garis Pemasukan (hijau) */}
                <Line 
                    type="monotone"           
                    dataKey="pemasukan"       
                    stroke="#10b981"          
                    strokeWidth={3}           
                    name="Pemasukan"          
                />
                
                {/*  Garis Pengeluaran */}
                <Line 
                    type="monotone" 
                    dataKey="pengeluaran" 
                    stroke="#ef4444"          // Warna merah
                    strokeWidth={3} 
                    name="Pengeluaran" 
                />
            </LineChart>
        </ResponsiveContainer>
    );
}

// ========================================
// COMPONENT: CATEGORY CHART (PIE CHART)
// ========================================
function CategoryChart({ data }) {
    // Props:
    // - data: array data pengeluaran per kategori dari controller
    //   Format: [{ name: 'Pembelian Stok', value: 2500000 }, ...]

   
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}               
                    cx="50%"                  
                    cy="50%"                  
                    labelLine={false}         
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}  
                    outerRadius={100}         
                    fill="#8884d8"
                    dataKey="value"           
                >
                    {/* Loop */}
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                
                {/* Tooltip */}
                <Tooltip 
                    formatter={(value) => formatRupiah(value)}  // Format Rupiah
                />
            </PieChart>
        </ResponsiveContainer>
    );
}

// ========================================
// COMPONENT: TRANSACTION TABLE (TABEL TRANSAKSI)
// ========================================
function TransactionTable({ data }) {
    // Props:
    // - data: array 10 transaksi terbaru dari controller
    //   Format: [{ id: 1, tanggal: '13/10/2025', tipe: 'Pemasukan', kategori: 'Penjualan Tunai', jumlah: 500000, keterangan: '...' }, ...]

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                {/* HEADER TABEL */}
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipe
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Kategori
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jumlah
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keterangan
                        </th>
                    </tr>
                </thead>

                {/* BODY TABEL */}
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Loop  data transaksi */}
                    {data.map((transaksi, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            {/* Kolom Tanggal */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaksi.tanggal}
                            </td>

                            {/* Kolom Tipe */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${transaksi.tipe === 'Pemasukan' 
                                        ? 'bg-green-100 text-green-800'   
                                        : 'bg-red-100 text-red-800'       
                                    }`}>
                                    {transaksi.tipe}
                                </span>
                            </td>

                            {/* Kolom Kategori */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {transaksi.kategori}
                            </td>

                            {/* Kolom Jumlah (format Rupiah) */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                {formatRupiah(transaksi.jumlah)}
                            </td>

                            {/* Kolom Keterangan */}
                            <td className="px-6 py-4 text-sm text-gray-500">
                                {transaksi.keterangan || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Jika data kosong, tampilkan pesan */}
            {data.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Belum ada transaksi hari ini
                </div>
            )}
        </div>
    );
}

// ========================================
// HELPER FUNCTION: FORMAT RUPIAH
// ========================================
function formatRupiah(angka) {
    // Fungsi untuk format angka jadi format Rupiah
    // Input: 5000000
    // Output: "Rp 5.000.000"

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',      
        currency: 'IDR',        
        minimumFractionDigits: 0,  
    }).format(angka);
}