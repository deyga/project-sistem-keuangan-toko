<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TransaksiPemasukan;
use App\Models\TransaksiPengeluaran;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    // INI HANYA DATA DUMY UNTUK TESTING DASHBOARD
   public function index()
    {
        // ========================================
        // SUMMARY HARI INI
        // ========================================
        $today = Carbon::today();
        
        $pemasukanHariIni = TransaksiPemasukan::whereDate('tanggal', $today)->sum('jumlah');
        $pengeluaranHariIni = TransaksiPengeluaran::whereDate('tanggal', $today)->sum('jumlah');
        $saldoHariIni = $pemasukanHariIni - $pengeluaranHariIni;
        $jumlahTransaksiHariIni = TransaksiPemasukan::whereDate('tanggal', $today)->count() 
                                + TransaksiPengeluaran::whereDate('tanggal', $today)->count();

        // ========================================
        // DATA GRAFIK: TREND 7 HARI TERAKHIR
        // ========================================
        $trend7Hari = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $trend7Hari[] = [
                'hari' => $date->isoFormat('ddd'), // Sen, Sel, Rab...
                'tanggal' => $date->format('Y-m-d'),
                'pemasukan' => TransaksiPemasukan::whereDate('tanggal', $date)->sum('jumlah'),
                'pengeluaran' => TransaksiPengeluaran::whereDate('tanggal', $date)->sum('jumlah'),
            ];
        }

        // ========================================
        // DATA GRAFIK: PENGELUARAN PER KATEGORI
        // ========================================
        $pengeluaranPerKategori = TransaksiPengeluaran::selectRaw('kategori_id, SUM(jumlah) as total')
            ->with('kategori:id,nama_kategori')
            ->whereMonth('tanggal', Carbon::now()->month)
            ->groupBy('kategori_id')
            ->orderBy('total', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->kategori->nama_kategori,
                    'value' => (float) $item->total,
                ];
            });

        // ========================================
        // TRANSAKSI TERBARU (10 TERAKHIR)
        // ========================================
        $transaksiTerbaru = collect()
            ->merge(
                TransaksiPemasukan::with('kategori', 'user')
                    ->latest('created_at')
                    ->take(5)
                    ->get()
                    ->map(fn($t) => [
                        'id' => $t->id,
                        'tanggal' => \Carbon\Carbon::parse($t->tanggal)->format('d/m/Y'),
                        'tipe' => 'Pemasukan',
                        'kategori' => $t->kategori->nama_kategori,
                        'jumlah' => $t->jumlah,
                        'keterangan' => $t->keterangan,
                    ])
            )
            ->merge(
                TransaksiPengeluaran::with('kategori', 'user')
                    ->latest('created_at')
                    ->take(5)
                    ->get()
                    ->map(fn($t) => [
                        'id' => $t->id,
                        'tanggal' => \Carbon\Carbon::parse($t->tanggal)->format('d/m/Y'),
                        'tipe' => 'Pengeluaran',
                        'kategori' => $t->kategori->nama_kategori,
                        'jumlah' => $t->jumlah,
                        'keterangan' => $t->keterangan,
                    ])
            )
            ->sortByDesc('tanggal')
            ->take(10)
            ->values();

        // ========================================
        // RETURN DATA KE REACT
        // ========================================
        return Inertia::render('Dashboard', [
            'summary' => [
                'pemasukan_hari_ini' => $pemasukanHariIni,
                'pengeluaran_hari_ini' => $pengeluaranHariIni,
                'saldo_hari_ini' => $saldoHariIni,
                'jumlah_transaksi' => $jumlahTransaksiHariIni,
            ],
            'trend7Hari' => $trend7Hari,
            'pengeluaranPerKategori' => $pengeluaranPerKategori,
            'transaksiTerbaru' => $transaksiTerbaru,
        ]);
    }

  
}
