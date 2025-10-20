<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TransaksiPemasukan;
use App\Models\KategoriPemasukan;
use Inertia\Inertia;

class PemasukanController extends Controller
{
    //
     public function index()
    {
        $transaksi = TransaksiPemasukan::with('kategori', 'user')
            ->latest('tanggal')
            ->paginate(10);

        $kategori = KategoriPemasukan::all();

        return Inertia::render('Pemasukan/Index', [
            'transaksi' => $transaksi,
            'kategori' => $kategori,
        ]);
    }

    // transaksi baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'kategori_id' => 'required|exists:kategori_pemasukan,id',
            'jumlah' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        TransaksiPemasukan::create([
            'tanggal' => $validated['tanggal'],
            'kategori_id' => $validated['kategori_id'],
            'jumlah' => $validated['jumlah'],
            'keterangan' => $validated['keterangan'],
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('pemasukan.index')
            ->with('success', 'Transaksi pemasukan berhasil ditambahkan');
    }

    // Update transaksi
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'kategori_id' => 'required|exists:kategori_pemasukan,id',
            'jumlah' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $transaksi = TransaksiPemasukan::findOrFail($id);
        $transaksi->update($validated);

        return redirect()->route('pemasukan.index')
            ->with('success', 'Transaksi berhasil diupdate');
    }

    // Hapus transaksi
    public function destroy($id)
    {
        $transaksi = TransaksiPemasukan::findOrFail($id);
        $transaksi->delete();

        return redirect()->route('pemasukan.index')
            ->with('success', 'Transaksi berhasil dihapus');
    }


}
