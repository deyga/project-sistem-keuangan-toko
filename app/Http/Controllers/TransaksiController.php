<?php

namespace App\Http\Controllers;

use App\Models\TransaksiPemasukan;
use App\Models\TransaksiPengeluaran;
use Illuminate\Http\Request;

class TransaksiController extends Controller
{
    //
     public function pemasukan()
    {
        $data = TransaksiPemasukan::with(['kategori', 'user'])->get();
        return view('transaksi.pemasukan', compact('data'));
    }

    // Menampilkan semua pengeluaran
    public function pengeluaran()
    {
        $data = TransaksiPengeluaran::with(['kategori', 'user'])->get();
        return view('transaksi.pengeluaran', compact('data'));
    }

}
