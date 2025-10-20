<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TransaksiPengeluaran;
use App\Models\KategoriPengeluaran;
use Inertia\Inertia;

class PengeluaranController extends Controller
{
    //
    public function index()
    {
        $transaksi = TransaksiPengeluaran::with('kategori', 'user')
            ->latest('tanggal')
            ->paginate(10);

        $kategori = KategoriPengeluaran::all();

        return Inertia::render('Pengeluaran/Index', [
            'transaksi' => $transaksi,
            'kategori' => $kategori,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'kategori_id' => 'required|exists:kategori_pengeluaran,id',
            'jumlah' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'bukti_file' => 'nullable|image|max:2048', // max 2MB
        ]);

        
        $buktiFi = null;
        if ($request->hasFile('bukti_file')) {
            $buktiFile = $request->file('bukti_file')->store('bukti', 'public');
        }

        TransaksiPengeluaran::create([
            'tanggal' => $validated['tanggal'],
            'kategori_id' => $validated['kategori_id'],
            'jumlah' => $validated['jumlah'],
            'keterangan' => $validated['keterangan'],
            'bukti_file' => $buktiFile,
            'user_id' => auth()->id(),
        ]);

        return redirect()->route('pengeluaran.index')
            ->with('success', 'Transaksi pengeluaran berhasil ditambahkan');
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
            'kategori_id' => 'required|exists:kategori_pengeluaran,id',
            'jumlah' => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
            'bukti_file' => 'nullable|image|max:2048',
        ]);

        $transaksi = TransaksiPengeluaran::findOrFail($id);

        
        if ($request->hasFile('bukti_file')) {
           
            if ($transaksi->bukti_file) {
                \Storage::disk('public')->delete($transaksi->bukti_file);
            }
            $validated['bukti_file'] = $request->file('bukti_file')->store('bukti', 'public');
        }

        $transaksi->update($validated);

        return redirect()->route('pengeluaran.index')
            ->with('success', 'Transaksi berhasil diupdate');
    }

    public function destroy($id)
    {
        $transaksi = TransaksiPengeluaran::findOrFail($id);
        
        
        if ($transaksi->bukti_file) {
            \Storage::disk('public')->delete($transaksi->bukti_file);
        }
        
        $transaksi->delete();

        return redirect()->route('pengeluaran.index')
            ->with('success', 'Transaksi berhasil dihapus');
    }
}
