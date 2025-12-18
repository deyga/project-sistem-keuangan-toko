<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\TransaksiPemasukan;
use App\Models\TransaksiPengeluaran;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        $user = Auth::user();

        // Summary Hari Ini
        $pemasukanHariIni = TransaksiPemasukan::whereDate('tanggal', $today)->sum('jumlah');
        $pengeluaranHariIni = TransaksiPengeluaran::whereDate('tanggal', $today)->sum('jumlah');
        $saldoHariIni = $pemasukanHariIni - $pengeluaranHariIni;

        // Chart 7 Hari
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $chartData[] = [
                'hari' => $date->format('d M'),
                'pemasukan' => TransaksiPemasukan::whereDate('tanggal', $date)->sum('jumlah'),
                'pengeluaran' => TransaksiPengeluaran::whereDate('tanggal', $date)->sum('jumlah'),
            ];
        }

        // Recent Transactions 
        $pemasukanRaw = TransaksiPemasukan::with('kategori')
            ->latest('tanggal')
            ->get();

        $pengeluaranRaw = TransaksiPengeluaran::with('kategori')
            ->latest('tanggal')
            ->get();

    
        $recentTransactions = $pemasukanRaw->merge($pengeluaranRaw)
            ->sortByDesc('tanggal')
            ->map(function ($t) {
        
                $jenis = get_class($t) === 'App\Models\TransaksiPemasukan' ? 'Pemasukan' : 'Pengeluaran';
                
                return [
                    'id' => $t->id,  
                    'tanggal' => $t->tanggal,
                    'kategori' => $t->kategori,
                    'jenis' => $jenis,
                    'nominal' => $t->jumlah,
                    'keterangan' => $t->keterangan,
                ];
            })
            ->values();

        // Pengeluaran per Kategori
        $pengeluaranKategori = TransaksiPengeluaran::with('kategori')
            ->get()
            ->groupBy('kategori.nama_kategori')
            ->map(function ($group, $key) {
                return [
                    'name' => $key ?? 'Lain-lain',
                    'value' => $group->sum('jumlah'),
                    'color' => '#' . substr(md5($key), 0, 6),
                ];
            })
            ->values();

        return Inertia::render('Dashboard', [
            'summaryToday' => [
                'totalPemasukan' => $pemasukanHariIni,
                'totalPengeluaran' => $pengeluaranHariIni,
                'saldo' => $saldoHariIni,
            ],
            'chartData' => $chartData,
            'recentTransactions' => $recentTransactions,
            'pengeluaranKategori' => $pengeluaranKategori,
            'transaksiPemasukan' => TransaksiPemasukan::with('kategori')->latest()->get(),
            'transaksiPengeluaran' => TransaksiPengeluaran::with('kategori')->latest()->get(),
            'kategoriPemasukan' => \App\Models\KategoriPemasukan::all(),
            'kategoriPengeluaran' => \App\Models\KategoriPengeluaran::all(),

            //data user & role
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                ],
            ],
            //
        ]);
    }

    //method log out
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return redirect('/login')->with('message', 'Anda telah logout');
    }
}