import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Dashboard({ summary, trend7Hari, pengeluaranPerKategori, transaksiTerbaru }) {
    
    // Testing: Tampilkan data di console browser
    console.log('Summary:', summary);
    console.log('Trend 7 Hari:', trend7Hari);
    console.log('Pengeluaran Per Kategori:', pengeluaranPerKategori);
    console.log('Transaksi Terbaru:', transaksiTerbaru);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard Sistem Keuangan
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    
                    {/* TESTING:(data dummy) */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h3 className="text-2xl font-bold mb-4">📊 Summary Hari Ini (Test)</h3>
                        
                        <div className="space-y-2">
                            <p className="text-lg">
                                💵 Pemasukan: <strong>Rp {summary?.pemasukan_hari_ini?.toLocaleString('id-ID') || 0}</strong>
                            </p>
                            <p className="text-lg">
                                💸 Pengeluaran: <strong>Rp {summary?.pengeluaran_hari_ini?.toLocaleString('id-ID') || 0}</strong>
                            </p>
                            <p className="text-lg">
                                💰 Saldo: <strong>Rp {summary?.saldo_hari_ini?.toLocaleString('id-ID') || 0}</strong>
                            </p>
                            <p className="text-lg">
                                📊 Jumlah Transaksi: <strong>{summary?.jumlah_transaksi || 0}</strong>
                            </p>
                        </div>
                    </div>

                    {/* TEST:(data dummy) */}
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h3 className="text-2xl font-bold mb-4">📈 Trend 7 Hari (Test - Tanpa Grafik)</h3>
                        
                        {trend7Hari && trend7Hari.length > 0 ? (
                            <ul className="space-y-2">
                                {trend7Hari.map((item, index) => (
                                    <li key={index} className="border-b pb-2">
                                        <strong>{item.hari}</strong>: 
                                        Pemasukan Rp {item.pemasukan.toLocaleString('id-ID')} | 
                                        Pengeluaran Rp {item.pengeluaran.toLocaleString('id-ID')}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">Tidak ada data</p>
                        )}
                    </div>

                    {/* TEST: (data dummy*/}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-2xl font-bold mb-4">📋 Transaksi Terbaru (Test)</h3>
                        
                        {transaksiTerbaru && transaksiTerbaru.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {transaksiTerbaru.map((t, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{t.tanggal}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                        t.tipe === 'Pemasukan' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {t.tipe}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">{t.kategori}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                                                    Rp {t.jumlah.toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-500">Tidak ada transaksi</p>
                        )}
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}